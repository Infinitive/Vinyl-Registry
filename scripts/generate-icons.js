import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, isMaskable = false) {
  // Generate RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = (Math.min(width, height) / 2) * (isMaskable ? 0.78 : 0.92);
  const labelRadius = outerRadius * 0.35;
  const spindleRadius = outerRadius * 0.08;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable && (x === 0 || y === 0 || x === width - 1 || y === height - 1 || dist > outerRadius * 1.15)) {
        // Dark background for maskable
        buffer[idx] = 24;
        buffer[idx + 1] = 24;
        buffer[idx + 2] = 27;
        buffer[idx + 3] = 255;
        continue;
      }

      if (dist <= spindleRadius) {
        // Center spindle hole
        buffer[idx] = 18;
        buffer[idx + 1] = 18;
        buffer[idx + 2] = 20;
        buffer[idx + 3] = 255;
      } else if (dist <= labelRadius) {
        // Warm terracotta/amber center label
        buffer[idx] = 217;
        buffer[idx + 1] = 119;
        buffer[idx + 2] = 6;
        buffer[idx + 3] = 255;
      } else if (dist <= outerRadius) {
        // Vinyl body with subtle groove rings
        const groove = Math.sin(dist * 0.8) > 0.5 ? 20 : 32;
        buffer[idx] = groove;
        buffer[idx + 1] = groove;
        buffer[idx + 2] = groove + 2;
        buffer[idx + 3] = 255;
      } else {
        // Outside
        if (isMaskable) {
          buffer[idx] = 24;
          buffer[idx + 1] = 24;
          buffer[idx + 2] = 27;
          buffer[idx + 3] = 255;
        } else {
          buffer[idx] = 0;
          buffer[idx + 1] = 0;
          buffer[idx + 2] = 0;
          buffer[idx + 3] = 0; // Transparent
        }
      }
    }
  }

  // Build minimal uncompressed/deflated PNG
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let p = 0;
  for (let y = 0; y < height; y++) {
    rawData[p++] = 0; // filter type: none
    for (let x = 0; x < width * 4; x++) {
      rawData[p++] = buffer[y * width * 4 + x];
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c ^= buf[n];
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const full = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(full), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64, false));

console.log('PNG Icons successfully generated in /public');
