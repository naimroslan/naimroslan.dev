import { Group } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, cylinder, dome, limb, mitten, roundedBox, sphere, taperedLimb, torus } from "./primitives";

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
/** Turns the head toward the room, away from the desk it faces. */
const HEAD_TURN_RAD = 0.62;

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
  // The figure faces its desk, so without this the camera only ever sees the
  // back of the head. A modest turn opens the face to a three-quarter profile.
  const head = new Group();
  head.position.set(0, HEAD_Y, BODY_Z);
  head.rotation.y = HEAD_TURN_RAD;
  character.add(head);

  head.add(
    sphere(HEAD_RADIUS, skin, [0, 0, 0], [1, 1.04, 0.94]),
    sphere(0.03, skin, [-0.152, -0.01, 0]),
    sphere(0.03, skin, [0.152, -0.01, 0]),
  );
  character.add(cylinder(0.058, 0.066, 0.1, materials.get(PALETTE.skinShade), [0, 1.12, BODY_Z]));

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
  head.add(
    dome(HEAD_RADIUS + 0.012, materials.get(PALETTE.beanie), [0, 0.028, 0], [1, 1, 0.96]),
    cylinder(HEAD_RADIUS + 0.02, HEAD_RADIUS + 0.022, 0.062, materials.get(PALETTE.beanieCuff), [0, 0.048, 0]),
  );
}

function addHoodie(character: Group, materials: MaterialLibrary): void {
  const hoodie = materials.get(PALETTE.hoodie);

  // Torso as a single capsule, flattened front-to-back.
  const torso = limb([0, 0.62, BODY_Z], [0, 1.0, BODY_Z], 0.215, hoodie);
  torso.scale.set(1, 1, 0.84);
  character.add(torso);

  // Arms: tapered, with sphere joints at shoulder, elbow and wrist, and posed
  // with the elbows out so they are not foreshortened into stubs head-on.
  const cuff = materials.get(PALETTE.hoodieShade);
  const skin = materials.get(PALETTE.skin);
  for (const side of [-1, 1]) {
    const shoulder = [side * 0.185, 0.955, BODY_Z] as const;
    const elbow = [side * 0.285, 0.79, BODY_Z + 0.1] as const;
    const wrist = [side * 0.195, HAND_Y, KEYBOARD_Z - 0.09] as const;

    character.add(
      ...taperedLimb(shoulder, elbow, 0.082, 0.062, hoodie),
      ...taperedLimb(elbow, wrist, 0.06, 0.047, hoodie),
      // Sleeve cuff, then the hand: narrower cuff, wider mitten reads as a hand
      // emerging from a sleeve rather than a ball stuck on a tube.
      cylinder(0.049, 0.046, 0.04, cuff, [side * 0.193, HAND_Y, KEYBOARD_Z - 0.075]),
      mitten(skin, [side * KEYBOARD_X, HAND_Y - 0.012, KEYBOARD_Z - 0.015], side * -0.18),
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

/**
 * Chunky runner built from a few large rounded forms rather than a stack of
 * boxes. The upper is a capsule laid along the foot, so the toe and heel are
 * genuinely round and the sole never projects past it.
 */
function addShoe(character: Group, materials: MaterialLibrary, centerX: number): void {
  const toeZ = -0.1;
  const heelZ = -0.29;
  const midZ = (toeZ + heelZ) / 2;
  const footLength = toeZ - heelZ;

  // The upper dominates and overhangs the sole. Previously the sole was the
  // larger form and projected past the upper at both ends, which is what read
  // as an ice skate.
  // The upper rides ON the midsole rather than swallowing it: a chunky pale
  // midsole band under a darker upper is what reads as a modern runner.
  // Its rounded corners matter -- a square-ended sole under a capsule upper is
  // what previously poked out at the toe and looked like a skate blade.
  const upper = limb(
    [centerX, 0.088, heelZ + 0.05],
    [centerX, 0.076, toeZ - 0.022],
    0.05,
    materials.get(PALETTE.shoeUpper),
  );
  upper.scale.set(0.96, 1, 0.92);

  character.add(
    roundedBox([0.098, 0.044, footLength - 0.024], 0.021, materials.get(PALETTE.shoeSole), [centerX, 0.03, midZ - 0.002]),
    roundedBox([0.094, 0.013, footLength - 0.04], 0.006, materials.get(PALETTE.shoeHeel), [centerX, 0.008, midZ - 0.002]),
    upper,
    // Swoosh-ish side accent, low on the upper where it belongs.
    roundedBox([0.104, 0.016, 0.05], 0.007, materials.get(PALETTE.shoeAccent), [centerX, 0.072, midZ + 0.02]),
    // Ankle collar, wider than the sock so the sock reads as tucked inside.
    cylinder(0.05, 0.047, 0.03, materials.get(PALETTE.shoeMid), [centerX, 0.115, heelZ + 0.062]),
  );
}

function addLegs(character: Group, materials: MaterialLibrary): void {
  const pants = materials.get(PALETTE.pants);

  for (const side of [-1, 1]) {
    const hipX = side * 0.11;
    const legX = side * 0.13;

    character.add(
      // Thigh forward to the knee, then shin down, stopping above the ankle so
      // the socks show. Tapered with a knee joint, like the arms.
      ...taperedLimb([hipX, 0.52, BODY_Z + 0.06], [legX, 0.47, -0.305], 0.085, 0.072, pants),
      ...taperedLimb([legX, 0.47, -0.305], [legX, PANT_CUFF_Y + 0.01, -0.265], 0.07, 0.057, pants),
      // Cuff is the widest point, then the sock steps in, then the shoe collar
      // steps back out — so the ankle reads as layered rather than as one blob.
      cylinder(0.06, 0.056, 0.026, materials.get(PALETTE.pantsShade), [legX, PANT_CUFF_Y, -0.263]),
      cylinder(0.044, 0.042, 0.07, materials.get(PALETTE.sock), [legX, SOCK_TOP_Y - 0.05, -0.262]),
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
