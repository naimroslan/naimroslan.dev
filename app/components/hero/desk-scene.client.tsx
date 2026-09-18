import { useEffect, useRef, useState } from "react";
import {
  Mesh,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  type LineBasicMaterial,
} from "three";

import type { Theme } from "~/hooks/use-theme";
import portrait from "~/assets/naimroslan.png";

import { createOrbitController } from "./orbit-controller";
import { createCharacter } from "./scene/character";
import { createDesk } from "./scene/desk";
import { applyTheme, createContactShadow, createLighting, type SceneLights } from "./scene/lighting";
import { applyOutlineTheme, createMaterialLibrary, createOutlineMaterial } from "./scene/palette";

const FOV_DEG = 32;
const NEAR_PLANE = 0.1;
const FAR_PLANE = 20;
const BASE_RADIUS = 3;
/** Pull the camera back on portrait-ish canvases so the desk still fits. */
const NARROW_ASPECT_BOOST = 0.75;
const DESKTOP_MAX_DPR = 2;
const TOUCH_MAX_DPR = 1.5;
const MAX_FRAME_DELTA_S = 0.05;
const MS_PER_SECOND = 1000;

const TARGET = new Vector3(0, 0.72, -0.22);

const fitRadius = (aspect: number) =>
  aspect >= 1 ? BASE_RADIUS : BASE_RADIUS * (1 + (1 - aspect) * NARROW_ASPECT_BOOST);

export interface DeskSceneProps {
  theme: Theme;
}

export default function DeskScene({ theme }: DeskSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const lightsRef = useRef<SceneLights | null>(null);
  const contourRef = useRef<LineBasicMaterial | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      // No WebGL (or it is blocked): fall back to the photo rather than
      // leaving an empty hole in the hero.
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
    const contour = createOutlineMaterial();
    const lights = createLighting();
    const shadow = createContactShadow();
    lightsRef.current = lights;
    contourRef.current = contour;

    scene.add(lights.hemisphere, lights.key, lights.fill, lights.screen);
    scene.add(
      shadow.mesh,
      createDesk(materials, contour),
      createCharacter(materials, contour),
    );

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controller = createOrbitController(canvas, {
      radius: BASE_RADIUS,
      target: TARGET,
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

      controller.update(deltaSeconds, camera);
      renderer.render(scene, camera);
    };

    // Only animate while the hero is actually on screen and the tab is in
    // front — an orbiting canvas is not worth the battery otherwise.
    const syncRunning = () => {
      const shouldRun = onScreen && !document.hidden;
      if (shouldRun === running) return;

      running = shouldRun;
      if (shouldRun) {
        lastTime = 0;
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

      scene.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      materials.dispose();
      contour.dispose();
      shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      rendererRef.current = null;
      lightsRef.current = null;
      contourRef.current = null;
    };
  }, []);

  // Runs after the setup effect on mount, so this also applies the initial theme.
  useEffect(() => {
    const lights = lightsRef.current;
    const contour = contourRef.current;
    if (!lights || !contour) return;

    applyTheme(lights, theme);
    applyOutlineTheme(contour, theme);
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
      aria-label="A low-poly 3D model of Naim Roslan at his desk, with a laptop, notebook and pens. Drag to spin it."
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
      <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-xs tracking-wide text-muted/70">
        drag to spin
      </p>
    </div>
  );
}
