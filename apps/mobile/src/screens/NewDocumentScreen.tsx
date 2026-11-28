import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundSwatch, Icon, PromptDialog, type IconName } from '@/components/ui';
import {
  DOCUMENT_LIMITS,
  LENGTH_UNIT_LABELS,
  PRESET_CATALOG,
  PRESET_CATEGORIES,
  RESOLUTION_UNIT_LABELS,
  estimateLayerBytes,
  formatBytes,
  formatNumber,
  fromPixels,
  fromPpi,
  parsePositive,
  presetPixels,
  screenPreset,
  toPpi,
  validateDocumentInput,
  type DocumentBackground,
  type LengthUnit,
  type PresetCategory,
  type ResolutionUnit,
  type SizePreset,
} from '@/engine/documents';
import { normalizeHexColor } from '@/engine/layers';
import { useSavedPresets } from '@/features/presets/savedPresets';
import { DocumentThumbnail } from '@/features/projects/DocumentThumbnail';
import { BACKGROUND_LABELS } from '@/features/projects/labels';
import { useDocumentStore } from '@/stores/documentStore';
import { ws, wsMetrics } from '@/theme';

import { goHome } from './editor/EditorTopBar';
import { MenuList, Popover, WText, type Anchor, type MenuEntry } from '@/components/workspace/ui';
import { measureAnchor, type ViewRef } from '@/components/workspace/measure';

const CATEGORY_ICONS: Record<PresetCategory, IconName> = {
  recent: 'history',
  saved: 'content-save-outline',
  photo: 'image-outline',
  print: 'printer-outline',
  illustration: 'brush',
  web: 'web',
  mobile: 'cellphone',
  film: 'filmstrip',
};

/** « 1920 × 1080 px », « 210 × 297 mm » : taille du préréglage dans son unité. */
function presetSize(p: SizePreset): string {
  const unit = p.unit === 'px' ? 'px' : p.unit === 'in' ? 'po' : p.unit;
  return `${formatNumber(p.width)} × ${formatNumber(p.height)} ${unit}`;
}

/** Liste déroulante tactile (40 points de haut) ouvrant un menu ancré. */
function Select({ label, value, entries, testID, width }: { label: string; value: string; entries: readonly MenuEntry[]; testID?: string; width?: number }) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const node = useRef<ViewRef | null>(null);
  return (
    <>
      <Pressable
        ref={node}
        accessibilityRole="button"
        accessibilityLabel={`${label} : ${value}`}
        onPress={() => measureAnchor(node.current, setAnchor)}
        style={[styles.select, width ? { width } : styles.flex]}
        testID={testID}
      >
        <WText numberOfLines={1} style={styles.flex}>
          {value}
        </WText>
        <Icon name="chevron-down" size={16} color={ws.textDim} />
      </Pressable>
      <Popover anchor={anchor} onClose={() => setAnchor(null)} width={260} testID="select-dropdown">
        <MenuList entries={entries} onClose={() => setAnchor(null)} />
      </Popover>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <WText dim style={styles.fieldLabel}>
        {label}
      </WText>
      <View style={styles.fieldRow}>{children}</View>
    </View>
  );
}

function Input({ value, onChangeText, label, testID, numeric = true, maxLength, placeholder }: { value: string; onChangeText: (t: string) => void; label: string; testID?: string; numeric?: boolean; maxLength?: number; placeholder?: string }) {
  return (
    <TextInput
      accessibilityLabel={label}
      value={value}
      onChangeText={onChangeText}
      keyboardType={numeric ? 'decimal-pad' : 'default'}
      inputMode={numeric ? 'decimal' : 'text'}
      maxLength={maxLength}
      selectTextOnFocus
      placeholder={placeholder}
      style={[styles.input, styles.flex]}
      placeholderTextColor={ws.textDisabled}
      testID={testID}
    />
  );
}

interface FormState {
  name: string;
  width: string;
  height: string;
  unit: LengthUnit;
  resolution: string;
  resolutionUnit: ResolutionUnit;
  background: DocumentBackground;
  backgroundColor: string;
}

function formFromPreset(p: SizePreset, current: FormState): FormState {
  return {
    ...current,
    width: formatNumber(p.width),
    height: formatNumber(p.height),
    unit: p.unit,
    resolution: formatNumber(fromPpi(p.resolution, current.resolutionUnit)),
    background: p.background ?? current.background,
    backgroundColor: p.backgroundColor ?? current.backgroundColor,
  };
}

