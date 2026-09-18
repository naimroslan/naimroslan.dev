import { Group, InstancedMesh, Matrix4, PlaneGeometry } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, cylinder, prism, roundedBox, torus } from "./primitives";

/**
 * Gabled tiny-house cutaway. Solid walls on -x (with the window) and -z (with
 * the gable porthole); the +x and +z faces are cut away so the interior is
 * open to the camera. Ridge runs along z, so the roof slopes down to both
 * side eaves and the gable triangle sits on the solid back wall.
 */
export const ROOM = {
  minX: -1.3,
  maxX: 1.3,
  minZ: -1.2,
  maxZ: 1.2,
  wallHeight: 1.78,
  ridgeHeight: 2.58,
  thickness: 0.08,
  loftY: 1.46,
} as const;

const PLANK_WIDTH = 0.17;
const PLANK_THICKNESS = 0.022;
const WINDOW = { z: -0.1, width: 0.78, bottom: 0.92, top: 1.56 } as const;
const PORTHOLE = { x: 0.5, y: 2.06, radius: 0.18 } as const;
/** The roof is cut back to here, so the camera can see into the room. */
const ROOF_CUT_Z = 0.15;
const ROOF_STUB_DEPTH = 0.42;

/** Floor planks as two alternating InstancedMeshes, which keeps draw calls at two. */
function createFloor(materials: MaterialLibrary): Group {
  const floor = new Group();
  const width = ROOM.maxX - ROOM.minX;
  const depth = ROOM.maxZ - ROOM.minZ;
  const plankCount = Math.floor(depth / PLANK_WIDTH);

  // Planks sit BELOW y = 0 so the floor's walking surface is exactly y = 0.
  // With them above it, everything authored at zero -- the rug, the figure's
  // shoes, the desk legs -- was buried inside the floorboards.
  floor.add(box([width, 0.06, depth], materials.get(PALETTE.floorPlankAlt), [0, -PLANK_THICKNESS - 0.03, 0]));

  const geometry = new PlaneGeometry(1, 1);
  void geometry.dispose();

  for (const [offset, color] of [[0, PALETTE.floorPlank], [1, PALETTE.floorPlankAlt]] as const) {
    const count = Math.ceil((plankCount - offset) / 2);
    const planks = new InstancedMesh(
      roundedBox([width - 0.01, PLANK_THICKNESS, PLANK_WIDTH - 0.012], 0.006, materials.get(color), [0, 0, 0]).geometry,
      materials.get(color),
      count,
    );
    const matrix = new Matrix4();
    let written = 0;
    for (let index = offset; index < plankCount; index += 2) {
      matrix.makeTranslation(0, -PLANK_THICKNESS / 2, ROOM.minZ + PLANK_WIDTH * (index + 0.5));
      planks.setMatrixAt(written, matrix);
      written += 1;
    }
    planks.count = written;
    floor.add(planks);
  }

  return floor;
}

/** The left wall, built as panels around the window opening. */
function createLeftWall(materials: MaterialLibrary): Group {
  const wall = new Group();
  const interior = materials.get(PALETTE.wallInterior);
  const depth = ROOM.maxZ - ROOM.minZ;
  const halfWindow = WINDOW.width / 2;
  const x = ROOM.minX - ROOM.thickness / 2;

  const backSpan = WINDOW.z - halfWindow - ROOM.minZ;
  const frontSpan = ROOM.maxZ - (WINDOW.z + halfWindow);

  wall.add(
    box([ROOM.thickness, ROOM.wallHeight, backSpan], interior, [x, ROOM.wallHeight / 2, ROOM.minZ + backSpan / 2]),
    box([ROOM.thickness, ROOM.wallHeight, frontSpan], interior, [x, ROOM.wallHeight / 2, ROOM.maxZ - frontSpan / 2]),
    box([ROOM.thickness, WINDOW.bottom, WINDOW.width], interior, [x, WINDOW.bottom / 2, WINDOW.z]),
    box([ROOM.thickness, ROOM.wallHeight - WINDOW.top, WINDOW.width], interior, [
      x,
      (ROOM.wallHeight + WINDOW.top) / 2,
      WINDOW.z,
    ]),
  );

  // Glowing pane plus frame and mullions: read from inside, no hole needed.
  const frame = materials.get(PALETTE.windowFrame);
  const paneHeight = WINDOW.top - WINDOW.bottom;
  const paneY = (WINDOW.top + WINDOW.bottom) / 2;

  wall.add(
    box([0.02, paneHeight, WINDOW.width], materials.get(PALETTE.windowGlow, {
      emissive: PALETTE.windowGlow,
      emissiveIntensity: 0.85,
    }), [x + 0.02, paneY, WINDOW.z]),
    box([0.05, 0.05, WINDOW.width + 0.08], frame, [x + 0.03, WINDOW.bottom, WINDOW.z]),
    box([0.05, 0.05, WINDOW.width + 0.08], frame, [x + 0.03, WINDOW.top, WINDOW.z]),
    box([0.05, paneHeight, 0.05], frame, [x + 0.03, paneY, WINDOW.z - halfWindow]),
    box([0.05, paneHeight, 0.05], frame, [x + 0.03, paneY, WINDOW.z + halfWindow]),
    // one vertical and two horizontal mullions: a 2x3 grid of panes
    box([0.035, paneHeight, 0.035], frame, [x + 0.03, paneY, WINDOW.z]),
    box([0.035, 0.035, WINDOW.width], frame, [x + 0.03, WINDOW.bottom + paneHeight / 3, WINDOW.z]),
    box([0.035, 0.035, WINDOW.width], frame, [x + 0.03, WINDOW.bottom + (paneHeight * 2) / 3, WINDOW.z]),
    // sill
    box([0.1, 0.035, WINDOW.width + 0.14], frame, [x + 0.05, WINDOW.bottom - 0.03, WINDOW.z]),
  );

  return wall;
}

