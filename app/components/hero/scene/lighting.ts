import {
  CanvasTexture,
  CircleGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PointLight,
} from "three";

import type { Theme } from "~/hooks/use-theme";

export interface SceneLights {
  hemisphere: HemisphereLight;
  key: DirectionalLight;
  fill: DirectionalLight;
  screen: PointLight;
}

/**
 * Two tunings of the same rig. The canvas is transparent, so in light mode the
 * diorama has to hold its own against a near-white page — hence the strong key
 * light — while dark mode leans on the laptop screen for most of its character.
 */
const THEME_LIGHTING = {
  light: {
    sky: 0xffffff,
    ground: 0xd8d4cd,
    hemisphere: 1.7,
    key: 2.1,
    fill: 0.5,
    screen: 0.12,
  },
  dark: {
    sky: 0x3a4252,
    ground: 0x0d0f14,
    hemisphere: 1,
    key: 1.25,
    fill: 0.3,
    screen: 0.6,
  },
} as const;

const SCREEN_LIGHT_DISTANCE = 1.1;

export function createLighting(): SceneLights {
  const hemisphere = new HemisphereLight();

  const key = new DirectionalLight();
  key.position.set(3.2, 5, 4.2);

  const fill = new DirectionalLight();
  fill.position.set(-3.6, 1.8, -2.8);

  // Sits just in front of the laptop screen so its glow spills onto the face
  // and hands, which is what sells the scene in dark mode.
  const screen = new PointLight(0x8fb7ff, 0, SCREEN_LIGHT_DISTANCE);
  screen.position.set(0.02, 0.88, -0.24);

  return { hemisphere, key, fill, screen };
}

export function applyTheme(lights: SceneLights, theme: Theme): void {
  const tuning = THEME_LIGHTING[theme];

  lights.hemisphere.color.setHex(tuning.sky);
  lights.hemisphere.groundColor.setHex(tuning.ground);
  lights.hemisphere.intensity = tuning.hemisphere;
  lights.key.intensity = tuning.key;
  lights.fill.intensity = tuning.fill;
  lights.screen.intensity = tuning.screen;
}

const SHADOW_TEXTURE_SIZE = 128;
const SHADOW_RADIUS = 0.95;

function createShadowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = SHADOW_TEXTURE_SIZE;
  canvas.height = SHADOW_TEXTURE_SIZE;

  const context = canvas.getContext("2d");
  if (context) {
    const half = SHADOW_TEXTURE_SIZE / 2;
    const gradient = context.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(0.55, "rgba(0, 0, 0, 0.45)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, SHADOW_TEXTURE_SIZE, SHADOW_TEXTURE_SIZE);
  }

  return new CanvasTexture(canvas);
}

/**
 * A painted contact shadow instead of a shadow map. It grounds the diorama for
 * a fraction of the cost, which matters most on phones.
 */
export function createContactShadow(): { mesh: Mesh; dispose: () => void } {
  const texture = createShadowTexture();
  const material = new MeshBasicMaterial({
    color: 0x000000,
    alphaMap: texture,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    toneMapped: false,
  });

  const mesh = new Mesh(new CircleGeometry(SHADOW_RADIUS, 24), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.002, -0.2);
  mesh.scale.set(1, 0.8, 1);

  return {
    mesh,
    dispose: () => {
      material.dispose();
      texture.dispose();
    },
  };
}
