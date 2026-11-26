import { act, fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

import type { ShapeLayer } from '@/engine/layers';
import { resetDocumentStore, useDocumentStore } from '@/stores/documentStore';
import { resetEditorUiStore, useEditorUiStore } from '@/stores/editorUiStore';
import { resetWorkspaceStore, useWorkspaceStore } from '@/stores/workspaceStore';

// Tablette en paysage : espace studio complet, dock large.
jest.mock('@/hooks/useBreakpoint', () => ({
  ...jest.requireActual('@/hooks/useBreakpoint'),
  useBreakpoint: () => 'expanded',
}));

let docId = '';
const doc = () => useDocumentStore.getState().documents[docId];
const layers = () => doc()?.layers ?? [];
const button = (name: string | RegExp) => screen.getByRole('button', { name });
const menuItem = (name: string) => within(screen.getByTestId('menu-dropdown')).getByRole('menuitem', { name });

async function openStudio() {
  docId = useDocumentStore.getState().createDocument({ width: 1000, height: 500, background: 'white', name: 'Affiche' }).id;
  await renderRouter('src/app', { initialUrl: `/editor/${docId}` });
}

async function openMenu(title: string) {
  await fireEvent.press(button(`Menu ${title}`));
}

/** Ajoute un rectangle par le menu Calque. */
async function addRectangle() {
  await openMenu('Calque');
  await fireEvent.press(menuItem('Rectangle'));
}

beforeEach(() => {
  resetDocumentStore();
  resetEditorUiStore();
  resetWorkspaceStore();
});

describe('espace studio : disposition', () => {
  it('affiche menus, options, outils, onglet, règles, toile, dock et barre d’état', async () => {
    await openStudio();
    for (const id of ['menu-bar', 'options-bar', 'tool-rail', 'doc-tabs', 'rulers', 'document-canvas', 'dock', 'status-bar']) {
      expect(screen.getByTestId(id)).toBeTruthy();
    }
    for (const title of ['Fichier', 'Édition', 'Image', 'Calque', 'Texte', 'Sélection', 'Filtre', 'Affichage', 'Fenêtre', 'Aide']) {
      expect(button(`Menu ${title}`)).toBeTruthy();
    }
    expect(screen.getByLabelText('Document Affiche @ …% (Arrière-plan, RVB/8), non enregistré')).toBeTruthy();
    // 1000 × 500 × 3 octets aplatis = 1,43M ; un document sans calque.
    expect(screen.getByLabelText('Taille du document : Doc : 1,43M/1,43M')).toBeTruthy();
    for (const tab of ['Couleur', 'Nuancier', 'Propriétés', 'Réglages', 'Calques', 'Couches', 'Tracés']) {
      expect(screen.getByRole('tab', { name: tab })).toBeTruthy();
    }
    for (const panel of ['Historique', 'Navigateur', 'Caractère', 'Paragraphe']) {
      expect(within(screen.getByTestId('panel-strip')).getByRole('button', { name: panel })).toBeTruthy();
    }
    // L'espace téléphone n'est pas rendu.
    expect(screen.queryByTestId('editor-toolbar')).toBeNull();
  });

  it('le zoom de l’onglet et de la barre d’état suit la toile', async () => {
    await openStudio();
    await act(async () => {
      fireEvent(screen.getByTestId('document-canvas'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 600, height: 500 } } });
    });
    // 1000 px dans 552 points (marges de 24) : 0,552 point par pixel, densité 2 → 110 %.
    expect(screen.getByTestId('status-zoom').props.value).toBe('110');
    expect(screen.getByLabelText(/^Document Affiche @ 110% /)).toBeTruthy();
    await openMenu('Affichage');
    await fireEvent.press(menuItem('100 %'));
    expect(screen.getByTestId('status-zoom').props.value).toBe('100');

    // Saisie directe du zoom dans la barre d'état.
    const field = screen.getByTestId('status-zoom');
    await fireEvent.changeText(field, '50');
    await fireEvent(field, 'submitEditing');
    expect(screen.getByLabelText(/^Document Affiche @ 50% /)).toBeTruthy();
  });

  it('la barre d’état change d’information par son menu', async () => {
    await openStudio();
    await addRectangle();
    // Le rectangle (4 octets par pixel de sa surface) s'ajoute au document aplati.
    const r = layers()[0] as ShapeLayer;
    const layered = ((1000 * 500 * 3 + r.width * r.height * 4) / 1048576).toFixed(2).replace('.', ',');
    expect(screen.getByLabelText(`Taille du document : Doc : 1,43M/${layered}M`)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('status-info'));
    await fireEvent.press(within(screen.getByTestId('status-menu')).getByRole('menuitem', { name: 'Dimensions du document' }));
    expect(screen.getByLabelText('Dimensions du document : 1000 × 500 px')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('status-info'));
    await fireEvent.press(within(screen.getByTestId('status-menu')).getByRole('menuitem', { name: 'Outil actif' }));
    expect(screen.getByLabelText('Outil actif : Déplacement')).toBeTruthy();
  });
});

