import { Group } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box, cylinder, limb, roundedBox, sphere, torus, type Point } from "./primitives";
import type { Screens } from "./screens";

export const DESK_SURFACE_Y = 0.75;

const DESK_WIDTH = 1.92;
const DESK_DEPTH = 0.86;
const TOP_THICKNESS = 0.042;
const TOP_CENTER_Y = DESK_SURFACE_Y - TOP_THICKNESS / 2;
const ON_SURFACE = DESK_SURFACE_Y + 0.004;

/** Split keyboard halves, and therefore where the figure's hands go. */
export const KEYBOARD_X = 0.14;
export const KEYBOARD_Z = -0.12;

const MONITOR_BOTTOM_Y = 0.87;
const MONITOR_TOP_Y = 1.206;
const MONITOR_Z = 0.24;
const MONITOR_X = -0.04;
// A 27" 16:9 panel is 0.686 m diagonal, so 0.598 x 0.336.
const MONITOR_WIDTH = 0.6;

const KEY_ROWS = 3;
const KEY_COLUMNS = 5;
const KEY_PITCH = 0.031;
const NOTE_LINES = 4;

/** Inner screen areas, which the screens module fills with content. */
export const MONITOR_SCREEN = [MONITOR_WIDTH - 0.05, MONITOR_TOP_Y - MONITOR_BOTTOM_Y - 0.05] as const;
export const LAPTOP_SCREEN = [0.29, 0.195] as const;

/** Ultrawide panel on a central stand, with a light bar clamped on top. */
function createMonitor(materials: MaterialLibrary, screen: Group): Group {
  const monitor = new Group();
  const height = MONITOR_TOP_Y - MONITOR_BOTTOM_Y;
  const centerY = (MONITOR_TOP_Y + MONITOR_BOTTOM_Y) / 2;
  const shell = materials.get(PALETTE.monitorShell);

  monitor.add(
    roundedBox([MONITOR_WIDTH, height, 0.032], 0.014, materials.get(PALETTE.monitorBack), [MONITOR_X, centerY, MONITOR_Z]),
    // Screen faces the figure, i.e. toward -z.
    box([MONITOR_WIDTH - 0.04, height - 0.035, 0.004], materials.unlit(PALETTE.screen), [MONITOR_X, centerY + 0.008, MONITOR_Z - 0.019]),

    // Neck and foot.
    roundedBox([0.08, 0.17, 0.05], 0.02, materials.get(PALETTE.monitorStand), [MONITOR_X, MONITOR_BOTTOM_Y - 0.07, MONITOR_Z + 0.02]),
    roundedBox([0.24, 0.018, 0.18], 0.008, materials.get(PALETTE.monitorStand), [MONITOR_X, ON_SURFACE + 0.006, MONITOR_Z + 0.02]),
  );

  // Screen content faces the figure, i.e. -z, so the panel is turned to face it.
  screen.position.set(MONITOR_X, centerY + 0.004, MONITOR_Z - 0.021);
  screen.rotation.y = Math.PI;
  monitor.add(screen);

  // Light bar: a slim housing clamped over the top bezel, throwing warm light
  // forward onto the desk rather than at the screen.
  monitor.add(
    roundedBox([0.42, 0.033, 0.066], 0.013, shell, [MONITOR_X, MONITOR_TOP_Y + 0.028, MONITOR_Z - 0.01]),
    box([0.37, 0.008, 0.048], materials.unlit(PALETTE.lightBarGlow), [MONITOR_X, MONITOR_TOP_Y + 0.013, MONITOR_Z - 0.03]),
    box([0.06, 0.05, 0.03], shell, [MONITOR_X, MONITOR_TOP_Y + 0.005, MONITOR_Z + 0.02]),
  );

  return monitor;
}

/**
 * Laptop on an angled riser, aimed at the figure's head.
 *
 * Built at a local origin with the group carrying position and rotation. It
 * previously placed every part at absolute coordinates, which meant setting
 * `rotation.y` swung the whole assembly around the world origin instead of
 * about itself.
 */
