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
    hemisphere: 1.55,
    key: 1.85,
    fill: 0.55,
    screen: 1.1,
  },
  dark: {
    sky: 0x3a4252,
    ground: 0x0d0f14,
    hemisphere: 0.8,
    key: 1.0,
    fill: 0.3,
    screen: 2.6,
  },
} as const;

const SCREEN_LIGHT_DISTANCE = 3.2;

export function createLighting(): SceneLights {
  const hemisphere = new HemisphereLight();

  const key = new DirectionalLight();
  key.position.set(3.2, 5, 4.2);

  const fill = new DirectionalLight();
  fill.position.set(-3.6, 1.8, -2.8);

  // Warm spill from the window and screens on the cottage's left wall. Its
  // position follows the desk nook, which now sits against that wall rather
  // than free-standing in the middle of the scene.
  const screen = new PointLight(0xffd9a0, 0, SCREEN_LIGHT_DISTANCE);
  screen.position.set(-1.0, 1.2, -0.05);

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
const SHADOW_RADIUS = 1.05;

function createShadowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = SHADOW_TEXTURE_SIZE;
  canvas.height = SHADOW_TEXTURE_SIZE;

  const context = canvas.getContext("2d");
  if (context) {
    const half = SHADOW_TEXTURE_SIZE / 2;
    const gradient = context.createRadialGradient(half, half, 0, half, half, half);
    // White, not black: three's alpha-map chunk samples the GREEN channel
    // (`diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g`), so a black
    // gradient yields alpha 0 everywhere and the shadow never draws. The
    // material's own `color` supplies the black.
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.55, "rgba(255, 255, 255, 0.45)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
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
  mesh.position.set(0, 0.002, -0.12);
  mesh.scale.set(1, 0.72, 1);

  return {
    mesh,
    dispose: () => {
      material.dispose();
      texture.dispose();
    },
  };
}
