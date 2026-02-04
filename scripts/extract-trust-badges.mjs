import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

function loadPng(absPath) {
  return PNG.sync.read(fs.readFileSync(absPath));
}

function writePng(png, absPath) {
  fs.writeFileSync(absPath, PNG.sync.write(png));
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function crop(png, x0, y0, x1, y1) {
  const w = png.width;
  const h = png.height;
  x0 = clamp(Math.floor(x0), 0, w);
  y0 = clamp(Math.floor(y0), 0, h);
  x1 = clamp(Math.floor(x1), 0, w);
  y1 = clamp(Math.floor(y1), 0, h);
  const cw = Math.max(1, x1 - x0);
  const ch = Math.max(1, y1 - y0);
  const out = new PNG({ width: cw, height: ch });
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const si = ((y0 + y) * w + (x0 + x)) * 4;
      const di = (y * cw + x) * 4;
      out.data[di] = png.data[si];
      out.data[di + 1] = png.data[si + 1];
      out.data[di + 2] = png.data[si + 2];
      out.data[di + 3] = png.data[si + 3];
    }
  }
  return out;
}

function colorDistSq(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

function buildEdgePalette(png, step = 4) {
  const { width: w, height: h, data } = png;
  const colors = [];
  function sample(x, y) {
    const i = (y * w + x) * 4;
    const a = data[i + 3];
    if (a === 0) return;
    colors.push([data[i], data[i + 1], data[i + 2]]);
  }
  for (let x = 0; x < w; x += step) {
    sample(x, 0);
    sample(x, h - 1);
  }
  for (let y = 0; y < h; y += step) {
    sample(0, y);
    sample(w - 1, y);
  }
  return colors;
}

function dominantEdgePalette(png, { step = 2, maxColors = 8 } = {}) {
  const colors = buildEdgePalette(png, step);
  const counts = new Map();
  for (const [r, g, b] of colors) {
    // quantize to reduce noise (0..15 per channel)
    const qr = r >> 4;
    const qg = g >> 4;
    const qb = b >> 4;
    const key = (qr << 8) | (qg << 4) | qb;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors)
    .map(([key]) => {
      const qr = (key >> 8) & 0xf;
      const qg = (key >> 4) & 0xf;
      const qb = key & 0xf;
      // center of bucket
      return [qr * 16 + 8, qg * 16 + 8, qb * 16 + 8];
    });
}

function clonePng(png) {
  const out = new PNG({ width: png.width, height: png.height });
  out.data = Buffer.from(png.data);
  return out;
}

function computeXSplitsByEdgeEnergy(png, { y0Frac = 0.32, smoothWin = 9 } = {}) {
  const { width: w, height: h, data } = png;
  const y0 = Math.floor(h * y0Frac);
  const energy = new Float64Array(w);

  // Edge energy per column (difference with left neighbor)
  for (let y = y0; y < h; y++) {
    for (let x = 1; x < w; x++) {
      const i = (y * w + x) * 4;
      const il = (y * w + (x - 1)) * 4;
      const dr = Math.abs(data[i] - data[il]);
      const dg = Math.abs(data[i + 1] - data[il + 1]);
      const db = Math.abs(data[i + 2] - data[il + 2]);
      energy[x] += dr + dg + db;
    }
  }

  // Smooth
  const half = Math.max(1, (smoothWin | 0) >> 1);
  const sm = new Float64Array(w);
  for (let x = 0; x < w; x++) {
    let s = 0;
    let c = 0;
    for (let k = -half; k <= half; k++) {
      const xi = x + k;
      if (xi < 0 || xi >= w) continue;
      s += energy[xi];
      c++;
    }
    sm[x] = s / Math.max(1, c);
  }

  // Find top 4 peaks with min distance
  const candidates = [];
  for (let x = 2; x < w - 2; x++) {
    const v = sm[x];
    if (v > sm[x - 1] && v > sm[x + 1] && v > sm[x - 2] && v > sm[x + 2]) {
      candidates.push([x, v]);
    }
  }
  candidates.sort((a, b) => b[1] - a[1]);
  const peaks = [];
  const minDist = Math.floor(w / 6); // ~170 for 1024
  for (const [x, v] of candidates) {
    if (peaks.length >= 4) break;
    if (peaks.some((p) => Math.abs(p[0] - x) < minDist)) continue;
    peaks.push([x, v]);
  }
  peaks.sort((a, b) => a[0] - b[0]);

  // Fallback: equal splits
  if (peaks.length !== 4) {
    const s = [0, Math.floor(w / 4), Math.floor(w / 2), Math.floor((3 * w) / 4), w];
    return s;
  }

  // Split boundaries = minima between consecutive peaks
  const splits = [0];
  for (let i = 0; i < peaks.length - 1; i++) {
    const a = peaks[i][0];
    const b = peaks[i + 1][0];
    let bestX = Math.floor((a + b) / 2);
    let bestV = Infinity;
    for (let x = a + 10; x < b - 10; x++) {
      if (sm[x] < bestV) {
        bestV = sm[x];
        bestX = x;
      }
    }
    splits.push(bestX);
  }
  splits.push(w);
  return splits;
}

function bboxAlpha(png, { pad = 10 } = {}) {
  const { width: w, height: h, data } = png;
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a === 0) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { x0: 0, y0: 0, x1: w, y1: h };
  return {
    x0: clamp(minX - pad, 0, w),
    y0: clamp(minY - pad, 0, h),
    x1: clamp(maxX + pad, 0, w),
    y1: clamp(maxY + pad, 0, h),
  };
}

