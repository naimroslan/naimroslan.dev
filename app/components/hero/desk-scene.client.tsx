import { useEffect, useRef, useState } from "react";
import {
  Line,
  Mesh,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

import type { Theme } from "~/hooks/use-theme";
import portrait from "~/assets/naimroslan.png";

import { createOrbitController } from "./orbit-controller";
import { createDiorama } from "./scene/diorama";
import { applyTheme, createContactShadow, createLighting, type SceneLights } from "./scene/lighting";
import { createMaterialLibrary } from "./scene/palette";

const FOV_DEG = 32;
const NEAR_PLANE = 0.1;
const FAR_PLANE = 20;
const BASE_RADIUS = 5.4;
/** Pull the camera back on portrait-ish canvases so the desk still fits. */
const NARROW_ASPECT_BOOST = 0.45;
const DESKTOP_MAX_DPR = 2;
const TOUCH_MAX_DPR = 1.5;
const MAX_FRAME_DELTA_S = 0.05;
const MS_PER_SECOND = 1000;
/**
 * Over the figure's left shoulder, matching the owner's reference. A pure
 * side-on view reads the desk end-on and hides the screen entirely.
 */
const START_AZIMUTH_RAD = 2.55;

// Shifted off centre in x: the floor plant sits to the desk's right, so the
// scene's own centre is not the desk's.
const TARGET = new Vector3(-0.22, 0.74, -0.05);

const fitRadius = (aspect: number) =>
  aspect >= 1 ? BASE_RADIUS : BASE_RADIUS * (1 + (1 - aspect) * NARROW_ASPECT_BOOST);

export interface DeskSceneProps {
  theme: Theme;
}

export default function DeskScene({ theme }: DeskSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const lightsRef = useRef<SceneLights | null>(null);
  const needsRenderRef = useRef(true);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // The canvas is created per effect rather than living in JSX. Teardown ends
    // in forceContextLoss(), and a canvas that has lost its context can never
    // obtain another one -- so reusing one element across renderer lifetimes
    // breaks every remount after the first, which StrictMode guarantees.
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      // No WebGL (or it is blocked): fall back to the photo rather than
      // leaving an empty hole in the hero.
      canvas.remove();
      setUnsupported(true);
      return;
    }

    // Tone mapping is left at the default NoToneMapping on purpose: ACES or AgX
    // would desaturate the maroon and olive and lift the blacks toward grey,
    // which is the opposite of what flat low-poly shading wants.
    const maxPixelRatio = window.matchMedia("(pointer: coarse)").matches
      ? TOUCH_MAX_DPR
      : DESKTOP_MAX_DPR;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    rendererRef.current = renderer;

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV_DEG, 1, NEAR_PLANE, FAR_PLANE);

    const materials = createMaterialLibrary();
    const lights = createLighting();
    const shadow = createContactShadow();
    lightsRef.current = lights;

    scene.add(lights.hemisphere, lights.key, lights.fill, lights.screen);
    const diorama = createDiorama(materials);
    scene.add(shadow.mesh, diorama.root);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Reduced motion holds the terminal on a static frame, matching the camera.
    const animateScreens = !prefersReducedMotion;
    const controller = createOrbitController(canvas, {
      radius: BASE_RADIUS,
      target: TARGET,
      startAzimuth: START_AZIMUTH_RAD,
      autoRotate: !prefersReducedMotion,
    });

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;

      const aspect = clientWidth / clientHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      controller.setRadius(fitRadius(aspect));
      renderer.setSize(clientWidth, clientHeight, false);
    };
    resize();

    let frameId = 0;
    let running = false;
    let lastTime = 0;
    let onScreen = false;

    const renderFrame = (time: number) => {
      frameId = requestAnimationFrame(renderFrame);
      const deltaSeconds =
        lastTime === 0
          ? 0
          : Math.min((time - lastTime) / MS_PER_SECOND, MAX_FRAME_DELTA_S);
      lastTime = time;

      // A static scene (reduced motion, settled camera, idle screens) stops
      // drawing entirely rather than repainting an identical frame at 60fps on
      // someone's battery. The terminal steps ~6 times a second, so an animating
      // screen costs six redraws a second, not sixty.
      const moved = controller.update(deltaSeconds, camera);
      const animated = animateScreens && diorama.update(time / MS_PER_SECOND);
      if (moved || animated || needsRenderRef.current) {
        needsRenderRef.current = false;
        renderer.render(scene, camera);
      }
    };

    // Only animate while the hero is actually on screen and the tab is in
    // front — an orbiting canvas is not worth the battery otherwise.
    const syncRunning = () => {
      const shouldRun = onScreen && !document.hidden;
      if (shouldRun === running) return;

      running = shouldRun;
      if (shouldRun) {
        lastTime = 0;
        needsRenderRef.current = true;
        frameId = requestAnimationFrame(renderFrame);
      } else {
        cancelAnimationFrame(frameId);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const visibilityObserver = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      syncRunning();
    });
    visibilityObserver.observe(container);

    document.addEventListener("visibilitychange", syncRunning);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", syncRunning);
      controller.dispose();

      // Line covers the LineSegments used for the outlines, which are not
      // Mesh instances and would otherwise leak their EdgesGeometry.
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof Line) object.geometry.dispose();
      });
      materials.dispose();
      shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();

      rendererRef.current = null;
      lightsRef.current = null;
    };
  }, []);

  // Runs after the setup effect on mount, so this also applies the initial theme.
  useEffect(() => {
    const lights = lightsRef.current;
    if (!lights) return;

    applyTheme(lights, theme);
    // Lighting changed, so the next frame must draw even if the camera is settled.
    needsRenderRef.current = true;
  }, [theme]);

  if (unsupported) {
    return (
      <div className="flex h-full w-full items-end justify-center">
        <img
          src={portrait}
          alt="Naim Roslan"
          className="max-h-full w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-grab overscroll-x-contain active:cursor-grabbing"
      role="img"
      aria-label="A low-poly 3D model of Naim Roslan at his desk, with a monitor, laptop, split keyboard and a plant. Drag to spin it."
    >
    </div>
  );
}