/**
 * Fenêtre « Nouveau document » : catégories, préréglages, détails (taille et
 * unité, orientation, résolution, mode colorimétrique, profondeur, fond),
 * aperçu, préréglages personnels enregistrables. Seuls RVB 8 bits sont
 * proposés : ce sont les seuls que le moteur gère réellement.
 */
export function NewDocumentScreen() {
  const createDocument = useDocumentStore((s) => s.createDocument);
  const documents = useDocumentStore((s) => s.documents);
  const order = useDocumentStore((s) => s.order);
  const saved = useSavedPresets((s) => s.presets);
  const loadSaved = useSavedPresets((s) => s.load);
  const addSaved = useSavedPresets((s) => s.add);
  const removeSaved = useSavedPresets((s) => s.remove);
  const window = useWindowDimensions();
  const wide = window.width >= 760;

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const [device] = useState(() => screenPreset(window.width, window.height, window.scale));
  const deviceSize: SizePreset = { id: 'device', label: 'Écran de cet appareil', width: device.width, height: device.height, unit: 'px', resolution: 72 };

  /** Récent : tailles des derniers projets, sans doublon. */
  const recent = useMemo(() => {
    const seen = new Set<string>();
    const out: SizePreset[] = [];
    for (const id of order) {
      const d = documents[id];
      if (!d) continue;
      const key = `${d.width}x${d.height}@${d.resolution}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: `recent-${d.id}`, label: d.name, width: d.width, height: d.height, unit: 'px', resolution: d.resolution, background: d.background, backgroundColor: d.backgroundColor });
      if (out.length >= 8) break;
    }
    return out;
  }, [documents, order]);

  const [category, setCategory] = useState<PresetCategory>(recent.length > 0 ? 'recent' : 'web');
  const presets: readonly SizePreset[] =
    category === 'recent' ? recent : category === 'saved' ? saved : category === 'mobile' ? [...PRESET_CATALOG.mobile, deviceSize] : PRESET_CATALOG[category];

  const initial = PRESET_CATALOG.web[0] as SizePreset;
  const [form, setForm] = useState<FormState>(() =>
    formFromPreset(recent[0] ?? initial, { name: '', width: '', height: '', unit: 'px', resolution: '72', resolutionUnit: 'ppi', background: 'white', backgroundColor: '#3685FF' }),
  );
  const [hexText, setHexText] = useState(form.backgroundColor);
  const [savingPreset, setSavingPreset] = useState(false);
  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const validation = validateDocumentInput(form);
  const ppi = parsePositive(form.resolution) === null ? null : toPpi(parsePositive(form.resolution) as number, form.resolutionUnit);
  const px = validation.ok ? validation.spec : null;
  const selectedId = px
    ? presets.find((p) => {
        const s = presetPixels(p);
        return ((s.width === px.width && s.height === px.height) || (s.width === px.height && s.height === px.width)) && Math.abs(p.resolution - (px.resolution ?? 72)) < 0.01;
      })?.id
    : undefined;
  const errorOf = (field: string) => (validation.ok ? undefined : validation.errors.find((e) => e.field === field)?.message);
  const landscape = px ? px.width > px.height : (parsePositive(form.width) ?? 0) > (parsePositive(form.height) ?? 0);

  const changeUnit = (unit: LengthUnit) => {
    // Les mêmes pixels, exprimés dans la nouvelle unité.
    if (px && ppi) {
      const dec = unit === 'px' ? 0 : 2;
      patch({ unit, width: formatNumber(fromPixels(px.width, unit, ppi), dec), height: formatNumber(fromPixels(px.height, unit, ppi), dec) });
    } else patch({ unit });
  };
  const changeResolutionUnit = (resolutionUnit: ResolutionUnit) => {
    patch({ resolutionUnit, resolution: ppi ? formatNumber(fromPpi(ppi, resolutionUnit)) : form.resolution });
  };
  const setOrientation = (wantLandscape: boolean) => {
    if (wantLandscape !== landscape) patch({ width: form.height, height: form.width });
  };

  const create = () => {
    if (!validation.ok) return;
    const doc = createDocument(validation.spec);
    // `replace` : le retour depuis l'éditeur ramène à l'accueil, pas à cette fenêtre.
    router.replace({ pathname: '/editor/[projectId]', params: { projectId: doc.id } });
  };
  const close = () => (router.canGoBack() ? router.back() : goHome());

  const presetGrid = (
    <View style={styles.presetArea}>
      <WText dim style={styles.sectionTitle}>
        {category === 'recent' ? 'Éléments récents' : category === 'saved' ? 'Préréglages enregistrés' : `Préréglages vierges : ${PRESET_CATEGORIES.find((c) => c.id === category)?.label}`} ({presets.length})
      </WText>
      {presets.length === 0 ? (
        <WText dim style={styles.empty} testID="presets-empty">
          {category === 'recent'
            ? 'Aucun document récent.'
            : 'Aucun préréglage enregistré. Réglez le document à droite, puis touchez l’icône d’enregistrement à côté du nom.'}
        </WText>
      ) : null}
      <View style={styles.grid}>
        {presets.map((p) => {
          const size = presetPixels(p);
          const selected = p.id === selectedId;
          return (
            <View key={p.id} style={[styles.card, wide ? styles.cardWide : styles.cardNarrow, selected && styles.cardSelected]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Préréglage ${p.label}`}
                accessibilityHint={`${size.width} × ${size.height} px, ${formatNumber(p.resolution)} ppp`}
                accessibilityState={{ selected }}
                onPress={() => {
                  setForm((f) => formFromPreset(p, f));
                  if (p.backgroundColor) setHexText(p.backgroundColor);
                }}
                style={styles.cardPress}
                testID={`preset-${p.id}`}
              >
                <Icon name={category === 'saved' || category === 'recent' ? 'file-outline' : CATEGORY_ICONS[category]} size={30} color={selected ? ws.accentText : ws.textDim} />
                <WText numberOfLines={2} style={styles.cardTitle}>
                  {p.label}
                </WText>
                <WText dim numberOfLines={1} style={styles.small}>
                  {presetSize(p)} @ {formatNumber(p.resolution)} ppp
                </WText>
                {p.note ? (
                  <WText dim numberOfLines={2} style={styles.tiny}>
                    {p.note}
                  </WText>
                ) : null}
              </Pressable>
              {category === 'saved' ? (
                <Pressable accessibilityRole="button" accessibilityLabel={`Supprimer le préréglage ${p.label}`} onPress={() => void removeSaved(p.id)} style={styles.cardDelete}>
                  <Icon name="close" size={14} color={ws.textDim} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );

  const details = (
    <View style={[styles.details, wide && styles.detailsWide]} testID="document-details">
      <WText dim style={styles.sectionTitle}>
        Détails du document
      </WText>
      <View style={styles.fieldRow}>
        <Input label="Nom du document" value={form.name} onChangeText={(name) => patch({ name })} numeric={false} maxLength={DOCUMENT_LIMITS.maxNameLength} placeholder="Sans titre" testID="input-name" />
        <Pressable accessibilityRole="button" accessibilityLabel="Enregistrer ces réglages comme préréglage" disabled={!validation.ok} onPress={() => setSavingPreset(true)} style={[styles.iconButton, !validation.ok && styles.off]} testID="save-preset">
          <Icon name="content-save-outline" size={18} color={ws.text} />
        </Pressable>
      </View>

      <Field label="Largeur">
        <Input label="Largeur" value={form.width} onChangeText={(width) => patch({ width })} testID="input-width" />
        <Select
          label="Unité"
          value={LENGTH_UNIT_LABELS[form.unit]}
          width={130}
          testID="select-unit"
          entries={(Object.keys(LENGTH_UNIT_LABELS) as LengthUnit[]).map((u) => ({ type: 'item', label: LENGTH_UNIT_LABELS[u], checked: u === form.unit, onPress: () => changeUnit(u) }))}
        />
      </Field>
      {errorOf('width') ? <WText style={styles.error}>{errorOf('width')}</WText> : null}

      <Field label="Hauteur">
        <Input label="Hauteur" value={form.height} onChangeText={(height) => patch({ height })} testID="input-height" />
        <View style={styles.orientation} accessibilityRole="radiogroup" accessibilityLabel="Orientation">
          {([false, true] as const).map((l) => (
            <Pressable
              key={String(l)}
              accessibilityRole="radio"
              accessibilityLabel={l ? 'Paysage' : 'Portrait'}
              accessibilityState={{ checked: landscape === l }}
              onPress={() => setOrientation(l)}
              style={[styles.orientationButton, landscape === l && styles.orientationOn]}
            >
              <Icon name={l ? 'crop-landscape' : 'crop-portrait'} size={20} color={landscape === l ? ws.accentText : ws.textDim} />
            </Pressable>
          ))}
        </View>
      </Field>
      {errorOf('height') ? <WText style={styles.error}>{errorOf('height')}</WText> : null}

      <Field label="Résolution">
        <Input label="Résolution" value={form.resolution} onChangeText={(resolution) => patch({ resolution })} testID="input-resolution" />
        <Select
          label="Unité de résolution"
          value={RESOLUTION_UNIT_LABELS[form.resolutionUnit]}
          width={130}
          entries={(Object.keys(RESOLUTION_UNIT_LABELS) as ResolutionUnit[]).map((u) => ({ type: 'item', label: RESOLUTION_UNIT_LABELS[u], checked: u === form.resolutionUnit, onPress: () => changeResolutionUnit(u) }))}
        />
      </Field>
      <View style={styles.quick}>
        {[72, 150, 300].map((v) => (
          <Pressable key={v} accessibilityRole="button" accessibilityLabel={`${v} pixels/pouce`} onPress={() => patch({ resolution: formatNumber(fromPpi(v, form.resolutionUnit)) })} style={[styles.quickChip, ppi !== null && Math.abs(ppi - v) < 0.01 && styles.quickChipOn]}>
            <WText style={styles.small}>{v} ppp</WText>
          </Pressable>
        ))}
      </View>
      {errorOf('resolution') ? <WText style={styles.error}>{errorOf('resolution')}</WText> : null}

      <Field label="Mode colorimétrique">
        <Select
          label="Mode colorimétrique"
          value="Couleurs RVB"
          entries={[
            { type: 'item', label: 'Couleurs RVB', checked: true, disabled: true },
            { type: 'item', label: 'Couleurs CMJN — non pris en charge par le moteur', disabled: true },
            { type: 'item', label: 'Niveaux de gris — non pris en charge par le moteur', disabled: true },
          ]}
        />
        <Select
          label="Profondeur"
          value="8 bits/couche"
          width={130}
          entries={[
            { type: 'item', label: '8 bits/couche', checked: true, disabled: true },
            { type: 'item', label: '16 bits/couche — non pris en charge', disabled: true },
            { type: 'item', label: '32 bits/couche — non pris en charge', disabled: true },
          ]}
        />
      </Field>

      <Field label="Contenu de l’arrière-plan">
        <Select
          label="Contenu de l’arrière-plan"
          value={BACKGROUND_LABELS[form.background]}
          testID="select-background"
          entries={(['white', 'black', 'transparent', 'color'] as const).map((b) => ({ type: 'item', label: BACKGROUND_LABELS[b], checked: b === form.background, onPress: () => patch({ background: b }) }))}
        />
        <BackgroundSwatch background={form.background} color={form.backgroundColor} style={styles.swatch} />
      </Field>
      {form.background === 'color' ? (
        <View style={styles.fieldRow}>
          <Input
            label="Couleur du fond (code hexadécimal)"
            value={hexText}
            numeric={false}
            maxLength={7}
            onChangeText={(t) => {
              setHexText(t);
              const hex = normalizeHexColor(t);
              patch({ backgroundColor: hex ?? 'invalide' });
            }}
            testID="input-background-color"
          />
        </View>
      ) : null}
      {errorOf('background') ? <WText style={styles.error}>{errorOf('background')}</WText> : null}

      <View style={styles.preview}>
        <DocumentThumbnail document={{ width: px?.width ?? 1, height: px?.height ?? 1, background: form.background, backgroundColor: form.backgroundColor }} size={84} />
        <View style={styles.flex}>
          <WText testID="summary-dimensions">{px ? `${px.width} × ${px.height} px` : 'Dimensions à corriger'}</WText>
          {px && ppi ? (
            <WText dim style={styles.small}>
              Impression : {formatNumber(fromPixels(px.width, 'cm', ppi))} × {formatNumber(fromPixels(px.height, 'cm', ppi))} cm à {formatNumber(ppi)} ppp
            </WText>
          ) : null}
          {px ? (
            <WText dim style={styles.small}>
              RVB 8 bits · mémoire par calque : {formatBytes(estimateLayerBytes(px.width, px.height))}
            </WText>
          ) : null}
        </View>
      </View>
      {errorOf('size') ? (
        <WText style={styles.error} testID="size-error">
          {errorOf('size')}
        </WText>
      ) : null}
      {validation.warnings.map((w) => (
        <WText key={w} dim style={styles.small}>
          {w}
        </WText>
      ))}

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Créer" accessibilityState={{ disabled: !validation.ok }} disabled={!validation.ok} onPress={create} style={[styles.primary, !validation.ok && styles.off]} testID="create-document">
          <WText style={styles.primaryText}>Créer</WText>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Annuler" onPress={close} style={styles.secondary}>
          <WText>Annuler</WText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.root} testID="new-document-screen">
      <View style={styles.header}>
        <WText style={styles.title} accessibilityRole="header">
          Nouveau document
        </WText>
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={close} style={styles.iconButton}>
          <Icon name="close" size={20} color={ws.text} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent} accessibilityRole="tablist">
        {PRESET_CATEGORIES.map((c) => (
          <Pressable key={c.id} accessibilityRole="tab" accessibilityLabel={c.label} accessibilityState={{ selected: c.id === category }} onPress={() => setCategory(c.id)} style={[styles.tab, c.id === category && styles.tabOn]} testID={`category-${c.id}`}>
            <WText dim={c.id !== category} style={c.id === category ? styles.tabTextOn : undefined}>
              {c.label}
            </WText>
          </Pressable>
        ))}
      </ScrollView>
      {wide ? (
        <View style={styles.body}>
          <ScrollView style={styles.flex} contentContainerStyle={styles.pad}>
            {presetGrid}
          </ScrollView>
          <ScrollView style={styles.detailsScroll}>{details}</ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.pad}>
          {presetGrid}
          {details}
        </ScrollView>
      )}
      <PromptDialog
        visible={savingPreset}
        title="Enregistrer le préréglage"
        label="Nom du préréglage"
        initialValue={form.name.trim() || (px ? `Personnalisé ${px.width} × ${px.height}` : '')}
        confirmLabel="Enregistrer"
        maxLength={60}
        onCancel={() => setSavingPreset(false)}
        onSubmit={(label) => {
          const w = parsePositive(form.width);
          const h = parsePositive(form.height);
          if (!w || !h || !ppi) return 'Réglages invalides.';
          void addSaved({ label, width: w, height: h, unit: form.unit, resolution: ppi, background: form.background, backgroundColor: form.backgroundColor }).then((err) => {
            if (!err) {
              setSavingPreset(false);
              setCategory('saved');
            }
          });
          return null;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ws.panel },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 6, height: 48, backgroundColor: ws.chrome, borderBottomWidth: 1, borderBottomColor: ws.border },
  title: { fontSize: 16, fontWeight: '600' },
  tabs: { flexGrow: 0, backgroundColor: ws.chrome, borderBottomWidth: 1, borderBottomColor: ws.border },
  tabsContent: { paddingHorizontal: 8 },
  tab: { height: 42, justifyContent: 'center', paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: ws.text },
  tabTextOn: { fontWeight: '600' },
  body: { flex: 1, flexDirection: 'row' },
  pad: { padding: 16, gap: 16 },
  presetArea: { gap: 10 },
  sectionTitle: { fontSize: wsMetrics.smallFontSize, textTransform: 'uppercase', letterSpacing: 0.6 },
  empty: { paddingVertical: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { borderRadius: 6, backgroundColor: ws.raised, borderWidth: 2, borderColor: 'transparent' },
  cardWide: { width: 168, minHeight: 150 },
  cardNarrow: { width: '47%', minHeight: 130 },
  cardSelected: { borderColor: ws.accent },
  cardPress: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10 },
  cardTitle: { textAlign: 'center', fontWeight: '600' },
  cardDelete: { position: 'absolute', top: 2, right: 2, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  small: { fontSize: wsMetrics.smallFontSize },
  tiny: { fontSize: 10, textAlign: 'center' },
  detailsScroll: { width: 360, flexGrow: 0, backgroundColor: ws.chrome, borderLeftWidth: 1, borderLeftColor: ws.border },
  details: { gap: 10 },
  detailsWide: { padding: 16 },
  field: { gap: 4 },
  fieldLabel: { fontSize: wsMetrics.smallFontSize },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { minWidth: 0, height: 40, paddingHorizontal: 10, color: ws.text, fontSize: 14, backgroundColor: ws.input, borderRadius: 4, borderWidth: 1, borderColor: ws.border },
  select: { minWidth: 0, height: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, backgroundColor: ws.input, borderRadius: 4, borderWidth: 1, borderColor: ws.border },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  orientation: { flexDirection: 'row', gap: 4 },
  orientationButton: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: ws.input, borderWidth: 1, borderColor: ws.border },
  orientationOn: { borderColor: ws.accent },
  quick: { flexDirection: 'row', gap: 6 },
  quickChip: { height: 30, paddingHorizontal: 10, justifyContent: 'center', borderRadius: 15, backgroundColor: ws.input, borderWidth: 1, borderColor: ws.border },
  quickChipOn: { borderColor: ws.accent },
  swatch: { width: 40, height: 40, borderRadius: 4, borderWidth: 1, borderColor: ws.border },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 6, backgroundColor: ws.input },
  error: { color: '#FF7A7A', fontSize: wsMetrics.smallFontSize },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  primary: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: ws.accent },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  secondary: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: ws.textDim },
  off: { opacity: 0.45 },
});
