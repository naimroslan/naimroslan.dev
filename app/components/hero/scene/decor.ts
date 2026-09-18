import { Group, InstancedMesh, Matrix4 } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, cone, cylinder, limb, roundedBox, sphere, type Point } from "./primitives";
import { ROOM } from "./room";

const LEAF_RING = 7;

/** Tall round-leaved plant — the big foreground silhouette in the reference. */
function createLeafyPlant(materials: MaterialLibrary, at: Point, scale = 1): Group {
  const plant = new Group();
  const [x, , z] = at;
  const stemMat = materials.get(PALETTE.leafDark);

  plant.add(
    cylinder(0.14 * scale, 0.115 * scale, 0.2 * scale, materials.get(PALETTE.potDark), [x, 0.1 * scale, z]),
    cylinder(0.145 * scale, 0.145 * scale, 0.03 * scale, materials.get(PALETTE.potDark), [x, 0.2 * scale, z]),
  );

  // Leaves on short stems, spiralling up the trunk.
  const leafMat = materials.get(PALETTE.leafMid);
  const height = 0.95 * scale;
  for (let index = 0; index < 11; index += 1) {
    const t = index / 10;
    const angle = index * 1.9;
    const y = 0.24 * scale + t * height;
    const reach = (0.1 + 0.16 * Math.sin(t * Math.PI)) * scale;
    const lx = x + Math.cos(angle) * reach;
    const lz = z + Math.sin(angle) * reach;

    plant.add(
      limb([x, y - 0.04 * scale, z], [lx, y, lz], 0.012 * scale, stemMat),
      sphere(0.095 * scale, index % 2 === 0 ? leafMat : stemMat, [lx, y, lz], [1, 0.42, 1]),
    );
  }

  return plant;
}

/** Spiky agave in terracotta, sitting on the little round stool. */
function createStoolPlant(materials: MaterialLibrary, at: Point): Group {
  const group = new Group();
  const [x, , z] = at;
  const topY = 0.34;

  group.add(
    cylinder(0.145, 0.145, 0.03, materials.get(PALETTE.stoolTop), [x, topY, z]),
    cylinder(0.11, 0.11, 0.012, materials.get(PALETTE.stoolTop), [x, topY - 0.02, z]),
  );
  for (let index = 0; index < 3; index += 1) {
    const angle = (index / 3) * Math.PI * 2;
    const legX = x + Math.cos(angle) * 0.1;
    const legZ = z + Math.sin(angle) * 0.1;
    group.add(limb([legX, 0, legZ], [x + Math.cos(angle) * 0.075, topY - 0.02, z + Math.sin(angle) * 0.075], 0.015, materials.get(PALETTE.stoolLeg)));
  }

  group.add(cylinder(0.085, 0.07, 0.11, materials.get(PALETTE.potTerracotta), [x, topY + 0.07, z]));

  const blade = materials.get(PALETTE.leafMid);
  for (let index = 0; index < LEAF_RING; index += 1) {
    const angle = (index / LEAF_RING) * Math.PI * 2;
    const lean = 0.42;
    const spike = cone(0.028, 0.27, blade, [
      x + Math.cos(angle) * 0.07,
      topY + 0.25,
      z + Math.sin(angle) * 0.07,
    ]);
    spike.rotation.set(Math.sin(angle) * lean, 0, -Math.cos(angle) * lean);
    group.add(spike);
  }

  return group;
}

/** Macramé hanger with a trailing plant, strung from the roof. */
function createHangingPlant(materials: MaterialLibrary, at: Point): Group {
  const group = new Group();
  const [x, y, z] = at;
  const cord = materials.get(PALETTE.macrame);

  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * Math.PI * 2;
    group.add(
      limb([x, y + 0.42, z], [x + Math.cos(angle) * 0.1, y + 0.03, z + Math.sin(angle) * 0.1], 0.006, cord),
    );
  }

  group.add(
    cylinder(0.105, 0.085, 0.13, materials.get(PALETTE.potTerracotta), [x, y - 0.03, z]),
    sphere(0.11, materials.get(PALETTE.leafDark), [x, y + 0.05, z], [1, 0.5, 1]),
  );

  // Trailing vines.
  const vine = materials.get(PALETTE.leafMid);
  for (let index = 0; index < 3; index += 1) {
    const angle = index * 2.2;
    const vx = x + Math.cos(angle) * 0.085;
    const vz = z + Math.sin(angle) * 0.085;
    const drop = 0.22 + index * 0.1;
    group.add(limb([vx, y - 0.02, vz], [vx, y - drop, vz], 0.009, vine));
    for (let leaf = 0; leaf < 3; leaf += 1) {
      group.add(sphere(0.04, vine, [vx, y - 0.06 - leaf * (drop / 3.2), vz], [1, 0.45, 1]));
    }
  }

  return group;
}

