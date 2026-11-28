import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { ConfirmDialog, Icon, IconButton, type IconName } from '@/components/ui';
import { WText } from '@/components/workspace/ui';
import { PRESET_CATALOG, presetPixels, type SizePreset } from '@/engine/documents';
import { openImageAsNewDocument, useImageImport } from '@/features/image-import/useImageImport';
import { removeUnreadable, usePersistenceStore } from '@/features/persistence';
import { RecentProjects } from '@/features/projects/RecentProjects';
import type { UnreadableProject } from '@/services/projects';
import { useDocumentStore } from '@/stores/documentStore';
import { ws, wsMetrics } from '@/theme';

type Section = 'home' | 'files';

const openProject = (id: string) => router.push({ pathname: '/editor/[projectId]', params: { projectId: id } });

/** Création en un geste : les formats les plus courants. */
const QUICK_PRESETS: readonly { preset: SizePreset; icon: IconName }[] = [
  { preset: PRESET_CATALOG.web[2] as SizePreset, icon: 'square-outline' },
  { preset: PRESET_CATALOG.web[3] as SizePreset, icon: 'cellphone' },
  { preset: PRESET_CATALOG.web[0] as SizePreset, icon: 'monitor' },
  { preset: PRESET_CATALOG.print[0] as SizePreset, icon: 'file-document-outline' },
];

function NavItem({ label, icon, selected, onPress }: { label: string; icon: IconName; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.navItem, (selected || pressed) && styles.navItemOn]}
    >
      <Icon name={icon} size={18} color={selected ? ws.text : ws.textDim} />
      <WText dim={!selected}>{label}</WText>
    </Pressable>
  );
}

/**
 * Accueil : nouveau projet, ouvrir, importer ; création rapide ; projets
 * récents (grille ou liste, menu de chaque projet) et « Fichiers » (tous les
 * projets enregistrés sur l'appareil). Pas de compte, pas de partage en
 * ligne : ces rubriques n'existent donc pas.
 */
