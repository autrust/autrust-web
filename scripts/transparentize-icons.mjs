import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

function stripTrailingAfterIend(buf) {
  // PNG signature
  if (buf.length < 12) return buf;
  const sig = buf.subarray(0, 8);
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!sig.equals(pngSig)) return buf;

  let off = 8;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    off += 8;
    off += len + 4; // data + crc
    if (type === "IEND") {
      return buf.slice(0, off);
    }
  }
  return buf;
}

/**
 * MVP background removal: key out near-black pixels (0,0,0) with feathering.
 * Keeps dark blues mostly intact while removing black matte/halo.
 */
function removeNearBlackBackground(png, { hard = 8, soft = 48 } = {}) {
  const data = png.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue;

    // Distance from black (0,0,0)
    const d = Math.sqrt(r * r + g * g + b * b);

    if (d <= hard) {
      data[i + 3] = 0;
      continue;
    }
    if (d < hard + soft) {
      const t = (d - hard) / soft; // 0..1
      data[i + 3] = Math.max(0, Math.min(255, Math.round(a * t)));
    }
  }
  return png;
}

function colorDistSq(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

function buildEdgePalette(png, step = 8) {
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

function removeBackgroundByEdgeFlood(png, { tol = 28 } = {}) {
  const { width: w, height: h, data } = png;
  const palette = buildEdgePalette(png, 6);
  if (!palette.length) return png;

  const tolSq = tol * tol;
  const visited = new Uint8Array(w * h);
  const qx = [];
  const qy = [];

  function matchesPalette(r, g, b) {
    for (let k = 0; k < palette.length; k++) {
      const [pr, pg, pb] = palette[k];
      if (colorDistSq(r, g, b, pr, pg, pb) <= tolSq) return true;
    }
    return false;
  }

  function push(x, y) {
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
    qx.push(x);
    qy.push(y);
  }

  // seed borders
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  // BFS
  while (qx.length) {
    const x = qx.pop();
    const y = qy.pop();
    if (x > 0) push(x - 1, y);
    if (x + 1 < w) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < h) push(x, y + 1);
  }

  for (let idx = 0; idx < visited.length; idx++) {
    if (!visited[idx]) continue;
    data[idx * 4 + 3] = 0;
  }

  return png;
}

function processFile(inFile, outFile) {
  const buf = stripTrailingAfterIend(fs.readFileSync(inFile));
  const png = PNG.sync.read(buf);
  // Choose strategy based on corner pixel brightness (MVP)
  const r0 = png.data[0],
    g0 = png.data[1],
    b0 = png.data[2],
    a0 = png.data[3];
  const brightness = (r0 + g0 + b0) / 3;

  let out = png;
  if (a0 === 0) {
    // already transparent
    out = png;
  } else if (brightness > 200) {
    // likely checkerboard/white matte background
    out = removeBackgroundByEdgeFlood(png, { tol: 34 });
  } else {
    // likely black matte
    out = removeNearBlackBackground(png);
  }
  const outBuf = PNG.sync.write(out);
  fs.writeFileSync(outFile, outBuf);
}

const root = process.cwd();
const targets = [
  "public/icon-voiture.png",
  "public/icon-moto.png",
  "public/icon-utilitaire.png",
  "public/icon-verified-v.png",
];

for (const rel of targets) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.warn(`[skip] missing ${rel}`);
    continue;
  }
  processFile(abs, abs);
  console.log(`[ok] transparentized ${rel}`);
}

