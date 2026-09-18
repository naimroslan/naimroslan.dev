import { Group } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, cylinder, dome, limb, roundedBox, sphere, torus } from "./primitives";

/**
 * Seated, facing +z (the camera's home position). Proportions are stylised
 * rather than anatomical — the head is deliberately oversized, which is both
 * the reference style and what lifts the face clear of the monitor.
 */
const BODY_Z = -0.62;
const HEAD_Y = 1.28;
const HEAD_RADIUS = 0.16;
/** Just proud of the head's front surface, so face details sit on it. */
const FACE_Z = BODY_Z + HEAD_RADIUS * 0.9;

const SHOULDER_Y = 0.99;
const HAND_Y = 0.82;
/** Matches the split keyboard halves in desk.ts. */
const KEYBOARD_X = 0.17;
const KEYBOARD_Z = -0.16;

const ARM_RADIUS = 0.055;
const PANT_CUFF_Y = 0.17;
const SOCK_TOP_Y = 0.175;
const SHOE_FLOOR_Y = 0.003;

function addHead(character: Group, materials: MaterialLibrary): void {
  const skin = materials.get(PALETTE.skin);

  character.add(
    cylinder(0.058, 0.066, 0.1, materials.get(PALETTE.skinShade), [0, 1.12, BODY_Z]),
    sphere(HEAD_RADIUS, skin, [0, HEAD_Y, BODY_Z], [1, 1.04, 0.94]),
    sphere(0.03, skin, [-0.152, HEAD_Y - 0.01, BODY_Z]),
    sphere(0.03, skin, [0.152, HEAD_Y - 0.01, BODY_Z]),
  );

  // Minimal features, per the reference: eyes carry it, everything else is a hint.
  const iris = materials.unlit(PALETTE.eye);
  const brow = materials.get(PALETTE.brow);
  character.add(
    sphere(0.019, iris, [-0.058, HEAD_Y - 0.005, FACE_Z], [1, 1.15, 0.6]),
    sphere(0.019, iris, [0.058, HEAD_Y - 0.005, FACE_Z], [1, 1.15, 0.6]),
    roundedBox([0.042, 0.011, 0.012], 0.005, brow, [-0.058, HEAD_Y + 0.036, FACE_Z]),
    roundedBox([0.042, 0.011, 0.012], 0.005, brow, [0.058, HEAD_Y + 0.036, FACE_Z]),
    sphere(0.018, materials.get(PALETTE.skinShade), [0, HEAD_Y - 0.042, FACE_Z], [0.8, 1, 0.8]),
  );

  // Beanie: dome plus a thick folded cuff sitting at the brow line.
  character.add(
    dome(HEAD_RADIUS + 0.012, materials.get(PALETTE.beanie), [0, HEAD_Y + 0.028, BODY_Z], [1, 1.0, 0.96]),
    cylinder(
      HEAD_RADIUS + 0.02,
      HEAD_RADIUS + 0.022,
      0.062,
      materials.get(PALETTE.beanieCuff),
      [0, HEAD_Y + 0.048, BODY_Z],
    ),
  );
}

function addHoodie(character: Group, materials: MaterialLibrary): void {
  const hoodie = materials.get(PALETTE.hoodie);

  // Torso as a single capsule, flattened front-to-back.
  const torso = limb([0, 0.62, BODY_Z], [0, 1.0, BODY_Z], 0.215, hoodie);
  torso.scale.set(1, 1, 0.84);
  character.add(torso);

  // Shoulders, sleeves, cuffs and hands: both hands land on the keyboard halves.
  const cuff = materials.get(PALETTE.hoodieShade);
  const skin = materials.get(PALETTE.skin);
  for (const side of [-1, 1]) {
    const shoulderX = side * 0.2;
    const elbowX = side * 0.255;
    const handX = side * KEYBOARD_X;

    character.add(
      sphere(0.088, hoodie, [shoulderX, SHOULDER_Y - 0.03, BODY_Z], [1, 1, 0.9]),
      limb([shoulderX, SHOULDER_Y - 0.02, BODY_Z], [elbowX, 0.82, BODY_Z + 0.1], ARM_RADIUS, hoodie),
      limb([elbowX, 0.82, BODY_Z + 0.1], [handX, HAND_Y, KEYBOARD_Z - 0.09], ARM_RADIUS * 0.92, hoodie),
      cylinder(0.05, 0.047, 0.045, cuff, [handX, HAND_Y, KEYBOARD_Z - 0.07]),
      sphere(0.052, skin, [handX, HAND_Y - 0.008, KEYBOARD_Z - 0.02], [1, 0.8, 1.15]),
    );
  }

  // Hood bunched behind the neck, kangaroo pocket, drawstrings.
  const hoodRoll = torus(0.115, 0.055, materials.get(PALETTE.hoodieHood), [0, 1.055, BODY_Z - 0.055], Math.PI);
  hoodRoll.rotation.set(Math.PI / 2, 0, 0);

  character.add(
    hoodRoll,
    dome(0.13, materials.get(PALETTE.hoodieHood), [0, 1.03, BODY_Z - 0.1], [1, 0.85, 0.8]),
    roundedBox([0.2, 0.11, 0.05], 0.03, materials.get(PALETTE.hoodiePocket), [0, 0.7, BODY_Z + 0.16]),
    limb([-0.045, 1.035, BODY_Z + 0.15], [-0.05, 0.9, BODY_Z + 0.17], 0.009, materials.get(PALETTE.drawstring)),
    limb([0.045, 1.035, BODY_Z + 0.15], [0.05, 0.89, BODY_Z + 0.17], 0.009, materials.get(PALETTE.drawstring)),
  );
}

