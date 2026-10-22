/**
 * Compares two screenshot directories from `capture.mjs` pixel by pixel with no
 * tolerance: a pixel counts as changed when any RGBA channel differs at all.
 * Both PNGs are decoded and compared inside Chromium (canvas ImageData), so this
 * needs no image library beyond the Playwright the build already uses.
 *
 * Usage: node scripts/visual-diff/compare.mjs <dirA> <dirB> [--out <diffDir>] [--max-ratio <r>]
 *
 *   --out <diffDir>  write a mask for every changed image: changed pixels red,
 *                    the rest a faded copy of the image in <dirA>
 *   --max-ratio <r>  fraction of changed pixels an image may reach, 0 to 1
 *                    (default 0; 0.00001 is 0.001%)
 *
 * Prints one line per image, sorted by changed ratio. Exits 1 when an image
 * exceeds --max-ratio, differs in size, fails to decode or exists on one side
 * only, and 2 on bad arguments or when neither directory holds a PNG.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const USAGE =
  'Usage: node scripts/visual-diff/compare.mjs <dirA> <dirB> [--out <diffDir>] [--max-ratio <r>]';
const usage = (message) => {
  console.error(`${message}\n${USAGE}`);
  process.exit(2);
};

let args;
try {
  args = parseArgs({
    allowPositionals: true,
    options: { out: { type: 'string' }, 'max-ratio': { type: 'string', default: '0' } },
  });
} catch (err) {
  usage(err.message);
}
const [dirA, dirB] = args.positionals.map((dir) => resolve(dir));
const outDir = args.values.out && resolve(args.values.out);
const maxRatio = Number(args.values['max-ratio']);
if (args.positionals.length !== 2) usage('Expected exactly two directories.');
if (!(maxRatio >= 0 && maxRatio <= 1)) usage('--max-ratio is a fraction from 0 to 1.');
if (outDir === dirA || outDir === dirB) usage('--out must not be one of the compared directories.');
for (const dir of [dirA, dirB]) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) usage(`${dir} is not a directory.`);
}

const listImages = (dir) => new Set(readdirSync(dir).filter((file) => file.endsWith('.png')));
const filesA = listImages(dirA);
const filesB = listImages(dirB);
const names = [...new Set([...filesA, ...filesB])].sort();
if (names.length === 0) usage('Neither directory holds a PNG.');
if (outDir) mkdirSync(outDir, { recursive: true });

/**
 * Runs inside Chromium. Decodes both PNGs without color-space conversion and
 * counts the pixels whose RGBA differs; outside the overlap of two different
 * sizes, every pixel counts as changed.
 */
