/**
 * Vérification du contenu réel d'un fichier téléversé (« octets magiques ») : le type déclaré par
 * le navigateur ne suffit pas (un fichier HTML renommé en .pdf serait sinon accepté).
 */
const startsWith = (b: Uint8Array, sig: number[], offset = 0) => sig.every((v, i) => b[offset + i] === v);
const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.subarray(from, to));

export function matchesDeclaredType(bytes: Uint8Array, mime: string): boolean {
  switch (mime) {
    case "application/pdf":
      return ascii(bytes, 0, 5) === "%PDF-";
    case "image/png":
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/webp":
      return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP";
    case "video/mp4":
      return ascii(bytes, 4, 8) === "ftyp";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      // Documents Office : archives ZIP.
      return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
    default:
      return false;
  }
}
