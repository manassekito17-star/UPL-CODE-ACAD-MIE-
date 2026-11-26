import { useState } from 'react';

import { ChoiceDialog, type Choice } from '@/components/ui';
import { useImageImport } from '@/features/image-import/useImageImport';
import { useLayerActions } from '@/features/layers/useLayerActions';
import { useEditorUiStore } from '@/stores/editorUiStore';

export type InsertKind = 'text' | 'rectangle' | 'ellipse' | 'line' | 'image';

const ALL_CHOICES: readonly Choice<InsertKind>[] = [
  { value: 'text', label: 'Texte', icon: 'format-text', description: 'Texte modifiable' },
  { value: 'rectangle', label: 'Rectangle', icon: 'square-outline' },
  { value: 'ellipse', label: 'Cercle', icon: 'circle-outline' },
  { value: 'line', label: 'Ligne', icon: 'minus' },
  { value: 'image', label: 'Image', icon: 'image-plus', description: 'Depuis la galerie (l’original reste intact)' },
];
const SHAPE_CHOICES = ALL_CHOICES.filter((c) => c.value === 'rectangle' || c.value === 'ellipse' || c.value === 'line');

/**
 * Insertion de calques : texte, formes, image. Fournit les actions et la
 * boîte de choix (toutes les insertions, ou seulement les formes).
 */
export function useInsertMenu(documentId: string) {
  const actions = useLayerActions(documentId);
  const imageImport = useImageImport();
  const setNotice = useEditorUiStore((s) => s.setNotice);
  const [menu, setMenu] = useState<'all' | 'shapes' | null>(null);

  const insert = async (kind: InsertKind) => {
    setMenu(null);
    if (kind === 'text') actions.addText();
    else if (kind === 'image') {
      const { asset, error } = await imageImport.pick();
      if (asset) actions.addImage(asset);
      else if (error) setNotice(error);
    } else actions.addShape(kind);
  };

  const dialog = (
    <ChoiceDialog
      visible={menu !== null}
      title={menu === 'shapes' ? 'Ajouter une forme' : 'Ajouter un calque'}
      choices={menu === 'shapes' ? SHAPE_CHOICES : ALL_CHOICES}
      onChoose={(kind) => void insert(kind)}
      onCancel={() => setMenu(null)}
    />
  );

  return {
    dialog,
    importing: imageImport.importing,
    insert,
    openAll: () => setMenu('all'),
    openShapes: () => setMenu('shapes'),
  };
}
