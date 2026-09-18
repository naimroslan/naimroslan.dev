import { Group, InstancedMesh, Matrix4 } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, cylinder, limb, roundedBox, sphere, torus, type Point } from "./primitives";
import { ROOM } from "./room";

// Confined to the back-right corner. At full width its edge beam cut straight
// across the figure's head and the whole desk nook.
const LOFT_MIN_X = 0.5;
const LOFT_FRONT_Z = -0.02;
const LOFT_THICKNESS = 0.09;

const COUNTER_Y = 0.88;
const COUNTER_Z = ROOM.minZ + 0.28;
const SHELF_Y = 1.16;

/** Loft platform with the bed made up on it. */
function createLoft(materials: MaterialLibrary): Group {
  const loft = new Group();
  const width = ROOM.maxX - LOFT_MIN_X;
  const depth = LOFT_FRONT_Z - ROOM.minZ;
  const centerX = (ROOM.maxX + LOFT_MIN_X) / 2;
  const centerZ = (LOFT_FRONT_Z + ROOM.minZ) / 2;
  const deck = ROOM.loftY;

  loft.add(
    box([width, LOFT_THICKNESS, depth], materials.get(PALETTE.loftFloor), [centerX, deck - LOFT_THICKNESS / 2, centerZ]),
    // Edge beams along the two open sides.
    box([0.07, 0.12, depth], materials.get(PALETTE.ladder), [LOFT_MIN_X, deck - 0.02, centerZ]),
    box([width, 0.12, 0.07], materials.get(PALETTE.ladder), [centerX, deck - 0.02, LOFT_FRONT_Z]),
  );

  // Bed: mattress, duvet turned back, pillow and a folded blanket.
  const bedX = 0.9;
  const bedZ = -0.62;
  loft.add(
    roundedBox([0.66, 0.1, 1.0], 0.04, materials.get(PALETTE.mattress), [bedX, deck + 0.05, bedZ]),
    roundedBox([0.68, 0.08, 0.66], 0.04, materials.get(PALETTE.duvet), [bedX, deck + 0.12, bedZ + 0.17]),
    roundedBox([0.44, 0.09, 0.2], 0.045, materials.get(PALETTE.pillow), [bedX, deck + 0.13, bedZ - 0.38]),
    roundedBox([0.62, 0.06, 0.16], 0.03, materials.get(PALETTE.blanketOlive), [bedX, deck + 0.14, bedZ - 0.17]),
  );

  return loft;
}

/** Leaning ladder up to the loft edge. */
function createLadder(materials: MaterialLibrary): Group {
  const ladder = new Group();
  const rail = materials.get(PALETTE.ladder);
  const footZ = 0.46;
  const topZ = 0.08;
  const topY = ROOM.loftY + 0.06;
  const footX = 0.84;
  const topX = LOFT_MIN_X + 0.12;

  const left = -0.16, right = 0.16;
  for (const offset of [left, right]) {
    ladder.add(limb([footX + offset * 0.1, 0, footZ + offset], [topX + offset * 0.1, topY, topZ + offset], 0.025, rail));
  }

  // Rungs, evenly spaced along the rails.
  const rungCount = 6;
  const template = cylinder(0.018, 0.018, right - left, rail, [0, 0, 0]);
  template.rotation.z = Math.PI / 2;
  const rungs = new InstancedMesh(template.geometry, rail, rungCount);
  const matrix = new Matrix4();
  for (let index = 0; index < rungCount; index += 1) {
    const t = (index + 0.6) / (rungCount + 0.2);
    matrix.makeRotationX(Math.PI / 2);
    matrix.setPosition(footX + (topX - footX) * t, topY * t, footZ + (topZ - footZ) * t);
    rungs.setMatrixAt(index, matrix);
  }
  ladder.add(rungs);

  return ladder;
}