describe('espace studio : menus', () => {
  it('les commandes prévues sont désactivées et portent leur module', async () => {
    await openStudio();
    await openMenu('Fichier');
    expect(menuItem('Enregistrer')).toBeDisabled();
    expect(within(screen.getByTestId('menu-dropdown')).getAllByText('Prévu · M3').length).toBeGreaterThan(0);
    expect(menuItem('Nouveau…')).toBeEnabled();
    // Le fond du menu est masqué aux lecteurs d'écran par la fenêtre modale.
    await fireEvent.press(screen.getByLabelText('Fermer le menu', { includeHiddenElements: true }));
    expect(screen.queryByTestId('menu-dropdown')).toBeNull();

    await openMenu('Filtre');
    expect(menuItem('Flou gaussien…')).toBeDisabled();
  });

  it('Calque : insère, duplique, masque, réordonne et supprime après confirmation', async () => {
    await openStudio();
    await openMenu('Calque');
    expect(menuItem('Dupliquer le calque')).toBeDisabled(); // aucun calque sélectionné
    expect(menuItem('Grouper les calques')).toBeDisabled(); // prévu M7
    await fireEvent.press(menuItem('Rectangle'));
    expect(layers().map((l) => l.name)).toEqual(['Rectangle 1']);
    expect(useEditorUiStore.getState().activeTool).toBe('select');

    await openMenu('Calque');
    await fireEvent.press(menuItem('Dupliquer le calque'));
    expect(layers()).toHaveLength(2);
    const copyId = useEditorUiStore.getState().selectedLayerId;
    await openMenu('Calque');
    await fireEvent.press(menuItem('Arrière-plan'));
    expect(layers()[0]?.id).toBe(copyId);

    await openMenu('Calque');
    await fireEvent.press(menuItem('Masquer le calque'));
    expect(layers()[0]?.visible).toBe(false);

    await openMenu('Calque');
    await fireEvent.press(menuItem('Supprimer le calque…'));
    const dialog = screen.getByTestId('confirm-dialog');
    await fireEvent.press(within(dialog).getByRole('button', { name: 'Supprimer' }));
    expect(layers()).toHaveLength(1);
    expect(layers().some((l) => l.id === copyId)).toBe(false);
  });

  it('Affichage masque les règles ; Fenêtre masque un panneau puis réinitialise', async () => {
    await openStudio();
    await openMenu('Affichage');
    await fireEvent.press(menuItem('Règles'));
    expect(screen.queryByTestId('rulers')).toBeNull();
    expect(screen.getByTestId('document-canvas')).toBeTruthy();

    await openMenu('Fenêtre');
    await fireEvent.press(menuItem('Calques'));
    expect(screen.queryByRole('tab', { name: 'Calques' })).toBeNull();
    expect(screen.getByRole('tab', { name: 'Couches' })).toBeSelected();

    await openMenu('Fenêtre');
    await fireEvent.press(menuItem('Réinitialiser l’espace de travail'));
    expect(screen.getByRole('tab', { name: 'Calques' })).toBeSelected();
    expect(screen.getByTestId('rulers')).toBeTruthy();
  });
});