function removeBgByEdgeFloodDominant(png, { tol = 40, maxColors = 8 } = {}) {
  const { width: w, height: h, data } = png;
  const palette = dominantEdgePalette(png, { step: 2, maxColors });
  if (!palette.length) return png;
  const tolSq = tol * tol;
  const visited = new Uint8Array(w * h);
  const q = [];

  function matchesPalette(r, g, b) {
    for (let k = 0; k < palette.length; k++) {
      const [pr, pg, pb] = palette[k];
      if (colorDistSq(r, g, b, pr, pg, pb) <= tolSq) return true;
    }
    return false;
  }

  function tryPush(x, y) {
    const idx = y * w + x;
    if (visited[idx]) return;
    const i = idx * 4;
    const a = data[i + 3];
    if (a === 0) return;
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    if (!matchesPalette(r, g, b)) return;
    visited[idx] = 1;
    q.push(idx);
  }

  for (let x = 0; x < w; x++) {
    tryPush(x, 0);
    tryPush(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryPush(0, y);
    tryPush(w - 1, y);
  }

  while (q.length) {
    const idx = q.pop();
    const x = idx % w;
    const y = (idx / w) | 0;
    if (x > 0) tryPush(x - 1, y);
    if (x + 1 < w) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1);
    if (y + 1 < h) tryPush(x, y + 1);
  }

  for (let idx = 0; idx < visited.length; idx++) {
    if (visited[idx]) data[idx * 4 + 3] = 0;
  }
  return png;
}

function cropOutBottomCaption(png, { lowFrac = 0.012, minGapRows = 12, pad = 6 } = {}) {
  const w = png.width;
  const h = png.height;
  const data = png.data;
  const low = Math.max(1, Math.floor(w * lowFrac));

  const rowCount = new Uint32Array(h);
  for (let y = 0; y < h; y++) {
    let c = 0;
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a !== 0) c++;
    }
    rowCount[y] = c;
  }

  // From bottom: find bottom cluster (caption), then find a gap of mostly empty rows.
  let y = h - 1;
  while (y >= 0 && rowCount[y] <= low) y--;
  if (y < 0) return png;

  // Skip caption cluster
  while (y >= 0 && rowCount[y] > low) y--;
  // Count gap rows
  let gapEnd = y;
  let gapLen = 0;
  while (y >= 0 && rowCount[y] <= low) {
    gapLen++;
    y--;
  }
  if (gapLen < minGapRows) return png;

  const cutY = clamp(gapEnd - pad, 0, h);
  // Safety: don't cut too high
  if (cutY < Math.floor(h * 0.6)) return png;
  return crop(png, 0, 0, w, cutY);
}

function cropBeforeWideBand(png, { bandFrac = 0.92, minBandRows = 8, pad = 4 } = {}) {
  const w = png.width;
  const h = png.height;
  const data = png.data;
  const threshold = Math.floor(w * bandFrac);

  const rowCount = new Uint32Array(h);
  for (let y = 0; y < h; y++) {
    let c = 0;
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a !== 0) c++;
    }
    rowCount[y] = c;
  }

  // Find first wide band from top (likely the ribbon), then crop above it.
  let run = 0;
  for (let y = 0; y < h; y++) {
    if (rowCount[y] >= threshold) run++;
    else run = 0;

    if (run >= minBandRows) {
      const cutY = clamp(y - run - pad, 0, h);
      // Safety: don't cut too low (keep at least top half)
      if (cutY > Math.floor(h * 0.35)) {
        return crop(png, 0, 0, w, cutY);
      }
      break;
    }
  }
  return png;
}

