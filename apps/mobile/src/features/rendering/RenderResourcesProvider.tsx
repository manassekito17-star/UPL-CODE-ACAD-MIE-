import { Skia, useFonts, type SkImage } from '@shopify/react-native-skia';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Layer } from '@/engine/layers';
import { NO_RESOURCES, TEXT_FONT_FAMILY, type RenderResources } from '@/engine/renderer';

/**
 * Ressources de rendu de l'éditeur : la police embarquée (Inter, licence
 * OFL) et les images du document décodées par Skia. Le canvas
 * et l'export (M4) utilisent exactement les mêmes.
 */
const RenderResourcesContext = createContext<RenderResources>(NO_RESOURCES);

export function useRenderResources(): RenderResources {
  return useContext(RenderResourcesContext);
}

const FONT_FILES = [
  require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
];

/**
 * Décode les images des calques. Chaque fichier n'est décodé qu'une fois ;
 * les images qui ne sont plus utilisées sortent du cache (le ramasse-miettes
 * libère alors leur mémoire native).
 */
function useDecodedImages(layers: readonly Layer[]): ReadonlyMap<string, SkImage> {
  const uris = useMemo(
    () => [...new Set(layers.flatMap((l) => (l.type === 'image' ? [l.asset.uri] : [])))].sort().join('\n'),
    [layers],
  );
  const [images, setImages] = useState<ReadonlyMap<string, SkImage>>(new Map());
  const cache = useRef(new Map<string, SkImage>());

  useEffect(() => {
    let cancelled = false;
    const wanted = uris === '' ? [] : uris.split('\n');
    for (const uri of [...cache.current.keys()]) {
      if (!wanted.includes(uri)) cache.current.delete(uri);
    }
    const missing = wanted.filter((uri) => !cache.current.has(uri));
    const decode = async (uri: string): Promise<[string, SkImage | null]> => {
      try {
        const data = await Skia.Data.fromURI(uri);
        return [uri, Skia.Image.MakeImageFromEncoded(data)];
      } catch {
        return [uri, null];
      }
    };
    // Publication asynchrone (jamais de mise à jour d'état synchrone dans un effet).
    Promise.all(missing.map(decode)).then((decoded) => {
      if (cancelled) return;
      for (const [uri, image] of decoded) if (image) cache.current.set(uri, image);
      setImages(new Map(cache.current));
    });
    return () => {
      cancelled = true;
    };
  }, [uris]);

  return images;
}

export function RenderResourcesProvider({ layers, children }: { layers: readonly Layer[]; children: ReactNode }) {
  const fonts = useFonts({ [TEXT_FONT_FAMILY]: FONT_FILES });
  const images = useDecodedImages(layers);
  const value = useMemo<RenderResources>(() => ({ fonts, images }), [fonts, images]);
  return <RenderResourcesContext.Provider value={value}>{children}</RenderResourcesContext.Provider>;
}