/** Bookshelf against the back wall, spines drawn with one InstancedMesh per colour. */
function createBookshelf(materials: MaterialLibrary, at: Point): Group {
  const shelf = new Group();
  const [x, , z] = at;
  const wood = materials.get(PALETTE.shelfWood);
  const width = 0.62;
  const height = 1.15;
  const depth = 0.24;
  const shelves = 4;

  shelf.add(
    box([0.03, height, depth], wood, [x - width / 2, height / 2, z]),
    box([0.03, height, depth], wood, [x + width / 2, height / 2, z]),
    box([width, 0.025, depth], wood, [x, height, z]),
  );
  for (let index = 0; index < shelves; index += 1) {
    shelf.add(box([width, 0.022, depth], wood, [x, (height / shelves) * index + 0.02, z]));
  }

  const spineColors = [PALETTE.bookTeal, PALETTE.bookOrange, PALETTE.bookYellow, PALETTE.bookPurple];
  const template = roundedBox([0.036, 0.19, 0.16], 0.008, wood, [0, 0, 0]);
  for (const [colorIndex, color] of spineColors.entries()) {
    const positions: Point[] = [];
    for (let row = 0; row < shelves; row += 1) {
      for (let slot = 0; slot < 13; slot += 1) {
        if ((row * 13 + slot) % spineColors.length !== colorIndex) continue;
        positions.push([
          x - width / 2 + 0.06 + slot * 0.042,
          (height / shelves) * row + 0.128,
          z + 0.01,
        ]);
      }
    }
    if (positions.length === 0) continue;

    const books = new InstancedMesh(template.geometry, materials.get(color), positions.length);
    const matrix = new Matrix4();
    positions.forEach((position, index) => {
      matrix.makeTranslation(...position);
      books.setMatrixAt(index, matrix);
    });
    shelf.add(books);
  }

  shelf.add(
    cylinder(0.07, 0.055, 0.09, materials.get(PALETTE.potTerracotta), [x + 0.16, height + 0.06, z]),
    sphere(0.1, materials.get(PALETTE.leafDark), [x + 0.16, height + 0.14, z], [1, 0.6, 1]),
  );

  return shelf;
}

/** Framed grid calendar on the back wall. */
function createCalendar(materials: MaterialLibrary, at: Point): Group {
  const group = new Group();
  const [x, y, z] = at;

  group.add(
    box([0.36, 0.46, 0.022], materials.get(PALETTE.calendarFrame), [x, y, z]),
    box([0.32, 0.42, 0.012], materials.get(PALETTE.calendarPaper), [x, y, z + 0.012]),
  );

  const line = materials.get(PALETTE.calendarFrame);
  for (let row = 0; row < 4; row += 1) {
    group.add(box([0.28, 0.006, 0.006], line, [x, y - 0.12 + row * 0.075, z + 0.02]));
  }
  for (let column = 0; column < 5; column += 1) {
    group.add(box([0.005, 0.24, 0.006], line, [x - 0.11 + column * 0.055, y - 0.05, z + 0.02]));
  }

  return group;
}

/** Amber runner with a blue dashed border and a centre diamond. */
function createRug(materials: MaterialLibrary, at: Point, rotationY: number): Group {
  const rug = new Group();
  const width = 0.7;
  const length = 1.5;

  rug.add(box([width, 0.012, length], materials.get(PALETTE.rugBase), [0, 0.006, 0]));

  const border = materials.get(PALETTE.rugBorder);
  const dashTemplate = box([0.055, 0.006, 0.05], border, [0, 0, 0]);
  const dashes: Point[] = [];
  const dashCount = 13;
  for (let index = 0; index < dashCount; index += 1) {
    const t = -length / 2 + 0.12 + (index / (dashCount - 1)) * (length - 0.24);
    dashes.push([-width / 2 + 0.07, 0.014, t], [width / 2 - 0.07, 0.014, t]);
  }
  const dashMesh = new InstancedMesh(dashTemplate.geometry, border, dashes.length);
  const matrix = new Matrix4();
  dashes.forEach((position, index) => {
    matrix.makeTranslation(...position);
    dashMesh.setMatrixAt(index, matrix);
  });
  rug.add(dashMesh);

  const diamond = box([0.3, 0.008, 0.3], materials.get(PALETTE.rugBorder), [0, 0.013, 0]);
  diamond.rotation.y = Math.PI / 4;
  rug.add(diamond);

  rug.position.set(at[0], at[1], at[2]);
  rug.rotation.y = rotationY;
  return rug;
}

export function createDecor(materials: MaterialLibrary): Group {
  const decor = new Group();

  decor.add(
    createLeafyPlant(materials, [ROOM.minX + 0.3, 0, 0.88], 1.15),
    createStoolPlant(materials, [ROOM.minX + 0.72, 0, 1.0]),
    createHangingPlant(materials, [ROOM.minX + 0.46, 1.42, 0.5]),
    createBookshelf(materials, [-0.34, 0, ROOM.minZ + 0.14]),
    createCalendar(materials, [0.28, 1.12, ROOM.minZ + 0.03]),
    createRug(materials, [0.04, 0, 0.58], -0.46),
    // A book left on the floor by the plants.
    roundedBox([0.2, 0.045, 0.15], 0.012, materials.get(PALETTE.bookTeal), [ROOM.minX + 0.62, 0.045, 0.52]),
  );

  return decor;
}