function createLaptopOnStand(materials: MaterialLibrary, at: Point, yaw: number, screen: Group): Group {
  const laptop = new Group();
  laptop.position.set(at[0], 0, at[2]);
  laptop.rotation.y = yaw;

  const shell = materials.get(PALETTE.laptopShell);
  const stand = materials.get(PALETTE.laptopStand);
  const baseY = 0.9;

  const shelf = roundedBox([0.34, 0.014, 0.24], 0.008, stand, [0, baseY - 0.01, 0]);
  shelf.rotation.x = -0.14;
  laptop.add(
    shelf,
    limb([-0.14, ON_SURFACE, 0.11], [-0.14, baseY - 0.02, -0.05], 0.012, stand),
    limb([0.14, ON_SURFACE, 0.11], [0.14, baseY - 0.02, -0.05], 0.012, stand),
  );

  const deck = roundedBox([0.32, 0.014, 0.22], 0.007, shell, [0, baseY + 0.009, 0]);
  deck.rotation.x = -0.14;
  laptop.add(deck, box([0.26, 0.003, 0.12], materials.get(PALETTE.keycap), [0, baseY + 0.022, -0.02]));

  const lid = new Group();
  lid.position.set(0, baseY + 0.018, 0.106);
  lid.rotation.x = 0.3;
  lid.add(roundedBox([0.32, 0.22, 0.012], 0.008, shell, [0, 0.11, 0]));

  screen.position.set(0, 0.11, -0.008);
  screen.rotation.y = Math.PI;
  lid.add(screen);
  laptop.add(lid);

  return laptop;
}
/** One half of a split keyboard: a tented plate with a small key grid. */
function createKeyboardHalf(materials: MaterialLibrary, centerX: number, tilt: number): Group {
  const half = new Group();
  half.position.set(centerX, ON_SURFACE + 0.012, KEYBOARD_Z);
  half.rotation.set(-0.05, tilt, 0);

  half.add(roundedBox([0.18, 0.022, 0.13], 0.012, materials.get(PALETTE.keyboard), [0, 0, 0]));

  const keycap = materials.get(PALETTE.keycap);
  const originX = -((KEY_COLUMNS - 1) * KEY_PITCH) / 2;
  const originZ = -((KEY_ROWS - 1) * KEY_PITCH) / 2;
  for (let row = 0; row < KEY_ROWS; row += 1) {
    for (let column = 0; column < KEY_COLUMNS; column += 1) {
      half.add(box([0.022, 0.006, 0.022], keycap, [originX + column * KEY_PITCH, 0.014, originZ + row * KEY_PITCH]));
    }
  }

  // Thumb cluster, which is what makes it read as a split board.
  const inward = -Math.sign(centerX);
  half.add(
    box([0.025, 0.006, 0.025], keycap, [inward * 0.048, 0.012, 0.072]),
    box([0.025, 0.006, 0.025], keycap, [inward * 0.016, 0.012, 0.08]),
  );

  return half;
}

function createNotebook(materials: MaterialLibrary, at: Point): Group {
  const notebook = new Group();
  const [x, , z] = at;
  const pages = materials.get(PALETTE.pages);

  notebook.add(
    roundedBox([0.3, 0.014, 0.23], 0.01, materials.get(PALETTE.notebookCover), [x, ON_SURFACE, z]),
    roundedBox([0.27, 0.008, 0.205], 0.006, pages, [x, ON_SURFACE + 0.011, z]),
  );

  // Spiral binding down the left edge.
  const wire = materials.get(PALETTE.penBody);
  for (let index = 0; index < 7; index += 1) {
    notebook.add(torus(0.012, 0.0035, wire, [x - 0.148, ON_SURFACE + 0.006, z - 0.085 + index * 0.028], Math.PI * 2));
  }

  const noteLine = materials.get(PALETTE.noteLine);
  for (let index = 0; index < NOTE_LINES; index += 1) {
    notebook.add(box([0.2, 0.002, 0.005], noteLine, [x + 0.01, ON_SURFACE + 0.016, z - 0.06 + index * 0.038]));
  }

  notebook.add(
    limb([x - 0.05, ON_SURFACE + 0.021, z + 0.085], [x + 0.11, ON_SURFACE + 0.021, z + 0.065], 0.0075, wire),
  );

  return notebook;
}

