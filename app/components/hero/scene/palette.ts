import { MeshBasicMaterial, MeshStandardMaterial } from "three";

/**
 * Soft and muted, keyed to the site's own `--accent` (#7d2b35) so the diorama
 * belongs to the page. Nothing here is brighter than ~#e8e3d6: with no contour
 * lines, the silhouette against the #faf9f7 page is carried entirely by value
 * contrast, so a near-white surface would dissolve into the background.
 */
export const PALETTE = {
  // character
  beanie: 0x343a45,
  beanieCuff: 0x2b313a,
  hoodie: 0x8f4550,
  hoodieShade: 0x743b44,
  hoodieHood: 0x7c3b45,
  hoodiePocket: 0x843f4a,
  drawstring: 0xd9d2c8,
  skin: 0xc08a64,
  skinShade: 0xa87253,
  eye: 0x2b2118,
  brow: 0x2f2620,
  pants: 0x7a5b40,
  pantsShade: 0x654a33,
  sock: 0xe4ded1,
  shoeSole: 0xe6e1d6,
  shoeMid: 0xd2ccbf,
  shoeUpper: 0xb8b3aa,
  shoeAccent: 0x8a8f95,
  shoeHeel: 0x6f6b64,

  // furniture
  chair: 0x4a505a,
  chairShade: 0x3b414a,
  deskTop: 0xc0a183,
  deskEdge: 0xa8886a,
  deskLeg: 0x8d7157,

  // hardware
  monitorShell: 0x4e555f,
  monitorBack: 0x585f6a,
  monitorStand: 0x444a54,
  biasLight: 0x7fb4e8,
  laptopShell: 0xb9bec5,
  laptopStand: 0x9aa0a8,
  screen: 0x232935,
  screenGlow: 0x8fb7ff,
  keyboard: 0x2f353e,
  keycap: 0xdad5cb,
  trackpad: 0xd5d1c9,

  // desk clutter
  notebookCover: 0x33566b,
  pages: 0xf0ece2,
  noteLine: 0x8b93a0,
  penBody: 0x2f3440,
  mug: 0xe3ded2,
  coffee: 0x4a2f22,
  sticky: 0xf0d271,
} as const;

const DEFAULT_ROUGHNESS = 0.62;

interface MaterialOverrides {
  roughness?: number;
  emissive?: number;
  emissiveIntensity?: number;
}

export interface MaterialLibrary {
  get(color: number, overrides?: MaterialOverrides): MeshStandardMaterial;
  /** Unlit, for things that must never pick up shading — eyes, screen insets. */
  unlit(color: number): MeshBasicMaterial;
  dispose(): void;
}

/**
 * Caches one material per colour/override combination. The diorama reuses most
 * colours across many meshes, and disposal then has a single known set to walk.
 */
export function createMaterialLibrary(): MaterialLibrary {
  const cache = new Map<string, MeshStandardMaterial>();
  const unlitCache = new Map<number, MeshBasicMaterial>();

  return {
    get(color, overrides = {}) {
      const { roughness = DEFAULT_ROUGHNESS, emissive, emissiveIntensity = 1 } = overrides;
      const key = `${color}|${roughness}|${emissive ?? "none"}|${emissiveIntensity}`;

      const cached = cache.get(key);
      if (cached) return cached;

      const material = new MeshStandardMaterial({ color, roughness, metalness: 0 });
      if (emissive !== undefined) {
        material.emissive.setHex(emissive);
        material.emissiveIntensity = emissiveIntensity;
      }

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
