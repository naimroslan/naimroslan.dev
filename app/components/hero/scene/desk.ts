import { Group } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, cylinder, limb, roundedBox, torus, type Point } from "./primitives";

export const DESK_SURFACE_Y = 0.76;

const DESK_WIDTH = 1.45;
const DESK_DEPTH = 0.85;
const TOP_THICKNESS = 0.038;
const TOP_CENTER_Y = DESK_SURFACE_Y - TOP_THICKNESS / 2;
const ON_SURFACE = DESK_SURFACE_Y + 0.006;

const LEG_INSET_X = 0.62;
const LEG_INSET_Z = 0.32;

/**
 * The monitor's top edge. The camera sits above and in front, so the sight line
 * to the character's chin passes well above this — see the clearance assertion
 * in the scene check. Raising this materially will start eating the face.
 */
const MONITOR_TOP_Y = 1.21;
const MONITOR_BOTTOM_Y = 0.88;
const MONITOR_Z = 0.2;
const MONITOR_X = -0.06;

const KEY_ROWS = 3;
const KEY_COLUMNS = 5;
const KEY_PITCH = 0.032;
const NOTE_LINES_PER_PAGE = 4;
const NOTE_LINE_SPACING = 0.04;

/**
 * External monitor, facing the character. The camera therefore sees its back,
 * so the shell is rounded, the stand is real, and a faint bias-light strip
 * along the rear edge puts some of the screen's colour back in frame.
 */
function createMonitor(materials: MaterialLibrary): Group {
  const monitor = new Group();
  const height = MONITOR_TOP_Y - MONITOR_BOTTOM_Y;
  const centerY = (MONITOR_TOP_Y + MONITOR_BOTTOM_Y) / 2;

  monitor.add(
    roundedBox([0.72, height, 0.035], 0.016, materials.get(PALETTE.monitorBack), [MONITOR_X, centerY, MONITOR_Z]),
    // screen, inset on the far face so it points at the character
    box([0.68, height - 0.04, 0.004], materials.unlit(PALETTE.screen), [MONITOR_X, centerY, MONITOR_Z - 0.02]),
    // bias light: a soft glow strip behind the panel, aimed at the page
    box(
      [0.62, 0.012, 0.01],
      materials.get(PALETTE.monitorShell, { emissive: PALETTE.biasLight, emissiveIntensity: 1.6 }),
      [MONITOR_X, MONITOR_BOTTOM_Y + 0.02, MONITOR_Z + 0.022],
    ),
    // neck and foot
    roundedBox([0.07, 0.2, 0.05], 0.02, materials.get(PALETTE.monitorStand), [MONITOR_X, MONITOR_BOTTOM_Y - 0.08, MONITOR_Z + 0.01]),
    roundedBox([0.26, 0.016, 0.16], 0.008, materials.get(PALETTE.monitorStand), [MONITOR_X, ON_SURFACE + 0.004, MONITOR_Z + 0.01]),
  );

  // A couple of sticky notes on the bezel edge.
  const sticky = materials.get(PALETTE.sticky);
  monitor.add(
    box([0.05, 0.05, 0.003], sticky, [MONITOR_X + 0.31, centerY + 0.05, MONITOR_Z + 0.02]),
    box([0.05, 0.05, 0.003], sticky, [MONITOR_X + 0.31, centerY - 0.01, MONITOR_Z + 0.02]),
  );

  return monitor;
}

/** Laptop raised on an angled riser, lid open, screen toward the character. */
function createLaptopOnStand(materials: MaterialLibrary, at: Point): Group {
  const laptop = new Group();
  const [x, , z] = at;
  const shell = materials.get(PALETTE.laptopShell);
  const baseY = 0.9;

  // Riser: two angled struts and a shelf.
  const shelf = roundedBox([0.34, 0.014, 0.24], 0.008, materials.get(PALETTE.laptopStand), [x, baseY - 0.01, z]);
  shelf.rotation.x = -0.12;
  laptop.add(
    shelf,
    limb([x - 0.14, ON_SURFACE, z + 0.1], [x - 0.14, baseY - 0.02, z - 0.04], 0.011, materials.get(PALETTE.laptopStand)),
    limb([x + 0.14, ON_SURFACE, z + 0.1], [x + 0.14, baseY - 0.02, z - 0.04], 0.011, materials.get(PALETTE.laptopStand)),
  );

  const deck = roundedBox([0.32, 0.013, 0.22], 0.007, shell, [x, baseY + 0.008, z]);
  deck.rotation.x = -0.12;
  laptop.add(deck, box([0.26, 0.003, 0.12], materials.get(PALETTE.keyboard), [x, baseY + 0.02, z - 0.015]));

  // Lid hinged at the far edge, leaning away from the character.
  const lid = new Group();
  lid.position.set(x, baseY + 0.016, z + 0.108);
  lid.rotation.x = 0.28;
  lid.add(
    roundedBox([0.32, 0.21, 0.012], 0.008, shell, [0, 0.105, 0]),
    box([0.29, 0.185, 0.003], materials.unlit(PALETTE.screenGlow), [0, 0.105, -0.009]),
  );
  laptop.add(lid);

  return laptop;
}