function createMug(materials: MaterialLibrary, at: Point): Group {
  const mug = new Group();
  const [x, , z] = at;
  const shell = materials.get(PALETTE.mug);

  const handle = torus(0.028, 0.009, shell, [x + 0.046, ON_SURFACE + 0.06, z], Math.PI);
  handle.rotation.set(Math.PI / 2, 0, -Math.PI / 2);

  mug.add(
    cylinder(0.05, 0.05, 0.012, materials.get(PALETTE.coaster), [x, ON_SURFACE + 0.006, z]),
    cylinder(0.042, 0.037, 0.1, shell, [x, ON_SURFACE + 0.062, z]),
    cylinder(0.037, 0.037, 0.004, materials.get(PALETTE.coffee), [x, ON_SURFACE + 0.111, z]),
    handle,
  );

  return mug;
}

/** Aims the laptop's screen at the figure's head, which sits at (0, ., -0.62). */
const LAPTOP_AT = [0.66, 0, 0.16] as const;
const LAPTOP_YAW_RAD = Math.atan2(LAPTOP_AT[0] - 0, LAPTOP_AT[2] - -0.62);

export function createDesk(materials: MaterialLibrary, screens: Screens): Group {
  const desk = new Group();
  const legMat = materials.get(PALETTE.deskLeg);

  desk.add(
    roundedBox([DESK_WIDTH, TOP_THICKNESS, DESK_DEPTH], 0.012, materials.get(PALETTE.deskTop), [0, TOP_CENTER_Y, 0]),
    // Felt desk mat under the working area.
    box([0.92, 0.005, 0.44], materials.get(PALETTE.deskMat), [0.08, ON_SURFACE - 0.002, -0.09]),
  );

  // Standing-desk frame: dark metal columns on flat feet, plus a crossbar.
  for (const side of [-1, 1]) {
    const legX = side * 0.76;
    desk.add(
      roundedBox([0.07, TOP_CENTER_Y - 0.04, 0.07], 0.016, legMat, [legX, (TOP_CENTER_Y - 0.04) / 2, 0]),
      roundedBox([0.1, 0.03, 0.62], 0.012, legMat, [legX, 0.015, 0]),
    );
  }
  desk.add(roundedBox([1.46, 0.05, 0.06], 0.014, legMat, [0, 0.58, 0.02]));

  desk.add(
    createMonitor(materials, screens.monitor),
    createLaptopOnStand(materials, LAPTOP_AT, LAPTOP_YAW_RAD, screens.laptop),
    createKeyboardHalf(materials, -KEYBOARD_X, 0.15),
    createKeyboardHalf(materials, KEYBOARD_X, -0.15),
    // Mouse: a squashed dome with a scroll strip.
    sphere(0.048, materials.get(PALETTE.mouse), [0.42, ON_SURFACE + 0.016, -0.14], [0.78, 0.6, 1.15]),
    box([0.007, 0.006, 0.026], materials.get(PALETTE.keycap), [0.42, ON_SURFACE + 0.04, -0.16]),
    roundedBox([0.12, 0.011, 0.1], 0.008, materials.get(PALETTE.trackpad), [0.42, ON_SURFACE + 0.005, 0.06]),
    createNotebook(materials, [-0.56, 0, -0.06]),
    createMug(materials, [0.82, 0, -0.2]),
  );

  return desk;
}

export const DESK_METRICS = {
  width: DESK_WIDTH,
  depth: DESK_DEPTH,
  surfaceY: DESK_SURFACE_Y,
  monitorTopY: MONITOR_TOP_Y,
  monitorZ: MONITOR_Z,
} as const;
