import { Group, Mesh, TorusGeometry, type Material } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, connect, cylinder, outline, type Point } from "./primitives";

export const DESK_SURFACE_Y = 0.76;

const TOP_THICKNESS = 0.04;
const TOP_CENTER_Y = DESK_SURFACE_Y - TOP_THICKNESS / 2;
const ON_SURFACE = DESK_SURFACE_Y + 0.008;

const LID_TILT_RAD = 0.32;
const NOTE_LINES_PER_PAGE = 4;
const NOTE_LINE_SPACING = 0.042;
const PEN_RADIUS = 0.007;

/** Ruled lines on one notebook page, front to back. */
function addNoteLines(page: Group, centerX: number, material: Material): void {
  const firstZ = -0.26;
  for (let index = 0; index < NOTE_LINES_PER_PAGE; index += 1) {
    page.add(
      box([0.115, 0.003, 0.008], material, [
        centerX,
        ON_SURFACE + 0.012,
        firstZ + index * NOTE_LINE_SPACING,
      ]),
    );
  }
}

function createLaptop(materials: MaterialLibrary, contour: Material, at: Point): Group {
  const laptop = new Group();
  const body = materials.get(PALETTE.laptopBody);
  const [x, , z] = at;

  laptop.add(
    outline(box([0.34, 0.016, 0.24], body, [x, ON_SURFACE, z]), contour),
    box([0.28, 0.004, 0.14], materials.get(PALETTE.laptopScreen), [x, ON_SURFACE + 0.01, z - 0.02]),
    box([0.08, 0.004, 0.05], materials.get(PALETTE.pages), [x, ON_SURFACE + 0.01, z + 0.08]),
  );

  // The lid is its own group so it can be rotated about the hinge rather than
  // having its offset position solved by hand.
  const lid = new Group();
  lid.position.set(x, ON_SURFACE + 0.008, z + 0.12);
  lid.rotation.x = LID_TILT_RAD;
  lid.add(
    outline(box([0.34, 0.225, 0.014], body, [0, 0.1125, 0]), contour),
    box([0.31, 0.2, 0.004], materials.unlit(PALETTE.screenGlow), [0, 0.1125, -0.01]),
  );
  laptop.add(lid);

  return laptop;
}

function createNotebook(materials: MaterialLibrary, contour: Material, at: Point): Group {
  const notebook = new Group();
  const pages = materials.get(PALETTE.pages);
  const [x, , z] = at;

  notebook.add(
    outline(box([0.34, 0.012, 0.25], materials.get(PALETTE.notebookCover), [x, ON_SURFACE, z]), contour),
    box([0.155, 0.006, 0.23], pages, [x - 0.085, ON_SURFACE + 0.009, z]),
    box([0.155, 0.006, 0.23], pages, [x + 0.085, ON_SURFACE + 0.009, z]),
  );

  const noteLine = materials.get(PALETTE.noteLine);
  addNoteLines(notebook, x - 0.085, noteLine);
  addNoteLines(notebook, x + 0.085, noteLine);

  return notebook;
}

function createMug(materials: MaterialLibrary, contour: Material, at: Point): Group {
  const mug = new Group();
  const shell = materials.get(PALETTE.mug);
  const [x, , z] = at;

  const handle = new Mesh(new TorusGeometry(0.028, 0.008, 6, 10, Math.PI), shell);
  handle.position.set(x + 0.044, ON_SURFACE + 0.05, z);
  handle.rotation.set(Math.PI / 2, 0, -Math.PI / 2);

  mug.add(
    outline(cylinder(0.042, 0.036, 0.095, shell, [x, ON_SURFACE + 0.048, z], 12), contour),
    cylinder(0.036, 0.036, 0.004, materials.get(PALETTE.coffee), [x, ON_SURFACE + 0.094, z], 12),
    handle,
  );

  return mug;
}

export function createDesk(materials: MaterialLibrary, contour: Material): Group {
  const desk = new Group();
  const leg = materials.get(PALETTE.deskLeg);

  desk.add(
    outline(box([1.44, TOP_THICKNESS, 0.8], materials.get(PALETTE.deskTop), [0, TOP_CENTER_Y, 0]), contour),
    outline(box([0.04, TOP_CENTER_Y, 0.6], leg, [-0.66, TOP_CENTER_Y / 2, 0]), contour),
    outline(box([0.04, TOP_CENTER_Y, 0.6], leg, [0.66, TOP_CENTER_Y / 2, 0]), contour),
  );

  desk.add(
    createLaptop(materials, contour, [0.02, 0, -0.14]),
    createNotebook(materials, contour, [-0.42, 0, -0.18]),
    createMug(materials, contour, [0.44, 0, -0.22]),
  );

  // Pens scattered the way they actually end up on a desk.
  desk.add(
    connect([-0.14, ON_SURFACE, 0.18], [0.02, ON_SURFACE, 0.22], PEN_RADIUS, materials.get(PALETTE.penBody)),
    connect([-0.11, ON_SURFACE, 0.27], [0.06, ON_SURFACE, 0.29], PEN_RADIUS, materials.get(PALETTE.penAccent)),
    connect([-0.48, ON_SURFACE, 0.06], [-0.33, ON_SURFACE, 0.11], PEN_RADIUS, materials.get(PALETTE.penBlue)),
  );

  return desk;
}