/** One half of a split keyboard: a tented plate with a small key grid. */
function createKeyboardHalf(materials: MaterialLibrary, centerX: number, tilt: number): Group {
  const half = new Group();
  half.position.set(centerX, ON_SURFACE + 0.012, -0.16);
  half.rotation.set(-0.06, tilt, 0);

  half.add(roundedBox([0.19, 0.022, 0.13], 0.012, materials.get(PALETTE.keyboard), [0, 0, 0]));

  const keycap = materials.get(PALETTE.keycap);
  const originX = -((KEY_COLUMNS - 1) * KEY_PITCH) / 2;
  const originZ = -((KEY_ROWS - 1) * KEY_PITCH) / 2;
  for (let row = 0; row < KEY_ROWS; row += 1) {
    for (let column = 0; column < KEY_COLUMNS; column += 1) {
      half.add(
        box([0.023, 0.006, 0.023], keycap, [
          originX + column * KEY_PITCH,
          0.014,
          originZ + row * KEY_PITCH,
        ]),
      );
    }
  }

  // Thumb cluster, which is what makes it read as a split board.
  half.add(
    box([0.026, 0.006, 0.026], keycap, [Math.sign(centerX) * 0.085, 0.012, 0.072]),
    box([0.026, 0.006, 0.026], keycap, [Math.sign(centerX) * 0.052, 0.012, 0.078]),
  );

  return half;
}

function createNotebook(materials: MaterialLibrary, at: Point): Group {
  const notebook = new Group();
  const [x, , z] = at;
  const pages = materials.get(PALETTE.pages);

  notebook.add(
    roundedBox([0.36, 0.012, 0.26], 0.01, materials.get(PALETTE.notebookCover), [x, ON_SURFACE, z]),
    roundedBox([0.165, 0.008, 0.24], 0.006, pages, [x - 0.09, ON_SURFACE + 0.009, z]),
    roundedBox([0.165, 0.008, 0.24], 0.006, pages, [x + 0.09, ON_SURFACE + 0.009, z]),
  );

  const noteLine = materials.get(PALETTE.noteLine);
  const firstZ = z - 0.07;
  for (let index = 0; index < NOTE_LINES_PER_PAGE; index += 1) {
    const lineZ = firstZ + index * NOTE_LINE_SPACING;
    notebook.add(
      box([0.12, 0.002, 0.006], noteLine, [x - 0.09, ON_SURFACE + 0.014, lineZ]),
      box([0.12, 0.002, 0.006], noteLine, [x + 0.09, ON_SURFACE + 0.014, lineZ]),
    );
  }

  // Pen lying across the right-hand page.
  notebook.add(
    limb([x + 0.02, ON_SURFACE + 0.02, z + 0.09], [x + 0.16, ON_SURFACE + 0.02, z + 0.04], 0.008, materials.get(PALETTE.penBody)),
  );

  return notebook;
}

function createMug(materials: MaterialLibrary, at: Point): Group {
  const mug = new Group();
  const [x, , z] = at;
  const shell = materials.get(PALETTE.mug);

  const handle = torus(0.028, 0.009, shell, [x + 0.046, ON_SURFACE + 0.05, z], Math.PI);
  handle.rotation.set(Math.PI / 2, 0, -Math.PI / 2);

  mug.add(
    cylinder(0.044, 0.038, 0.098, shell, [x, ON_SURFACE + 0.049, z]),
    cylinder(0.038, 0.038, 0.004, materials.get(PALETTE.coffee), [x, ON_SURFACE + 0.097, z]),
    handle,
  );

  return mug;
}

export function createDesk(materials: MaterialLibrary): Group {
  const desk = new Group();
  const leg = materials.get(PALETTE.deskLeg);

  desk.add(
    roundedBox([DESK_WIDTH, TOP_THICKNESS, DESK_DEPTH], 0.014, materials.get(PALETTE.deskTop), [0, TOP_CENTER_Y, 0]),
  );

  // Four slim legs read lighter than the slab panels they replace, which is
  // what kept dominating the frame.
  for (const sideX of [-1, 1]) {
    for (const sideZ of [-1, 1]) {
      desk.add(
        roundedBox([0.05, TOP_CENTER_Y, 0.05], 0.014, leg, [
          sideX * LEG_INSET_X,
          TOP_CENTER_Y / 2,
          sideZ * LEG_INSET_Z,
        ]),
      );
    }
  }

  desk.add(
    createMonitor(materials),
    createLaptopOnStand(materials, [0.48, 0, 0.14]),
    createKeyboardHalf(materials, -0.17, 0.16),
    createKeyboardHalf(materials, 0.17, -0.16),
    // Magic Trackpad: a thin rounded slab.
    roundedBox([0.13, 0.012, 0.11], 0.008, materials.get(PALETTE.trackpad), [0.42, ON_SURFACE + 0.006, -0.18]),
    createNotebook(materials, [-0.5, 0, -0.1]),
    createMug(materials, [-0.64, 0, 0.16]),
  );

  return desk;
}

/** Consumed by the scene checks. */
export const DESK_METRICS = {
  width: DESK_WIDTH,
  depth: DESK_DEPTH,
  surfaceY: DESK_SURFACE_Y,
  monitorTopY: MONITOR_TOP_Y,
  monitorZ: MONITOR_Z,
} as const;
