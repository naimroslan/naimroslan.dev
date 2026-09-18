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
  hoodie: 0x3f444c,
  hoodieShade: 0x33383f,
  hoodieHood: 0x373c44,
  hoodiePocket: 0x434850,
  drawstring: 0xcfc8bd,
  skin: 0xc08a64,
  skinShade: 0xa87253,
  eye: 0x2b2118,
  brow: 0x2f2620,
  pants: 0x7a5b40,
  pantsShade: 0x654a33,
  sock: 0xe8e3d8,
  shoeSole: 0xd8d2c5,
  shoeMid: 0xa9a49a,
  shoeUpper: 0x8d8981,
  shoeAccent: 0x5f6b7a,
  shoeHeel: 0x4c4944,

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

  // cottage shell — reference is a night scene, these are lifted so the
  // diorama sits on a #faf9f7 page instead of fighting it
  wallInterior: 0xdcb3b7,
  wallShade: 0xc79ba0,
  wallCut: 0xecd0d2,
  roofUnder: 0x4a5570,
  roofOuter: 0x9c7680,
  floorPlank: 0x7a5540,
  floorPlankAlt: 0x6b4834,
  windowFrame: 0xf4efe6,
  windowGlow: 0xffe4b0,
  skirting: 0xcfa7ac,

  // ground-floor decor
  rugBase: 0xe09a45,
  rugBorder: 0x46618c,
  shelfWood: 0xc0a07f,
  bookTeal: 0x3f8a8a,
  bookOrange: 0xd97a3f,
  bookYellow: 0xe0b84f,
  bookPurple: 0x6f5f90,
  calendarPaper: 0xf4efe6,
  calendarFrame: 0xd6cbbb,
  potDark: 0x3f3739,
  potTerracotta: 0xb5674a,
  leafDark: 0x386350,
  leafMid: 0x44805d,
  stoolTop: 0x52938a,
  stoolLeg: 0xab8460,
  macrame: 0xd8cbb6,

  // loft, ladder, kitchen
  loftFloor: 0xb08a72,
  duvet: 0xd9a2ab,
  pillow: 0xf2eadc,
  blanketOlive: 0x8c9160,
  mattress: 0x63938a,
  ladder: 0x4f4468,
  counterTop: 0xe4dac8,
  cabinet: 0xdccfba,
  sink: 0x829c9c,
  stove: 0x33363d,
  oven: 0x3e4148,
  jarTeal: 0x4f8f8f,
  jarCream: 0xe8dfcb,
  jarDark: 0x45484f,
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