/** Chunky layered runner, in the spirit of a Vomero 5. */
function addShoe(character: Group, materials: MaterialLibrary, centerX: number): void {
  const toeZ = -0.11;
  const heelZ = -0.3;
  const midZ = (toeZ + heelZ) / 2;

  character.add(
    // outsole, then a thick midsole stack
    roundedBox([0.1, 0.022, 0.2], 0.011, materials.get(PALETTE.shoeHeel), [centerX, 0.014, midZ]),
    roundedBox([0.104, 0.042, 0.198], 0.019, materials.get(PALETTE.shoeSole), [centerX, 0.047, midZ]),
    // upper
    roundedBox([0.094, 0.052, 0.17], 0.024, materials.get(PALETTE.shoeUpper), [centerX, 0.09, midZ - 0.008]),
    // toe cap and heel counter
    sphere(0.047, materials.get(PALETTE.shoeMid), [centerX, 0.076, toeZ + 0.012], [1, 0.85, 0.9]),
    roundedBox([0.088, 0.062, 0.05], 0.022, materials.get(PALETTE.shoeHeel), [centerX, 0.098, heelZ + 0.022]),
    // side accent
    box([0.098, 0.016, 0.075], materials.get(PALETTE.shoeAccent), [centerX, 0.083, midZ + 0.01]),
  );
}

function addLegs(character: Group, materials: MaterialLibrary): void {
  const pants = materials.get(PALETTE.pants);

  for (const side of [-1, 1]) {
    const hipX = side * 0.11;
    const legX = side * 0.13;

    character.add(
      // thigh forward to the knee, then shin down — stopping above the ankle,
      // which is what leaves the socks visible.
      limb([hipX, 0.52, BODY_Z + 0.06], [legX, 0.47, -0.31], 0.077, pants),
      limb([legX, 0.45, -0.31], [legX, PANT_CUFF_Y, -0.26], 0.064, pants),
      cylinder(0.062, 0.058, 0.03, materials.get(PALETTE.pantsShade), [legX, PANT_CUFF_Y, -0.26]),
      // sock, in the gap between cuff and shoe collar
      cylinder(0.05, 0.048, 0.075, materials.get(PALETTE.sock), [legX, SOCK_TOP_Y - 0.052, -0.255]),
    );

    addShoe(character, materials, legX);
  }
}

export function createCharacter(materials: MaterialLibrary): Group {
  const character = new Group();

  // Hips first, so the torso capsule overlaps them rather than the reverse.
  character.add(
    roundedBox([0.34, 0.18, 0.32], 0.07, materials.get(PALETTE.pants), [0, 0.55, BODY_Z + 0.02]),
  );

  addHoodie(character, materials);
  addHead(character, materials);
  addLegs(character, materials);

  return character;
}

/** Consumed by the scene checks that assert the face clears the monitor. */
export const CHARACTER_METRICS = {
  bodyZ: BODY_Z,
  headY: HEAD_Y,
  headRadius: HEAD_RADIUS,
  chinY: HEAD_Y - HEAD_RADIUS * 1.04,
  faceZ: FACE_Z,
  shoulderY: SHOULDER_Y,
  handY: HAND_Y,
  keyboardX: KEYBOARD_X,
  keyboardZ: KEYBOARD_Z,
  pantCuffY: PANT_CUFF_Y,
  sockTopY: SOCK_TOP_Y,
  shoeFloorY: SHOE_FLOOR_Y,
} as const;