/** Back wall plus the gable triangle above it, with the porthole. */
function createBackWall(materials: MaterialLibrary): Group {
  const wall = new Group();
  const interior = materials.get(PALETTE.wallInterior);
  const shade = materials.get(PALETTE.wallShade);
  const width = ROOM.maxX - ROOM.minX;
  const z = ROOM.minZ - ROOM.thickness / 2;

  wall.add(box([width, ROOM.wallHeight, ROOM.thickness], shade, [0, ROOM.wallHeight / 2, z]));

  // Gable: a triangle from the eaves up to the ridge.
  const gable = prism(
    [
      [ROOM.minX, ROOM.wallHeight],
      [ROOM.maxX, ROOM.wallHeight],
      [0, ROOM.ridgeHeight],
    ],
    ROOM.thickness,
    shade,
    [0, 0, z],
  );
  wall.add(gable);

  // Porthole: a warm disc with a ring frame. Seen from inside, so a glowing
  // pane stands in for an opening. The disc is a cylinder, whose axis is +y,
  // so it needs laying down to face the room; the torus already lies in the
  // xy-plane and must be left alone.
  const pane = cylinder(PORTHOLE.radius, PORTHOLE.radius, 0.03, materials.get(PALETTE.windowGlow, {
    emissive: PALETTE.windowGlow,
    emissiveIntensity: 0.9,
  }), [PORTHOLE.x, PORTHOLE.y, z + 0.05]);
  pane.rotation.x = Math.PI / 2;

  wall.add(
    pane,
    torus(PORTHOLE.radius + 0.015, 0.028, materials.get(PALETTE.windowFrame), [PORTHOLE.x, PORTHOLE.y, z + 0.06]),
    box([0.032, PORTHOLE.radius * 2, 0.028], materials.get(PALETTE.windowFrame), [PORTHOLE.x, PORTHOLE.y, z + 0.07]),
  );

  return wall;
}

/**
 * Roof slopes, cut back like the reference's cross-section.
 *
 * The -x slope runs most of the depth, giving the desk nook its sloping navy
 * ceiling. The +x slope is reduced to a stub against the back wall: at full
 * length it became a single enormous plane covering the entire interior, since
 * the camera looks down from the +x/+z corner that the cutaway opens.
 */
function createRoof(materials: MaterialLibrary): Group {
  const roof = new Group();
  const outer = materials.get(PALETTE.roofOuter);
  const under = materials.get(PALETTE.roofUnder);

  const run = ROOM.maxX;
  const rise = ROOM.ridgeHeight - ROOM.wallHeight;
  const slopeLength = Math.hypot(run, rise) + 0.1;
  const angle = Math.atan2(rise, run);
  const backEdge = ROOM.minZ - ROOM.thickness;

  const addSlope = (side: number, frontEdge: number) => {
    const depth = frontEdge - backEdge;
    const centerZ = (frontEdge + backEdge) / 2;

    const slope = box([slopeLength, 0.07, depth], outer, [
      (side * run) / 2,
      (ROOM.wallHeight + ROOM.ridgeHeight) / 2,
      centerZ,
    ]);
    slope.rotation.z = -side * angle;

    // Separate inner skin, so the underside reads as the dark navy ceiling.
    const lining = box([slopeLength - 0.06, 0.02, depth - 0.02], under, [
      (side * run) / 2,
      (ROOM.wallHeight + ROOM.ridgeHeight) / 2 - 0.05,
      centerZ,
    ]);
    lining.rotation.z = -side * angle;

    roof.add(slope, lining);
  };

  addSlope(-1, ROOF_CUT_Z);
  addSlope(1, ROOM.minZ + ROOF_STUB_DEPTH);

  // Ridge beam, tying the two slopes together at the cut.
  roof.add(
    box([0.09, 0.09, ROOF_CUT_Z - backEdge], materials.get(PALETTE.roofOuter), [
      0,
      ROOM.ridgeHeight - 0.02,
      (ROOF_CUT_Z + backEdge) / 2,
    ]),
  );

  return roof;
}

export function createRoom(materials: MaterialLibrary): Group {
  const room = new Group();
  room.add(createFloor(materials), createLeftWall(materials), createBackWall(materials), createRoof(materials));
  return room;
}
