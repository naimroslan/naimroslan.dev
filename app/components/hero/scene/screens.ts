import { Group, type Mesh } from "three";

import { PALETTE, type MaterialLibrary } from "./palette";
import { box } from "./primitives";

/**
 * Screen content built from emissive bars rather than a canvas texture.
 *
 * A CanvasTexture would need `document.createElement("canvas")`, which rules it
 * out of the offline preview renderer entirely -- and that renderer is the only
 * way this gets looked at before shipping. At this scale nothing is lost: the
 * monitor renders ~120px wide in the hero, so no technique produces readable
 * glyphs. What reads is the pattern of coloured lines.
 */

const ROWS_PER_PANE = 8;
const ROW_PITCH = 0.026;
const ROW_HEIGHT = 0.009;
/** Terminal advances this many times a second -- not 60. */
const STEPS_PER_SECOND = 6;
const HOLD_STEPS = 5;
const SPINNER_FRAMES = 4;

/** Deterministic pseudo-random row widths, so output looks like text. */
const rowWidth = (pane: number, row: number, maxWidth: number) => {
  const noise = Math.sin((pane * 31 + row * 17) * 12.9898) * 43758.5453;
  const fraction = 0.35 + (noise - Math.floor(noise)) * 0.6;
  return maxWidth * fraction;
};

interface Pane {
  rows: Mesh[];
  cursor: Mesh;
  spinner: Mesh;
  spinnerHome: number;
  revealed: number;
}

export interface Screens {
  monitor: Group;
  laptop: Group;
  /** Returns true when something visibly changed and the frame needs redrawing. */
  update(elapsedSeconds: number): boolean;
}

/**
 * Two terminal panes side by side, each streaming output: one agent per pane,
 * running at different rates so they read as independent processes.
 */
function buildMonitorContent(
  materials: MaterialLibrary,
  width: number,
  height: number,
): { group: Group; panes: Pane[] } {
  const group = new Group();
  const panes: Pane[] = [];

  group.add(box([width, height, 0.002], materials.get(PALETTE.terminalBg), [0, 0, 0]));

  const paneWidth = (width - 0.03) / 2;
  const accents = [PALETTE.agentOne, PALETTE.agentTwo];

  for (let index = 0; index < 2; index += 1) {
    const centerX = (index === 0 ? -1 : 1) * (paneWidth / 2 + 0.008);
    const accent = materials.get(accents[index], {
      emissive: accents[index],
      emissiveIntensity: 0.5,
    });
    const dim = materials.get(PALETTE.terminalDim);
    const top = height / 2 - 0.028;

    // Tab strip, then the agent's own prompt line.
    group.add(
      box([paneWidth, 0.014, 0.002], materials.get(PALETTE.terminalChrome), [centerX, height / 2 - 0.011, 0.002]),
      box([paneWidth * 0.34, 0.008, 0.002], accent, [centerX - paneWidth * 0.3, height / 2 - 0.011, 0.003]),
    );

    const rows: Mesh[] = [];
    for (let row = 0; row < ROWS_PER_PANE; row += 1) {
      const rowWidthValue = rowWidth(index, row, paneWidth * 0.86);
      // Every third line is the agent's own accent; the rest is dim output.
      const bar = box([rowWidthValue, ROW_HEIGHT, 0.002], row % 3 === 0 ? accent : dim, [
        centerX - paneWidth * 0.43 + rowWidthValue / 2,
        top - 0.014 - row * ROW_PITCH,
        0.003,
      ]);
      // Named so the animation test can count revealed rows per pane; a single
      // total cannot tell A=3,B=5 apart from A=4,B=4.
      bar.name = `agent${index}-row${row}`;
      rows.push(bar);
      group.add(bar);
    }

    const spinnerHome = top - 0.014;
    const spinner = box([0.01, 0.01, 0.002], accent, [centerX + paneWidth * 0.4, spinnerHome, 0.003]);
    const cursor = box([0.012, ROW_HEIGHT, 0.002], materials.get(PALETTE.terminalCursor), [
      centerX - paneWidth * 0.43,
      spinnerHome,
      0.003,
    ]);
    group.add(spinner, cursor);

    panes.push({ rows, cursor, spinner, spinnerHome, revealed: 0 });
  }

  // Divider between the two panes.
  group.add(box([0.003, height - 0.03, 0.002], materials.get(PALETTE.terminalChrome), [0, -0.012, 0.003]));

  return { group, panes };
}

/** Laptop desktop: two windows, one top-left and one bottom-right. */
function buildLaptopContent(materials: MaterialLibrary, width: number, height: number): Group {
  const group = new Group();
  group.add(box([width, height, 0.002], materials.get(PALETTE.windowBg), [0, 0, 0]));

  const windowWidth = width * 0.52;
  const windowHeight = height * 0.5;
  const chrome = materials.get(PALETTE.windowChrome);
  const line = materials.get(PALETTE.windowLine);

  const placements = [
    [-(width / 2 - windowWidth / 2 - 0.012), height / 2 - windowHeight / 2 - 0.012],
    [width / 2 - windowWidth / 2 - 0.012, -(height / 2 - windowHeight / 2 - 0.012)],
  ] as const;

  for (const [cx, cy] of placements) {
    group.add(
      box([windowWidth, windowHeight, 0.002], materials.get(PALETTE.terminalBg), [cx, cy, 0.002]),
      // Title bar across the top of the window.
      box([windowWidth, 0.014, 0.002], chrome, [cx, cy + windowHeight / 2 - 0.007, 0.003]),
    );
    for (let row = 0; row < 3; row += 1) {
      const barWidth = rowWidth(cx > 0 ? 3 : 2, row, windowWidth * 0.78);
      group.add(
        box([barWidth, 0.007, 0.002], line, [
          cx - windowWidth * 0.39 + barWidth / 2,
          cy + windowHeight / 2 - 0.032 - row * 0.02,
          0.003,
        ]),
      );
    }
  }

  return group;
}

export function createScreens(
  materials: MaterialLibrary,
  monitorSize: readonly [number, number],
  laptopSize: readonly [number, number],
): Screens {
  const { group: monitor, panes } = buildMonitorContent(materials, monitorSize[0], monitorSize[1]);
  const laptop = buildLaptopContent(materials, laptopSize[0], laptopSize[1]);

  let lastStep = -1;

  return {
    monitor,
    laptop,

    update(elapsedSeconds) {
      const step = Math.floor(elapsedSeconds * STEPS_PER_SECOND);
      if (step === lastStep) return false;
      lastStep = step;

      panes.forEach((pane, index) => {
        // Different cycle lengths, so the two agents are visibly out of step.
        const cycle = ROWS_PER_PANE + HOLD_STEPS + index * 3;
        const phase = ((step + index * 4) % cycle + cycle) % cycle;
        pane.revealed = Math.min(phase, ROWS_PER_PANE);

        pane.rows.forEach((row, rowIndex) => {
          row.visible = rowIndex < pane.revealed;
        });

        const atRow = Math.min(pane.revealed, ROWS_PER_PANE - 1);
        pane.cursor.position.y = pane.spinnerHome - 0.014 - atRow * ROW_PITCH;
        pane.cursor.visible = pane.revealed < ROWS_PER_PANE && step % 2 === 0;

        // Spinner hops through a few positions while the agent is working.
        const frame = step % SPINNER_FRAMES;
        pane.spinner.position.y = pane.spinnerHome - frame * 0.003;
        pane.spinner.visible = pane.revealed < ROWS_PER_PANE;
      });

      return true;
    },
  };
}