const diffInPage = async ({ a, b, withMask }) => {
  const decode = async (base64) => {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }), {
      colorSpaceConversion: 'none',
      premultiplyAlpha: 'none',
    });
    const { width, height } = bitmap;
    const context = new OffscreenCanvas(width, height).getContext('2d', {
      willReadFrequently: true,
    });
    context.drawImage(bitmap, 0, 0);
    const { data } = context.getImageData(0, 0, width, height);
    return { pixels: new Uint32Array(data.buffer), width, height };
  };
  const [imgA, imgB] = await Promise.all([decode(a), decode(b)]);
  const width = Math.max(imgA.width, imgB.width);
  const height = Math.max(imgA.height, imgB.height);
  const mask = withMask ? new ImageData(width, height) : null;
  const maskPixels = mask && new Uint32Array(mask.data.buffer);
  const box = { left: width, top: height, right: -1, bottom: -1 };
  let changed = 0;
  let maxDelta = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inA = x < imgA.width && y < imgA.height;
      const inB = x < imgB.width && y < imgB.height;
      const pa = inA ? imgA.pixels[y * imgA.width + x] : 0;
      const pb = inB ? imgB.pixels[y * imgB.width + x] : 0;
      let delta = 255;
      if (inA && inB) {
        if (pa === pb) {
          if (maskPixels) {
            // Little-endian RGBA: brightness of A, faded to 192-255 grey.
            const brightness =
              ((pa & 255) * 299 + ((pa >>> 8) & 255) * 587 + ((pa >>> 16) & 255) * 114) / 1000;
            const grey = 192 + (brightness >> 2);
            maskPixels[y * width + x] = 0xff000000 | (grey << 16) | (grey << 8) | grey;
          }
          continue;
        }
        delta = 0;
        for (let shift = 0; shift < 32; shift += 8) {
          delta = Math.max(delta, Math.abs(((pa >>> shift) & 255) - ((pb >>> shift) & 255)));
        }
      }
      changed++;
      maxDelta = Math.max(maxDelta, delta);
      box.left = Math.min(box.left, x);
      box.top = Math.min(box.top, y);
      box.right = Math.max(box.right, x);
      box.bottom = Math.max(box.bottom, y);
      if (maskPixels) maskPixels[y * width + x] = 0xff0000ff; // opaque red
    }
  }
  let maskBase64 = null;
  if (mask && changed > 0) {
    const canvas = new OffscreenCanvas(width, height);
    canvas.getContext('2d').putImageData(mask, 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const dataUrl = await new Promise((done) => {
      const reader = new FileReader();
      reader.onload = () => done(reader.result);
      reader.readAsDataURL(blob);
    });
    maskBase64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  }
  return {
    sizeA: `${imgA.width}x${imgA.height}`,
    sizeB: `${imgB.width}x${imgB.height}`,
    ratio: changed / (width * height),
    changed,
    maxDelta,
    box: `${box.left},${box.top} ${box.right - box.left + 1}x${box.bottom - box.top + 1}`,
    maskBase64,
  };
};

const rows = [];
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const name of names) {
    if (!filesA.has(name) || !filesB.has(name)) {
      rows.push({ name, missing: filesA.has(name) ? dirB : dirA });
      continue;
    }
    const bytesA = readFileSync(join(dirA, name));
    const bytesB = readFileSync(join(dirB, name));
    if (bytesA.equals(bytesB)) {
      rows.push({ name, ratio: 0, changed: 0 });
      continue;
    }
    try {
      const arg = {
        a: bytesA.toString('base64'),
        b: bytesB.toString('base64'),
        withMask: !!outDir,
      };
      const { maskBase64, ...result } = await page.evaluate(diffInPage, arg);
      rows.push({ name, ...result, resized: result.sizeA !== result.sizeB });
      if (maskBase64) writeFileSync(join(outDir, name), Buffer.from(maskBase64, 'base64'));
    } catch (err) {
      rows.push({ name, error: err.message.split('\n')[0] });
    }
  }
} finally {
  await browser.close();
}

const failed = (row) => !!(row.missing || row.error || row.resized || row.ratio > maxRatio);
const note = (row) => {
  if (row.missing) return `missing from ${row.missing}`;
  if (row.error) return `error: ${row.error}`;
  const notes = row.resized ? [`size ${row.sizeA} vs ${row.sizeB}`] : [];
  if (row.changed > 0) notes.push(`max channel delta ${row.maxDelta}`, `box ${row.box}`);
  return notes.join(', ');
};
const rank = (row) => row.ratio ?? Infinity;
rows.sort((x, y) => rank(y) - rank(x) || x.name.localeCompare(y.name));
for (const row of rows) {
  const ratio = row.ratio === undefined ? '' : `${(row.ratio * 100).toFixed(6)}%`;
  const count = row.changed === undefined ? '' : `${row.changed} px`;
  const status = failed(row) ? 'FAIL' : 'ok';
  console.log(
    `${status.padEnd(4)} ${ratio.padStart(11)} ${count.padStart(11)}  ${row.name}  ${note(row)}`.trimEnd()
  );
}
const failures = rows.filter(failed).length;
console.log(`${failures} of ${rows.length} images fail at --max-ratio ${maxRatio}`);
if (outDir && rows.some((row) => row.changed > 0)) console.log(`Diff masks: ${outDir}`);
if (failures > 0) process.exitCode = 1;
