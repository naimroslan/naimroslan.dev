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
  // Backrest as a frame around a thinner inset panel, so it reads as mesh
  // stretched on a rim rather than a solid slab.
  const back = new Group();
  back.position.set(0, 0.78, CHAIR_Z - 0.2);
  back.rotation.x = -0.1;
  const rim = materials.get(PALETTE.chairFrame);
  back.add(
    roundedBox([0.42, 0.48, 0.05], 0.028, rim, [0, 0, 0]),
    roundedBox([0.34, 0.39, 0.022], 0.02, materials.get(PALETTE.chairMesh), [0, 0.01, 0.018]),
    // Lumbar bar across the lower back.
    roundedBox([0.44, 0.06, 0.06], 0.026, rim, [0, -0.2, 0.01]),
  );
  chair.add(roundedBox([0.46, 0.06, 0.44], 0.028, frame, [0, SEAT_Y, CHAIR_Z]), back);

  // Armrests on short posts.
  for (const side of [-1, 1]) {
    chair.add(
      roundedBox([0.055, 0.04, 0.26], 0.018, materials.get(PALETTE.chairFrame), [side * 0.25, 0.64, CHAIR_Z + 0.03]),
      roundedBox([0.032, 0.18, 0.032], 0.014, frame, [side * 0.25, 0.54, CHAIR_Z + 0.12]),
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
      cylinder(CASTOR_RADIUS, CASTOR_RADIUS, 0.02, materials.get(PALETTE.chairMesh), [toX, CASTOR_RADIUS, CHAIR_Z + toZ]),
    );
  }

  return chair;
}
