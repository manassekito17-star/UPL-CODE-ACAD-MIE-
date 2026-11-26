import { DOCUMENT_LIMITS } from '@/engine/documents';
import { ImageImportError, MAX_IMAGE_SIDE, importPickedImage, planImageImport, type ImportDeps } from '@/services/imageImport';

describe("plan d'import", () => {
  it('garde une image raisonnable à sa taille', () => {
    expect(planImageImport({ uri: 'file:///a.jpg', width: 1200, height: 800 })).toEqual({
      width: 1200,
      height: 800,
      resized: false,
      format: 'jpeg',
    });
  });

  it('réduit une photo de 48 Mpx dans les limites (côté et pixels), proportions gardées', () => {
    const plan = planImageImport({ uri: 'file:///a.heic', width: 8064, height: 6048, mimeType: 'image/heic' });
    expect(plan.resized).toBe(true);
    expect(Math.max(plan.width, plan.height)).toBeLessThanOrEqual(MAX_IMAGE_SIDE);
    expect(plan.width * plan.height).toBeLessThanOrEqual(DOCUMENT_LIMITS.maxPixels);
    expect(plan.width / plan.height).toBeCloseTo(8064 / 6048, 2);
    expect(plan.format).toBe('jpeg'); // HEIC converti en JPEG lisible par Skia
  });

  it('garde le PNG (transparence) pour PNG, WebP et GIF', () => {
    expect(planImageImport({ uri: 'file:///a.png', width: 10, height: 10 }).format).toBe('png');
    expect(planImageImport({ uri: 'content://x/1', width: 10, height: 10, mimeType: 'image/webp' }).format).toBe('png');
    expect(planImageImport({ uri: 'file:///a', width: 10, height: 10, fileName: 'logo.GIF' }).format).toBe('png');
  });

  it('refuse une image sans dimensions', () => {
    expect(() => planImageImport({ uri: 'file:///a.jpg', width: 0, height: 0 })).toThrow(ImageImportError);
  });
});

describe('import', () => {
  const deps = (over: Partial<ImportDeps> = {}): ImportDeps & { removed: string[] } => {
    const removed: string[] = [];
    return {
      removed,
      newId: () => 'img_1',
      copyOriginal: async (_src, name) => `file:///app/assets/${name}`,
      makeWorkingCopy: async (_src, plan, name) => ({ uri: `file:///app/assets/${name}.jpg`, width: plan.width, height: plan.height }),
      remove: (uri) => removed.push(uri),
      ...over,
    };
  };

  it("conserve une copie intacte de l'original et produit une copie de travail", async () => {
    const copied: string[] = [];
    const d = deps({
      copyOriginal: async (src, name) => {
        copied.push(src);
        return `file:///app/assets/${name}`;
      },
    });
    const asset = await importPickedImage(
      { uri: 'file:///cache/IMG_1.HEIC', width: 8064, height: 6048, fileName: 'IMG_1.HEIC', mimeType: 'image/heic' },
      d,
    );
    expect(copied).toEqual(['file:///cache/IMG_1.HEIC']); // l'original tel quel
    expect(asset.originalUri).toBe('file:///app/assets/img_1-original.heic');
    expect([asset.originalWidth, asset.originalHeight]).toEqual([8064, 6048]);
    expect(asset.uri).toBe('file:///app/assets/img_1.jpg');
    expect(Math.max(asset.width, asset.height)).toBeLessThanOrEqual(MAX_IMAGE_SIDE);
    expect(asset.fileName).toBe('IMG_1.HEIC');
  });

  it("supprime la copie de l'original si la copie de travail échoue, avec un message clair", async () => {
    const d = deps({
      makeWorkingCopy: async () => {
        throw new Error('decode failed');
      },
    });
    await expect(importPickedImage({ uri: 'file:///cache/x.tiff', width: 10, height: 10 }, d)).rejects.toThrow(
      "L'image n'a pas pu être importée (format non pris en charge ou fichier illisible).",
    );
    expect(d.removed).toEqual(['file:///app/assets/img_1-original.tiff']);
  });
});
