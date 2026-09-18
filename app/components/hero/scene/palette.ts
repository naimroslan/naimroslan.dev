import { LineBasicMaterial, MeshBasicMaterial, MeshStandardMaterial } from "three";

import type { Theme } from "~/hooks/use-theme";

/**
 * Colours sampled from the reference photo (app/assets/naimroslan.png) and the
 * desk props. Kept mid-value on purpose: the page behind the canvas is
 * near-white in light mode, so a pale silhouette would wash out against it.
 */
export const PALETTE = {
  cap: 0x1c1f26,
  skin: 0xc98f63,
  skinShadow: 0xb37c53,
  hood: 0x6e6b4e,
  bomber: 0x7d2b35,
  hoodie: 0x8e9299,
  tee: 0xa33b46,
  pants: 0x3c4657,
  chair: 0x3a3f47,

  deskTop: 0xb98b5e,
  deskLeg: 0x8a6742,
  laptopBody: 0xb9bcc2,
  laptopScreen: 0x2b303a,
  screenGlow: 0x8fb7ff,
  notebookCover: 0x33383f,
  pages: 0xf2efe6,
  noteLine: 0x5a6472,
  penBody: 0x2f3440,
  penAccent: 0xa33b46,
  penBlue: 0x3d6b8f,
  mug: 0xe8e3d8,
  coffee: 0x4a2f22,
  eye: 0x14161a,
} as const;

/**
 * Bright contours on a dark page read much heavier than dark contours on a
 * light one, so dark mode uses a lower opacity rather than the same value.
 */
const OUTLINE_THEME = {
  light: { color: 0x24262b, opacity: 0.5 },
  dark: { color: 0xf2f1ee, opacity: 0.22 },
} as const;

const DEFAULT_ROUGHNESS = 0.78;

interface MaterialOverrides {
  roughness?: number;
}

export interface MaterialLibrary {
  get(color: number, overrides?: MaterialOverrides): MeshStandardMaterial;
  /** Unlit, for things that must never pick up shading — eyes, screen insets. */
  unlit(color: number): MeshBasicMaterial;
  dispose(): void;
}

/**
 * Caches one material per colour/override combination. Two reasons: the
 * diorama reuses most colours across several meshes, and disposal then has a
 * single known set to walk instead of hunting for duplicates.
 */
export function createMaterialLibrary(): MaterialLibrary {
  const cache = new Map<string, MeshStandardMaterial>();
  const unlitCache = new Map<number, MeshBasicMaterial>();

  return {
    get(color, overrides = {}) {
      const { roughness = DEFAULT_ROUGHNESS } = overrides;
      const key = `${color}|${roughness}`;

      const cached = cache.get(key);
      if (cached) return cached;

      const material = new MeshStandardMaterial({
        color,
        roughness,
        metalness: 0,
        // Flat shading is what gives the faceted low-poly read.
        flatShading: true,
      });
      cache.set(key, material);
      return material;
    },

    unlit(color) {
      const cached = unlitCache.get(color);
      if (cached) return cached;

      const material = new MeshBasicMaterial({ color, toneMapped: false });
      unlitCache.set(color, material);
      return material;
    },

    dispose() {
      for (const material of cache.values()) material.dispose();
      for (const material of unlitCache.values()) material.dispose();
      cache.clear();
      unlitCache.clear();
    },
  };
}

export const createOutlineMaterial = (): LineBasicMaterial =>
  new LineBasicMaterial({ transparent: true, toneMapped: false });

export function applyOutlineTheme(material: LineBasicMaterial, theme: Theme): void {
  const { color, opacity } = OUTLINE_THEME[theme];
  material.color.setHex(color);
  material.opacity = opacity;
}
