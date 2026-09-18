import { Group } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, cylinder, type Point } from "./primitives";

const VASE_RIM_Y = 0.45;
const BLADE_COUNT = 11;

/**
 * Floor-standing snake plant in a tall vase, built from stacked tapered
 * cylinders so the vase has a belly and a neck rather than being a plain tube.
 */
export function createFloorPlant(materials: MaterialLibrary, at: Point): Group {
  const plant = new Group();
  const [x, , z] = at;
  const ceramic = materials.get(PALETTE.plantPot);

  plant.add(
    cylinder(0.17, 0.132, 0.12, ceramic, [x, 0.06, z]),
    cylinder(0.202, 0.17, 0.16, ceramic, [x, 0.2, z]),
    cylinder(0.152, 0.202, 0.15, ceramic, [x, 0.355, z]),
    cylinder(0.158, 0.15, 0.03, ceramic, [x, 0.445, z]),
    cylinder(0.146, 0.146, 0.02, materials.get(PALETTE.coffee), [x, VASE_RIM_Y - 0.01, z]),
  );

  const blade = materials.get(PALETTE.plantLeaf);
  const edge = materials.get(PALETTE.plantLeafEdge);

  for (let index = 0; index < BLADE_COUNT; index += 1) {
    const angle = index * 2.1;
    const lean = 0.07 + (index % 3) * 0.055;
    const height = 0.56 + (index % 5) * 0.11;
    const reach = 0.035 + (index % 2) * 0.042;

    const leaf = box([0.072, height, 0.019], index % 3 === 0 ? edge : blade, [
      x + Math.cos(angle) * reach,
      VASE_RIM_Y + height / 2 - 0.02,
      z + Math.sin(angle) * reach,
    ]);
    leaf.rotation.set(Math.sin(angle) * lean, -angle, -Math.cos(angle) * lean);
    plant.add(leaf);
  }

  return plant;
}