export function HomeScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const [section, setSection] = useState<Section>('home');
  const imageImport = useImageImport();
  const createDocument = useDocumentStore((s) => s.createDocument);

  const importImage = async () => {
    const { asset } = await imageImport.pick();
    if (asset) openImageAsNewDocument(asset);
  };
  const quickCreate = (p: SizePreset) => {
    const { width: w, height: h } = presetPixels(p);
    const doc = createDocument({ width: w, height: h, background: 'white', name: 'Sans titre', resolution: p.resolution });
    openProject(doc.id);
  };

  const actions = (
    <View style={wide ? styles.navActions : styles.phoneActions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nouveau projet"
        accessibilityHint="Ouvre la fenêtre Nouveau document : préréglages, taille, résolution, fond"
        onPress={() => router.push('/new-document')}
        style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
      >
        <Icon name="file-plus-outline" size={20} color="#FFFFFF" />
        <WText style={styles.primaryText}>Nouveau projet…</WText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ouvrir"
        accessibilityHint="Affiche tous les projets enregistrés sur l’appareil"
        onPress={() => setSection('files')}
        style={({ pressed }) => [styles.secondary, pressed && styles.navItemOn]}
      >
        <Icon name="folder-open-outline" size={20} color={ws.text} />
        <WText>Ouvrir…</WText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Importer une image"
        accessibilityHint="Ouvre la galerie ; nouveau document aux dimensions de la photo, l’original n’est jamais modifié"
        accessibilityState={{ disabled: imageImport.importing }}
        disabled={imageImport.importing}
        onPress={() => void importImage()}
        style={({ pressed }) => [styles.secondary, pressed && styles.navItemOn, imageImport.importing && styles.off]}
      >
        <Icon name="image-plus" size={20} color={ws.text} />
        <WText>{imageImport.importing ? 'Import en cours…' : 'Importer une image…'}</WText>
      </Pressable>
    </View>
  );

  const nav = (
    <View style={wide ? styles.navList : styles.phoneTabs} accessibilityRole="tablist">
      <NavItem label="Accueil" icon="home-outline" selected={section === 'home'} onPress={() => setSection('home')} />
      <NavItem label="Fichiers" icon="folder-outline" selected={section === 'files'} onPress={() => setSection('files')} />
    </View>
  );

  const main = (
    <View style={styles.main}>
      {imageImport.error ? (
        <View style={styles.notice} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Icon name="alert-circle-outline" size={18} color="#FF7A7A" />
          <WText style={styles.noticeError}>{imageImport.error}</WText>
        </View>
      ) : null}
      <UnreadableProjects />
      {section === 'home' ? (
        <>
          <WText style={styles.h1} accessibilityRole="header">
            Que voulez-vous créer ?
          </WText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quick}>
            <Pressable accessibilityRole="button" accessibilityLabel="Nouveau document personnalisé" onPress={() => router.push('/new-document')} style={({ pressed }) => [styles.quickCard, styles.quickNew, pressed && styles.navItemOn]}>
              <Icon name="plus" size={32} color={ws.text} />
              <WText style={styles.quickTitle}>Nouveau document</WText>
              <WText dim style={styles.small}>
                Taille, résolution, fond…
              </WText>
            </Pressable>
            {QUICK_PRESETS.map(({ preset, icon }) => {
              const px = presetPixels(preset);
              return (
                <Pressable
                  key={preset.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Créer ${preset.label}`}
                  accessibilityHint={`${px.width} × ${px.height} px, fond blanc`}
                  onPress={() => quickCreate(preset)}
                  style={({ pressed }) => [styles.quickCard, pressed && styles.navItemOn]}
                  testID={`quick-${preset.id}`}
                >
                  <Icon name={icon} size={30} color={ws.textDim} />
                  <WText numberOfLines={2} style={styles.quickTitle}>
                    {preset.label}
                  </WText>
                  <WText dim style={styles.small}>
                    {px.width} × {px.height} px
                  </WText>
                </Pressable>
              );
            })}
          </ScrollView>
          <WText style={styles.h2} accessibilityRole="header">
            Récent
          </WText>
          <RecentProjects onOpen={openProject} limit={12} initialView="grid" />
        </>
      ) : (
        <>
          <WText style={styles.h1} accessibilityRole="header">
            Fichiers
          </WText>
          <WText dim style={styles.small}>
            Projets enregistrés sur cet appareil, automatiquement à chaque modification.
          </WText>
          <RecentProjects onOpen={openProject} initialView="list" />
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.root} testID="home-screen">
      <View style={styles.topBar}>
        <Logo size={30} />
        <IconButton icon="cog-outline" label="Paramètres" accessibilityHint="Ouvre les paramètres de l’application" onPress={() => router.push('/settings')} />
      </View>
      {wide ? (
        <View style={styles.row}>
          <View style={styles.sidebar}>
            {actions}
            <View style={styles.separator} />
            {nav}
          </View>
          <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
            {main}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {actions}
          {nav}
          {main}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/** Projets présents sur l'appareil mais illisibles : signalés, conservés, supprimables sur demande. */
function UnreadableProjects() {
  const unreadable = usePersistenceStore((s) => s.unreadable);
  const [pending, setPending] = useState<UnreadableProject | null>(null);
  if (unreadable.length === 0) return null;
  return (
    <View style={styles.unreadable} testID="unreadable-projects">
      {unreadable.map((p) => (
        <View key={p.id} style={styles.notice} accessibilityRole="alert">
          <Icon name="alert-circle-outline" size={18} color="#F5B342" />
          <WText dim style={styles.noticeText}>
            « {p.name} » n’a pas pu être ouvert : {p.message} Il est conservé tel quel sur l’appareil.
          </WText>
          <IconButton icon="delete-outline" label={`Supprimer le projet illisible ${p.name}`} tone="danger" onPress={() => setPending(p)} />
        </View>
      ))}
      <ConfirmDialog
        visible={pending !== null}
        title="Supprimer le projet illisible ?"
        message={pending ? `« ${pending.name} » sera supprimé définitivement de l’appareil.` : ''}
        confirmLabel="Supprimer"
        destructive
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) void removeUnreadable(pending.id);
          setPending(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ws.pasteboard },
  flex: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  topBar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 14, paddingRight: 6, backgroundColor: ws.chrome, borderBottomWidth: 1, borderBottomColor: ws.border },
  sidebar: { width: 240, padding: 14, gap: 12, backgroundColor: ws.chrome, borderRightWidth: 1, borderRightColor: ws.border },
  navActions: { gap: 6 },
  phoneActions: { gap: 8 },
  primary: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: ws.accent },
  primaryPressed: { backgroundColor: '#1F68E0' },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  secondary: { height: 46, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 8 },
  separator: { height: 1, backgroundColor: ws.divider },
  navList: { gap: 2 },
  phoneTabs: { flexDirection: 'row', gap: 6 },
  navItem: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderRadius: 6 },
  navItemOn: { backgroundColor: ws.raised },
  off: { opacity: 0.5 },
  content: { padding: 18, gap: 16 },
  main: { gap: 14 },
  h1: { fontSize: 20, fontWeight: '700' },
  h2: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  quick: { gap: 12, paddingRight: 12 },
  quickCard: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 8, backgroundColor: ws.chrome, borderWidth: 1, borderColor: ws.border },
  quickNew: { borderStyle: 'dashed', borderColor: ws.textDim },
  quickTitle: { textAlign: 'center', fontWeight: '600' },
  small: { fontSize: wsMetrics.smallFontSize },
  notice: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  noticeText: { flex: 1 },
  noticeError: { flex: 1, color: '#FF7A7A' },
  unreadable: { gap: 6 },
});
