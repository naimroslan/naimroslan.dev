import { MeshBasicMaterial, MeshStandardMaterial } from "three";

/**
 * Keyed to the owner's desk-setup reference: the figure stays genuinely dark,
 * while the desk and hardware sit a few stops lighter so the scene still reads
 * against the page's #faf9f7 rather than punching a hole in it.
 */
export const PALETTE = {
  // figure
  beanie: 0x2f333a,
  beanieCuff: 0x272a30,
  hair: 0x241d18,
  hoodie: 0x454a52,
  hoodieShade: 0x383d44,
  hoodieHood: 0x3d424a,
  hoodiePocket: 0x4a4f58,
  drawstring: 0xcac3b8,
  skin: 0xc08a64,
  skinShade: 0xa87253,
  eye: 0x2b2118,
  brow: 0x2f2620,
  pants: 0x6d5e41,
  pantsShade: 0x5b4e35,
  sock: 0xebe7dd,
  slide: 0x24262c,
  slideSole: 0x33363c,

  // chair
  chair: 0x282b31,
  chairMesh: 0x1e2126,
  chairFrame: 0x32353c,

  // desk
  deskTop: 0xa87b52,
  deskEdge: 0x8f6840,
  deskLeg: 0x3a3d43,
  deskMat: 0x3f434a,

  // hardware
  monitorShell: 0x2c2f35,
  monitorBack: 0x363a40,
  monitorStand: 0x282b31,
  lightBar: 0x2c2f35,
  lightBarGlow: 0xffd9a0,
  laptopShell: 0xb2b7bd,
  laptopStand: 0x8f949a,
  screen: 0x1d2330,
  screenGlow: 0x9fc3ef,
  keyboard: 0x2b2e34,
  keycap: 0x1f2228,
  mouse: 0x2b2e34,
  trackpad: 0xd6d2ca,

  // desk clutter
  notebookCover: 0xdcd6c8,
  pages: 0xf2ede2,
  noteLine: 0x9aa0aa,
  penBody: 0x1f2228,
  mug: 0x24262c,
  coffee: 0x3a2418,
  coaster: 0xa8814f,
  plantPot: 0xe2dcd0,
  plantLeaf: 0x416b48,
  plantLeafEdge: 0x8d9c4e,
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
 * Caches one material per colour/override combination. The scene reuses most
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