describe('espace studio : barre d’outils et options', () => {
  it('Main par défaut ; Déplacement passe en mode Sélection', async () => {
    await openStudio();
    expect(button('Main')).toBeSelected();
    await fireEvent.press(button('Déplacement'));
    expect(useEditorUiStore.getState().activeTool).toBe('select');
    expect(button('Déplacement')).toBeSelected();
    expect(within(screen.getByTestId('options-bar')).getByRole('checkbox', { name: 'Sélection auto :' })).toBeChecked();
  });

  it('Sélection auto et options de transformation sont de vraies options de l’outil', async () => {
    await openStudio();
    await fireEvent.press(button('Déplacement'));
    await fireEvent.press(screen.getByTestId('opt-auto-select'));
    await fireEvent.press(screen.getByTestId('opt-transform-controls'));
    expect(useWorkspaceStore.getState()).toMatchObject({ autoSelect: false, showTransformControls: false });
    expect(screen.getByTestId('opt-auto-select')).not.toBeChecked();
    // « Réinitialiser l’outil » rétablit les deux options.
    await fireEvent.press(button(/^Outil Déplacement, paramètres prédéfinis/));
    await fireEvent.press(within(screen.getByTestId('select-dropdown')).getByRole('menuitem', { name: 'Réinitialiser l’outil' }));
    expect(useWorkspaceStore.getState()).toMatchObject({ autoSelect: true, showTransformControls: true });
  });

  it('barre d’outils sur deux colonnes ; mode plein écran masque outils, options et panneaux', async () => {
    await openStudio();
    await fireEvent.press(screen.getByTestId('tool-rail-toggle'));
    expect(useWorkspaceStore.getState().toolRailDouble).toBe(true);
    expect(button('Barre d’outils sur une colonne')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('screen-mode'));
    expect(screen.queryByTestId('tool-rail')).toBeNull();
    expect(screen.queryByTestId('options-bar')).toBeNull();
    expect(screen.queryByTestId('dock-area')).toBeNull();
    expect(screen.getByTestId('document-canvas')).toBeTruthy();
    await openMenu('Affichage');
    await fireEvent.press(menuItem('Mode plein écran avec barre de menus'));
    expect(screen.getByTestId('tool-rail')).toBeTruthy();
    expect(screen.getByTestId('dock-area')).toBeTruthy();
  });

  it('un outil prévu ouvre sa famille sans changer d’outil, chaque entrée porte son module', async () => {
    await openStudio();
    await fireEvent.press(button('Pinceaux : Pinceau'));
    const flyout = screen.getByTestId('tool-flyout');
    expect(within(flyout).getByRole('menuitem', { name: 'Pinceau' })).toBeDisabled();
    expect(within(flyout).getAllByText('Prévu · M5').length).toBe(2);
    expect(useEditorUiStore.getState().activeTool).toBe('pan');
  });

  it('l’outil Rectangle insère une forme de la couleur de premier plan, modifiable dans la barre d’options', async () => {
    await openStudio();
    useWorkspaceStore.getState().setForeground('#C9645B');
    await fireEvent.press(button('Formes : Rectangle'));
    const shape = layers()[0] as ShapeLayer;
    expect(shape).toMatchObject({ type: 'shape', shape: 'rectangle', fill: '#C9645B' });

    const x = screen.getByTestId('opt-x');
    await fireEvent.changeText(x, '40');
    await fireEvent(x, 'blur');
    expect(layers()[0]?.x).toBe(40);
  });

  it('la barre d’options Déplacement aligne le calque sur le document', async () => {
    await openStudio();
    await addRectangle();
    await fireEvent.press(button('Déplacement'));
    await fireEvent.press(button('Aligner à droite du document'));
    const shape = layers()[0] as ShapeLayer;
    expect(shape.x + shape.width).toBe(1000);
    await fireEvent.press(button('Aligner en haut du document'));
    expect(layers()[0]?.y).toBe(0);
  });

  it('permute et réinitialise les couleurs de premier plan et d’arrière-plan', async () => {
    await openStudio();
    await fireEvent.press(button('Permuter les couleurs'));
    expect(useWorkspaceStore.getState()).toMatchObject({ foreground: '#FFFFFF', background: '#000000' });
    await fireEvent.press(button('Couleurs par défaut (noir et blanc)'));
    expect(useWorkspaceStore.getState()).toMatchObject({ foreground: '#000000', background: '#FFFFFF' });
  });
});

