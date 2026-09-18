/**
 * Generates the installed-app icons from the same pixel grid as
 * public/favicon.svg, which stays the single source of truth for the glyph.
 *
 * The favicon is transparent and theme-aware, which is what a browser tab
 * strip wants. Installed icons are the opposite case: launchers mask them and
 * iOS composites transparency onto black, so these are opaque and full bleed.
 * The tile takes the favicon's light fill and the glyph its dark fill, so the
 * icon reads as the dark-mode favicon inverted onto an ink tile.
 *
 * Run: node scripts/generate-icons.ts          (Node strips the types natively)
 *      node scripts/generate-icons.ts --check  (verify only, write nothing)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync } from "node:zlib";

const FAVICON = "public/favicon.svg";
const EXPECTED_RECTS = 11;
const EXPECTED_CELLS = 26;

/**
 * Glyph width as a fraction of the canvas. A maskable icon has to survive an
 * arbitrary mask, whose safe zone is a centred circle of radius 0.4 x size.
 * The farthest inked corner sits at cell x hypot(w/2, h/2), which for this
 * 12x5 glyph is exactly 6.5 cells, so 12 x cell <= 0.738 x size is the hard
 * ceiling. 5/8 leaves roughly 15% radial headroom and matches Android's
 * adaptive-icon convention of 66dp visible out of 108dp.
 */
const FILL_FRACTION = 0.625;
const SAFE_ZONE_RATIO = 0.4;

const BYTES_PER_PIXEL = 3;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
type Rgb = readonly [number, number, number];

