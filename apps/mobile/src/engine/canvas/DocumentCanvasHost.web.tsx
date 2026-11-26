import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

import type { ComponentType } from 'react';

import type { DocumentCanvasProps } from './DocumentCanvas';

/**
 * Web (vérification visuelle uniquement, ce n'est pas une plateforme cible) :
 * Skia y tourne via CanvasKit (WebAssembly), qu'il faut charger avant de
 * monter le canvas. Le fichier canvaskit.wasm est copié dans public/ par
 * `npm run web:setup`.
 */
export function DocumentCanvasHost(props: DocumentCanvasProps) {
  return (
    <WithSkiaWeb<DocumentCanvasProps>
      opts={{ locateFile: (file: string) => `/${file}` }}
      getComponent={async (): Promise<{ default: ComponentType<DocumentCanvasProps> }> => ({
        default: (await import('./DocumentCanvas')).DocumentCanvas,
      })}
      componentProps={props}
    />
  );
}