/** Kitchen run tucked under the loft, against the back wall. */
function createKitchen(materials: MaterialLibrary): Group {
  const kitchen = new Group();
  const cabinet = materials.get(PALETTE.cabinet);
  const minX = 0.34;
  const maxX = ROOM.maxX - 0.03;
  const width = maxX - minX;
  const centerX = (minX + maxX) / 2;
  const depth = 0.5;

  kitchen.add(
    box([width, COUNTER_Y - 0.06, depth], cabinet, [centerX, (COUNTER_Y - 0.06) / 2, COUNTER_Z]),
    roundedBox([width + 0.03, 0.05, depth + 0.03], 0.012, materials.get(PALETTE.counterTop), [centerX, COUNTER_Y, COUNTER_Z]),
    // Sink basin and tap.
    box([0.3, 0.07, 0.32], materials.get(PALETTE.sink), [minX + 0.24, COUNTER_Y - 0.01, COUNTER_Z]),
    limb([minX + 0.24, COUNTER_Y + 0.03, COUNTER_Z - 0.17], [minX + 0.24, COUNTER_Y + 0.17, COUNTER_Z - 0.17], 0.014, materials.get(PALETTE.sink)),
    // Hob with four burners, and the oven below it.
    box([0.34, 0.012, 0.34], materials.get(PALETTE.stove), [maxX - 0.26, COUNTER_Y + 0.03, COUNTER_Z]),
    box([0.32, 0.5, 0.02], materials.get(PALETTE.oven), [maxX - 0.26, COUNTER_Y - 0.36, COUNTER_Z + depth / 2]),
    cylinder(0.05, 0.05, 0.022, materials.get(PALETTE.counterTop), [maxX - 0.26, COUNTER_Y - 0.14, COUNTER_Z + depth / 2 + 0.02]),
  );

  const burner = materials.get(PALETTE.oven);
  for (const dx of [-0.08, 0.08]) {
    for (const dz of [-0.08, 0.08]) {
      kitchen.add(cylinder(0.055, 0.055, 0.014, burner, [maxX - 0.26 + dx, COUNTER_Y + 0.042, COUNTER_Z + dz]));
    }
  }

  // Drawer fronts.
  for (let index = 0; index < 3; index += 1) {
    kitchen.add(
      box([0.28, 0.02, 0.018], materials.get(PALETTE.counterTop), [minX + 0.24, 0.24 + index * 0.24, COUNTER_Z + depth / 2 + 0.01]),
    );
  }

  // Open shelf of jars above the counter.
  kitchen.add(box([width - 0.1, 0.03, 0.2], materials.get(PALETTE.shelfWood), [centerX, SHELF_Y, ROOM.minZ + 0.14]));
  const jarColors = [PALETTE.jarTeal, PALETTE.jarCream, PALETTE.jarDark, PALETTE.jarCream, PALETTE.jarTeal];
  jarColors.forEach((color, index) => {
    kitchen.add(
      cylinder(0.045, 0.045, 0.11, materials.get(color), [minX + 0.14 + index * 0.16, SHELF_Y + 0.07, ROOM.minZ + 0.14]),
    );
  });

  // Utensils hanging off a rail on the back wall.
  const rail = ROOM.minZ + 0.03;
  kitchen.add(cylinder(0.012, 0.012, 0.38, materials.get(PALETTE.stove), [centerX + 0.12, 1.52, rail]));
  const utensilRail = kitchen.children.at(-1);
  if (utensilRail) utensilRail.rotation.z = Math.PI / 2;
  for (let index = 0; index < 3; index += 1) {
    const ux = centerX - 0.02 + index * 0.14;
    kitchen.add(
      limb([ux, 1.5, rail + 0.02], [ux, 1.36, rail + 0.02], 0.009, materials.get(PALETTE.stove)),
      sphere(0.035, materials.get(PALETTE.stove), [ux, 1.33, rail + 0.02], [1, 0.7, 0.35]),
    );
  }

  // A small plant on the counter.
  kitchen.add(
    cylinder(0.05, 0.04, 0.07, materials.get(PALETTE.potTerracotta), [minX + 0.52, COUNTER_Y + 0.06, COUNTER_Z - 0.12]),
    sphere(0.07, materials.get(PALETTE.leafMid), [minX + 0.52, COUNTER_Y + 0.13, COUNTER_Z - 0.12], [1, 0.75, 1]),
  );

  return kitchen;
}

export function createLoftLevel(materials: MaterialLibrary): Group {
  const level = new Group();
  level.add(createLoft(materials), createLadder(materials), createKitchen(materials));
  return level;
}
