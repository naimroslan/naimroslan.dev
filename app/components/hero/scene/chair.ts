import { Group } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { cylinder, limb, roundedBox } from "./primitives";

/** Matches BODY_Z in character.ts — the chair is built around the seated figure. */
const CHAIR_Z = -0.66;
const SEAT_Y = 0.43;
const BASE_Y = 0.055;

const SPOKE_COUNT = 5;
const SPOKE_LENGTH = 0.26;
const CASTOR_RADIUS = 0.026;

/**
 * An office chair. Most of it sits under the desk, but the star base and
 * armrests are what make "sitting on a chair" legible as the camera sweeps —
 * the previous two-box stand-in read as a floating slab.
 */
export function createChair(materials: MaterialLibrary): Group {
  const chair = new Group();
  const frame = materials.get(PALETTE.chair);

  // Seat and backrest, slightly reclined.
  const backrest = roundedBox([0.4, 0.52, 0.055], 0.026, frame, [0, 0.82, CHAIR_Z - 0.2]);
  backrest.rotation.x = -0.09;

  chair.add(roundedBox([0.44, 0.055, 0.42], 0.026, frame, [0, SEAT_Y, CHAIR_Z]), backrest);

  // Armrests on short posts.
  for (const side of [-1, 1]) {
    chair.add(
      roundedBox([0.045, 0.035, 0.24], 0.016, frame, [side * 0.24, 0.63, CHAIR_Z + 0.02]),
      roundedBox([0.03, 0.16, 0.03], 0.012, materials.get(PALETTE.chairShade), [side * 0.24, 0.53, CHAIR_Z + 0.1]),
    );
  }

  // Gas column.
  chair.add(
    cylinder(0.032, 0.042, 0.33, frame, [0, 0.24, CHAIR_Z]),
    cylinder(0.06, 0.06, 0.03, frame, [0, BASE_Y + 0.02, CHAIR_Z]),
  );

  // Five-spoke star base with castors.
  for (let index = 0; index < SPOKE_COUNT; index += 1) {
    const angle = (index / SPOKE_COUNT) * Math.PI * 2;
    const toX = Math.sin(angle) * SPOKE_LENGTH;
    const toZ = Math.cos(angle) * SPOKE_LENGTH;

    chair.add(
      limb([0, BASE_Y, CHAIR_Z], [toX, BASE_Y - 0.012, CHAIR_Z + toZ], 0.018, frame),
      cylinder(CASTOR_RADIUS, CASTOR_RADIUS, 0.018, materials.get(PALETTE.chairShade), [toX, CASTOR_RADIUS, CHAIR_Z + toZ]),
    );
  }

  return chair;
}