function parseHex(hex: string): Rgb {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function readGlyph(): { rects: Rect[]; tile: Rgb; ink: Rgb } {
  const svg = readFileSync(FAVICON, "utf8");

  const rects = [...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/g)].map(
    (m) => ({ x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]) }),
  );
  if (rects.length !== EXPECTED_RECTS) {
    throw new Error(`${FAVICON}: expected ${EXPECTED_RECTS} rects, found ${rects.length}`);
  }

  // The light fill becomes the tile and the dark fill the glyph, so a palette
  // change in the favicon carries through to the icons.
  const light = /rect\s*\{\s*fill:\s*(#[0-9a-fA-F]{6})/.exec(svg);
  const dark = /prefers-color-scheme:\s*dark\)\s*\{\s*rect\s*\{\s*fill:\s*(#[0-9a-fA-F]{6})/.exec(svg);
  if (!light || !dark) throw new Error(`${FAVICON}: could not read both fills`);

  return { rects, tile: parseHex(light[1]), ink: parseHex(dark[1]) };
}

const { rects, tile, ink } = readGlyph();

const minX = Math.min(...rects.map((r) => r.x));
const minY = Math.min(...rects.map((r) => r.y));
const glyph = {
  x: minX,
  y: minY,
  w: Math.max(...rects.map((r) => r.x + r.w)) - minX,
  h: Math.max(...rects.map((r) => r.y + r.h)) - minY,
};

const inkedCells = rects.reduce((total, r) => total + r.w * r.h, 0);
if (inkedCells !== EXPECTED_CELLS) {
  throw new Error(`glyph covers ${inkedCells} cells, expected ${EXPECTED_CELLS}`);
}

/** Only the glyph scales; the tile is a flat fill. So every size is exact. */
function layout(size: number) {
  const cell = Math.round((FILL_FRACTION * size) / glyph.w);
  return {
    cell,
    ox: Math.round(size / 2 - (glyph.w / 2) * cell),
    oy: Math.round(size / 2 - (glyph.h / 2) * cell),
  };
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function pixels(size: number): Buffer {
  const { cell, ox, oy } = layout(size);
  const buf = Buffer.alloc(size * size * BYTES_PER_PIXEL);

  for (let i = 0; i < size * size; i += 1) {
    buf[i * 3] = tile[0];
    buf[i * 3 + 1] = tile[1];
    buf[i * 3 + 2] = tile[2];
  }

  for (const rect of rects) {
    const x0 = ox + (rect.x - glyph.x) * cell;
    const y0 = oy + (rect.y - glyph.y) * cell;
    for (let y = y0; y < y0 + rect.h * cell; y += 1) {
      for (let x = x0; x < x0 + rect.w * cell; x += 1) {
        const i = (y * size + x) * 3;
        buf[i] = ink[0];
        buf[i + 1] = ink[1];
        buf[i + 2] = ink[2];
      }
    }
  }

  return buf;
}

function encode(size: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type 2: truecolour, no alpha channel

  const stride = size * BYTES_PER_PIXEL;
  const rgb = pixels(size);
  const raw = Buffer.alloc(size * (stride + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Decodes the PNG back and asserts the pixels landed where they should. */
function verify(png: Buffer, size: number, label: string): void {
  const fail = (why: string) => {
    throw new Error(`${label}: ${why}`);
  };

  if (!png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    fail("bad PNG signature");
  }

  let offset = 8;
  let idat = Buffer.alloc(0);
  let width = 0;
  let height = 0;
  let depth = 0;
  let colour = -1;
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colour = data[9];
    } else if (type === "IDAT") {
      idat = Buffer.concat([idat, data]);
    }
    offset += 12 + length;
  }

  if (width !== size || height !== size) fail(`IHDR says ${width}x${height}, expected ${size}`);
  if (depth !== 8) fail(`bit depth ${depth}, expected 8`);
  if (colour !== 2) fail(`colour type ${colour}, expected 2 (no alpha)`);

  const stride = size * BYTES_PER_PIXEL;
  const raw = inflateSync(idat);
  if (raw.length !== size * (stride + 1)) fail(`inflated ${raw.length} bytes, expected ${size * (stride + 1)}`);

  const at = (x: number, y: number): Rgb => {
    const i = y * (stride + 1) + 1 + x * BYTES_PER_PIXEL;
    return [raw[i], raw[i + 1], raw[i + 2]];
  };
  const is = (got: Rgb, want: Rgb) => got[0] === want[0] && got[1] === want[1] && got[2] === want[2];

  for (let y = 0; y < size; y += 1) {
    if (raw[y * (stride + 1)] !== 0) fail(`row ${y} has a filter byte`);
  }

  if (!is(at(0, 0), tile)) fail("top-left corner is not the tile colour");
  if (!is(at(size - 1, size - 1), tile)) fail("bottom-right corner is not the tile colour");

  const { cell, ox, oy } = layout(size);
  for (const rect of rects) {
    const cx = ox + (rect.x - glyph.x) * cell + Math.floor((rect.w * cell) / 2);
    const cy = oy + (rect.y - glyph.y) * cell + Math.floor((rect.h * cell) / 2);
    if (!is(at(cx, cy), ink)) fail(`rect (${rect.x},${rect.y}) is not inked at its centre`);
  }

  let inked = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) if (is(at(x, y), ink)) inked += 1;
  }
  const expected = EXPECTED_CELLS * cell * cell;
  if (inked !== expected) fail(`${inked} inked pixels, expected exactly ${expected}`);

  const reach = cell * Math.hypot(glyph.w / 2, glyph.h / 2);
  const safe = SAFE_ZONE_RATIO * size;
  if (reach > safe) fail(`glyph reach ${reach.toFixed(1)}px exceeds the ${safe}px safe zone`);
}

const TARGETS = [
  { size: 192, path: "public/icon-192.png" },
  { size: 512, path: "public/icon-512.png" },
  { size: 180, path: "public/apple-touch-icon.png" },
];

const checkOnly = process.argv.includes("--check");

for (const { size, path } of TARGETS) {
  const png = checkOnly ? readFileSync(path) : encode(size);
  verify(png, size, path);
  if (!checkOnly) writeFileSync(path, png);

  const { cell } = layout(size);
  const reach = cell * Math.hypot(glyph.w / 2, glyph.h / 2);
  const used = ((reach / (SAFE_ZONE_RATIO * size)) * 100).toFixed(1);
  console.log(
    `${checkOnly ? "ok  " : "wrote"} ${path.padEnd(28)} ${size}x${size}  cell=${String(cell).padStart(2)}  ` +
      `${String(png.length).padStart(5)}B  safe zone ${used}%`,
  );
}