function cropBeforeMaxWidthRun(png, { fracOfMax = 0.92, minRows = 10, pad = 6 } = {}) {
  const w = png.width;
  const h = png.height;
  const data = png.data;

  const rowCount = new Uint32Array(h);
  let maxC = 0;
  for (let y = 0; y < h; y++) {
    let c = 0;
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a !== 0) c++;
    }
    rowCount[y] = c;
    if (c > maxC) maxC = c;
  }
  if (!maxC) return png;

  const threshold = Math.floor(maxC * fracOfMax);
  let run = 0;
  for (let y = 0; y < h; y++) {
    if (rowCount[y] >= threshold) run++;
    else run = 0;

    if (run >= minRows) {
      const cutY = clamp(y - run - pad, 0, h);
      if (cutY > Math.floor(h * 0.25)) return crop(png, 0, 0, w, cutY);
      break;
    }
  }
  return png;
}

function bboxOfForeground(png, { pad = 20, tol = 42 } = {}) {
  const { width: w, height: h, data } = png;
  const palette = buildEdgePalette(png, 4);
  const tolSq = tol * tol;
  function isBg(r, g, b) {
    for (let k = 0; k < palette.length; k++) {
      const [pr, pg, pb] = palette[k];
      if (colorDistSq(r, g, b, pr, pg, pb) <= tolSq) return true;
    }
    return false;
  }

  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = data[i + 3];
      if (a === 0) continue;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (isBg(r, g, b)) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { x0: 0, y0: 0, x1: w, y1: h };
  return {
    x0: clamp(minX - pad, 0, w),
    y0: clamp(minY - pad, 0, h),
    x1: clamp(maxX + pad, 0, w),
    y1: clamp(maxY + pad, 0, h),
  };
}

const root = process.cwd();
const input = path.join(
  root,
  "..",
  ".cursor",
  "projects",
  "Users-candel-s-autrust-web",
  "assets",
  "DA6E9F17-E7A6-424C-AA80-DC1C3B6EB970-dc6f1de6-32bd-4087-8cb5-c85e3e395594.png"
);

if (!fs.existsSync(input)) {
  console.error("Missing input image:", input);
  process.exit(1);
}

const src = loadPng(input);
const outDir = path.join(root, "public");

// Auto split into 4 segments (badges) by edge density.
const splits = computeXSplitsByEdgeEnergy(src, { y0Frac: 0.32, smoothWin: 11 });
if (splits.length !== 5) {
  console.error("Unexpected splits:", splits);
  process.exit(1);
}

for (let i = 0; i < 4; i++) {
  // pad each segment a bit to avoid clipping the badge/glow
  const x0 = Math.max(0, splits[i] - 24);
  const x1 = Math.min(src.width, splits[i + 1] + 24);
  // crop to lower part where badges are (skip big empty top area)
  const rough = crop(src, x0, src.height * 0.32, x1, src.height);
  const bb = bboxOfForeground(rough, { pad: 28, tol: 52 });
  const tight = crop(rough, bb.x0, bb.y0, bb.x1, bb.y1);

  // Important: on garde les badges "pleins" (pas de suppression de fond),
  // car les couleurs du badge sont proches du fond et un flood-fill enlève tout.
  const name =
    i === 0
      ? "badge-vendeur-verifie-v2.png"
      : i === 1
        ? "badge-vehicule-verifie-v2.png"
        : i === 2
          ? "badge-annonce-securisee-v2.png"
          : "badge-garage-partenaire-v2.png";
  writePng(tight, path.join(outDir, name));
  console.log("[ok] wrote", name);

  // Version transparente (fond bleu retiré autour du badge)
  const work = removeBgByEdgeFloodDominant(clonePng(rough), { tol: 36, maxColors: 6 });
  const bbA = bboxAlpha(work, { pad: 10 });
  const transparent = crop(work, bbA.x0, bbA.y0, bbA.x1, bbA.y1);
  const tName =
    i === 0
      ? "badge-vendeur-verifie-v4.png"
      : i === 1
        ? "badge-vehicule-verifie-v4.png"
        : i === 2
          ? "badge-annonce-securisee-v4.png"
          : "badge-garage-partenaire-v4.png";
  writePng(transparent, path.join(outDir, tName));
  console.log("[ok] wrote", tName);

  // Compact icons for homepage "Confiance" (sans la ligne de sous-texte)
  if (i === 2 || i === 3) {
    // 1) remove bottom caption text
    const noCaption = cropOutBottomCaption(transparent, { lowFrac: 0.012, minGapRows: 12, pad: 6 });
    // 2) tighten again
    const bbC = bboxAlpha(noCaption, { pad: 6 });
    const icon = crop(noCaption, bbC.x0, bbC.y0, bbC.x1, bbC.y1);
    const iconName = i === 2 ? "trust-annonce-icon-v4.png" : "trust-garage-icon-v4.png";
    writePng(icon, path.join(outDir, iconName));
    console.log("[ok] wrote", iconName);
  }
}

