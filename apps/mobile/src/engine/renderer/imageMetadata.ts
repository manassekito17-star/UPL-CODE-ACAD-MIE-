/**
 * Résolution (pixels par pouce) écrite dans les fichiers exportés, pour que
 * les logiciels d'impression et de mise en page connaissent la taille
 * physique : bloc « pHYs » du PNG, champs de densité de l'en-tête JFIF du
 * JPEG. Le WebP n'a pas de champ standard pour cela : rien n'y est écrit.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = (CRC_TABLE[(c ^ b) & 0xff] as number) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const u32 = (v: number) => [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
const readU32 = (b: Uint8Array, o: number) => (((b[o] as number) << 24) | ((b[o + 1] as number) << 16) | ((b[o + 2] as number) << 8) | (b[o + 3] as number)) >>> 0;
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** PNG avec un bloc pHYs (pixels par mètre) ; un pHYs existant est remplacé. */
export function setPngResolution(png: Uint8Array, ppi: number): Uint8Array {
  if (!PNG_SIGNATURE.every((v, i) => png[i] === v)) throw new Error('Ce n’est pas un PNG.');
  const ppm = Math.round(ppi / 0.0254);
  const type = [0x70, 0x48, 0x59, 0x73]; // « pHYs »
  const data = [...u32(ppm), ...u32(ppm), 1];
  const chunk = new Uint8Array([...u32(9), ...type, ...data, ...u32(crc32(new Uint8Array([...type, ...data])))]);
  const parts: Uint8Array[] = [png.subarray(0, 8)];
  let offset = 8;
  while (offset < png.length) {
    const length = readU32(png, offset);
    const end = offset + 12 + length;
    const name = String.fromCharCode(...png.subarray(offset + 4, offset + 8));
    if (name !== 'pHYs') parts.push(png.subarray(offset, end));
    if (name === 'IHDR') parts.push(chunk); // pHYs doit précéder les données d'image
    offset = end;
  }
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Résolution lue dans un PNG (pixels par pouce), ou null. */
export function readPngResolution(png: Uint8Array): number | null {
  let offset = 8;
  while (offset < png.length) {
    const length = readU32(png, offset);
    if (String.fromCharCode(...png.subarray(offset + 4, offset + 8)) === 'pHYs' && png[offset + 16] === 1) {
      return Math.round(readU32(png, offset + 8) * 0.0254 * 100) / 100;
    }
    offset += 12 + length;
  }
  return null;
}

/** JPEG dont l'en-tête JFIF porte la résolution (points par pouce). */
export function setJpegResolution(jpeg: Uint8Array, ppi: number): Uint8Array {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) throw new Error('Ce n’est pas un JPEG.');
  const dpi = Math.max(1, Math.min(65535, Math.round(ppi)));
  const isJfif = jpeg[2] === 0xff && jpeg[3] === 0xe0 && String.fromCharCode(...jpeg.subarray(6, 11)) === 'JFIF\0';
  if (isJfif) {
    const out = jpeg.slice();
    out[13] = 1; // unités : points par pouce
    out[14] = dpi >> 8;
    out[15] = dpi & 0xff;
    out[16] = dpi >> 8;
    out[17] = dpi & 0xff;
    return out;
  }
  // Pas d'en-tête JFIF : on en insère un juste après le marqueur de début.
  const app0 = [0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, dpi >> 8, dpi & 0xff, dpi >> 8, dpi & 0xff, 0x00, 0x00];
  const out = new Uint8Array(jpeg.length + app0.length);
  out.set(jpeg.subarray(0, 2), 0);
  out.set(app0, 2);
  out.set(jpeg.subarray(2), 2 + app0.length);
  return out;
}

/** Résolution lue dans l'en-tête JFIF (points par pouce), ou null. */
export function readJpegResolution(jpeg: Uint8Array): number | null {
  if (jpeg[2] !== 0xff || jpeg[3] !== 0xe0 || String.fromCharCode(...jpeg.subarray(6, 11)) !== 'JFIF\0') return null;
  const x = ((jpeg[14] as number) << 8) | (jpeg[15] as number);
  if (jpeg[13] === 1) return x;
  if (jpeg[13] === 2) return Math.round(x * 2.54);
  return null;
}