describe('espace studio : dock', () => {
  it('Couleur : le code hexadécimal fixe la couleur de premier plan, un code invalide est refusé', async () => {
    await openStudio();
    const hex = screen.getByTestId('color-hex');
    await fireEvent.changeText(hex, '#3685ff');
    await fireEvent(hex, 'submitEditing');
    expect(useWorkspaceStore.getState().foreground).toBe('#3685FF');
    expect(screen.getByText('R 54  V 133  B 255')).toBeTruthy();

    await fireEvent.changeText(hex, 'bleu');
    await fireEvent(hex, 'blur');
    expect(useWorkspaceStore.getState().foreground).toBe('#3685FF');
    expect(hex.props.value).toBe('#3685FF');
  });

  it('Nuancier : toucher une nuance la choisit', async () => {
    await openStudio();
    await fireEvent.press(screen.getByRole('tab', { name: 'Nuancier' }));
    await fireEvent.press(button('Nuance #F7B25B'));
    expect(useWorkspaceStore.getState().foreground).toBe('#F7B25B');
    expect(button('Nuance #F7B25B')).toBeSelected();
  });

  it('Calques : liste, visibilité, verrou, opacité, filtre, renommage et suppression', async () => {
    await openStudio();
    await addRectangle();
    await openMenu('Calque');
    await fireEvent.press(menuItem('Texte'));
    const panel = within(screen.getByTestId('layers-panel'));
    expect(panel.getByLabelText('Arrière-plan : Blanc, verrouillé')).toBeTruthy();
    expect(panel.getByRole('button', { name: 'Calque Texte 1' })).toBeSelected();

    await fireEvent.press(panel.getByRole('button', { name: 'Masquer Rectangle 1' }));
    expect(layers()[0]?.visible).toBe(false);

    const opacity = screen.getByTestId('layers-opacity');
    await fireEvent.changeText(opacity, '40');
    await fireEvent(opacity, 'blur');
    expect(layers()[1]?.opacity).toBeCloseTo(0.4);

    // Filtre par type : formes seulement, puis interrupteur coupé.
    await fireEvent.press(screen.getByTestId('layers-filter-shape'));
    expect(panel.queryByRole('button', { name: 'Calque Texte 1' })).toBeNull();
    expect(panel.getByRole('button', { name: 'Calque Rectangle 1' })).toBeTruthy();
    expect(screen.getByTestId('layers-filter-switch')).toBeChecked();
    expect(panel.queryByTestId('layer-background')).toBeNull();
    await fireEvent.press(screen.getByTestId('layers-filter-switch'));
    expect(panel.getByRole('button', { name: 'Calque Texte 1' })).toBeTruthy();
    expect(panel.getByTestId('layer-background')).toBeTruthy();
    expect(screen.getByLabelText('Fond')).not.toBeEnabled();

    await fireEvent(panel.getByRole('button', { name: 'Calque Rectangle 1' }), 'longPress');
    const prompt = screen.getByTestId('prompt-dialog');
    await fireEvent.changeText(within(prompt).getByLabelText('Nom du calque'), 'Fond rouge');
    await fireEvent.press(within(prompt).getByRole('button', { name: 'Renommer' }));
    expect(layers()[0]?.name).toBe('Fond rouge');

    await fireEvent.press(panel.getByRole('button', { name: 'Calque Fond rouge' }));
    await fireEvent.press(screen.getByTestId('layers-lock'));
    expect(layers()[0]?.locked).toBe(true);
    expect(screen.getByTestId('layers-delete')).toBeDisabled();
    await fireEvent.press(screen.getByTestId('layers-lock'));
    await fireEvent.press(screen.getByTestId('layers-delete'));
    await fireEvent.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Supprimer' }));
    expect(layers().map((l) => l.name)).toEqual(['Texte 1']);
  });

  it('Propriétés : modifie la géométrie et la couleur du calque sélectionné', async () => {
    await openStudio();
    await addRectangle();
    const width = screen.getByTestId('prop-width');
    await fireEvent.changeText(width, '320');
    await fireEvent(width, 'submitEditing');
    expect(layers()[0]?.width).toBe(320);

    const color = screen.getByTestId('prop-color');
    await fireEvent.changeText(color, '#00ff00');
    await fireEvent(color, 'blur');
    expect((layers()[0] as ShapeLayer).fill).toBe('#00FF00');
    await fireEvent.changeText(color, 'vert');
    await fireEvent(color, 'blur');
    expect(screen.getByText('Code couleur invalide (ex. #3685FF).')).toBeTruthy();
    expect((layers()[0] as ShapeLayer).fill).toBe('#00FF00');
  });

  it('les panneaux prévus le disent, sans contenu inventé ; un groupe se replie', async () => {
    await openStudio();
    await fireEvent.press(screen.getByTestId('strip-history'));
    expect(within(screen.getByTestId('history-panel')).getByText(/Prévu · M2/)).toBeTruthy();
    await fireEvent.press(button('Réduire Historique'));
    expect(screen.queryByTestId('history-panel')).toBeNull();

    await fireEvent.press(screen.getByRole('tab', { name: 'Réglages' }));
    expect(screen.getByLabelText('Courbes')).toBeDisabled();
    // Toucher l'onglet actif réduit le groupe, puis le développe.
    await fireEvent.press(screen.getByRole('tab', { name: 'Réglages' }));
    expect(screen.queryByTestId('adjustments-panel')).toBeNull();
    await fireEvent.press(screen.getByRole('tab', { name: 'Réglages' }));
    expect(screen.getByTestId('adjustments-panel')).toBeTruthy();

    // Menu du panneau : fermer un onglet.
    await fireEvent.press(screen.getByTestId('panel-menu-properties'));
    await fireEvent.press(within(screen.getByTestId('panel-menu')).getByRole('menuitem', { name: 'Fermer Réglages' }));
    expect(screen.queryByRole('tab', { name: 'Réglages' })).toBeNull();
  });

  it('le dock se réduit en icônes ; une icône le développe sur son panneau', async () => {
    await openStudio();
    await fireEvent.press(screen.getByTestId('dock-toggle'));
    const collapsed = within(screen.getByTestId('dock-collapsed'));
    expect(screen.queryByTestId('layers-panel')).toBeNull();
    await fireEvent.press(collapsed.getByRole('button', { name: 'Nuancier' }));
    expect(screen.queryByTestId('dock-collapsed')).toBeNull();
    expect(screen.getByRole('tab', { name: 'Nuancier' })).toBeSelected();
  });

  it('Navigateur : vignette du document et zoom', async () => {
    await openStudio();
    await act(async () => {
      fireEvent(screen.getByTestId('document-canvas'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 600, height: 500 } } });
    });
    await fireEvent.press(screen.getByTestId('strip-navigator'));
    const nav = within(screen.getByTestId('navigator-panel'));
    expect(nav.getByText('110 %')).toBeTruthy();
    await fireEvent.press(nav.getByRole('button', { name: 'Zoom avant' }));
    expect(nav.getByText('156 %')).toBeTruthy();
    expect(nav.getByLabelText('Vignette du document : toucher pour centrer la vue')).toBeTruthy();
  });
});
