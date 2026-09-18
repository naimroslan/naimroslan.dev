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
/** Head-local: just proud of the skull's front surface, so face details sit on it. */
const FACE_Z = HEAD_RADIUS * 0.9;
const EYE_Y = -0.01;
const BROW_Y = 0.03;
const BEANIE_CUFF_HEIGHT = 0.058;
/** Places the cuff's underside at 0.052, clear of the brow top at ~0.0355. */
const BEANIE_CUFF_Y = 0.081;
/** Turns the head toward the room, away from the desk it faces. */
const HEAD_TURN_RAD = 0.62;

const SHOULDER_Y = 0.99;
const HAND_Y = 0.82;
/** Matches the split keyboard halves in desk.ts. */
const KEYBOARD_X = 0.14;
const KEYBOARD_Z = -0.12;

const ARM_RADIUS = 0.055;
const PANT_CUFF_Y = 0.17;
const SOCK_TOP_Y = 0.175;
const SHOE_FLOOR_Y = 0.003;

function addHead(character: Group, materials: MaterialLibrary): void {
  const skin = materials.get(PALETTE.skin);

  // Everything that belongs to the head lives in this group, in head-local
  // coordinates. Previously the skull and beanie were parented here while the
  // eyes, brows and nose were added to `character` in world coordinates, so the
  // face never turned with the head -- it sat on the side of a rotated skull.
  const head = new Group();
  head.position.set(0, HEAD_Y, BODY_Z);
  head.rotation.y = HEAD_TURN_RAD;
  character.add(head);

  // The neck stays on the body: it should not swivel with the head.
  character.add(cylinder(0.058, 0.066, 0.1, materials.get(PALETTE.skinShade), [0, 1.12, BODY_Z]));

  head.add(
    sphere(HEAD_RADIUS, skin, [0, 0, 0], [1, 1.04, 0.94]),
    sphere(0.03, skin, [-0.152, -0.012, 0]),
    sphere(0.03, skin, [0.152, -0.012, 0]),
  );

  // Hair, at the back and sides only. A dome centred low enough to show below
  // the beanie also reaches forward across the face, and being wider than the
  // skull it bulged out over the eyes -- which is what actually hid them. So
  // the shell is pushed back until its front edge sits behind the face plane.
  head.add(
    sphere(0.156, materials.get(PALETTE.hair), [0, -0.022, -0.05], [1.04, 0.92, 0.95]),
    sphere(0.055, materials.get(PALETTE.hair), [0, -0.012, -HEAD_RADIUS * 0.84], [1.5, 0.9, 0.7]),
  );

  // Minimal features, per the reference: eyes carry it, everything else a hint.
  const iris = materials.unlit(PALETTE.eye);
  const brow = materials.get(PALETTE.brow);
  head.add(
    sphere(0.019, iris, [-0.055, EYE_Y, FACE_Z], [1, 1.15, 0.6]),
    sphere(0.019, iris, [0.055, EYE_Y, FACE_Z], [1, 1.15, 0.6]),
    roundedBox([0.042, 0.011, 0.012], 0.005, brow, [-0.055, BROW_Y, FACE_Z]),
    roundedBox([0.042, 0.011, 0.012], 0.005, brow, [0.055, BROW_Y, FACE_Z]),
    sphere(0.018, materials.get(PALETTE.skinShade), [0, EYE_Y - 0.036, FACE_Z], [0.8, 1, 0.8]),
  );

  // Beanie. The cuff's underside must clear the top of the brow -- at its old
  // height the brim's bottom edge landed exactly on the top of the eye.
  // The dome is y-squashed on purpose: an unscaled hemisphere raised far enough
  // to clear the brow balloons well above the skull and reads as a chef's hat.
  head.add(
    dome(HEAD_RADIUS + 0.008, materials.get(PALETTE.beanie), [0, 0.05, 0], [1.03, 0.72, 1]),
    cylinder(
      HEAD_RADIUS + 0.018,
      HEAD_RADIUS + 0.021,
      BEANIE_CUFF_HEIGHT,
      materials.get(PALETTE.beanieCuff),
      [0, BEANIE_CUFF_Y, 0],
    ),
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
 * Slide sandal: a thick flat footbed with two angled straps over the foot,
 * worn over a sock. Far fewer forms than a layered runner, and correspondingly
 * harder to get wrong.
 */
function addShoe(character: Group, materials: MaterialLibrary, centerX: number): void {
  const toeZ = -0.09;
  const heelZ = -0.3;
  const midZ = (toeZ + heelZ) / 2;
  const footLength = toeZ - heelZ;
  const sole = materials.get(PALETTE.slideSole);
  const strap = materials.get(PALETTE.slide);

  character.add(
    // Footbed on a slightly narrower outsole, so the edge reads as two layers.
    roundedBox([0.105, 0.03, footLength], 0.014, sole, [centerX, 0.037, midZ]),
    roundedBox([0.098, 0.018, footLength - 0.018], 0.008, strap, [centerX, 0.012, midZ]),
    // The sock foot sits in the footbed, giving the straps something to cross.
    limb([centerX, 0.078, heelZ + 0.055], [centerX, 0.07, toeZ - 0.035], 0.042, materials.get(PALETTE.sock)),
  );

  // Two wide straps arching over the instep. They were previously both too
  // narrow and too low: at y 0.088 they cut through the sock, whose top is at
  // ~0.12, so the sock showed where the strap should have been.
  for (const [offset, tilt] of [[0.056, 0.2], [-0.026, -0.13]] as const) {
    const band = roundedBox([0.118, 0.052, 0.078], 0.018, strap, [centerX, 0.101, midZ + offset]);
    band.rotation.x = tilt;
    character.add(band);
  }
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
