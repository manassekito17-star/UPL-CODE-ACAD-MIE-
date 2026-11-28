import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ConfirmDialog, Icon, PromptDialog } from '@/components/ui';
import { DOCUMENT_LIMITS, type GraphicDocument } from '@/engine/documents';
import { useSaveStatus } from '@/features/persistence/useSaveStatus';
import { useDocumentStore } from '@/stores/documentStore';
import { ws, wsMetrics } from '@/theme';
import { formatRelative } from '@/utils/date';

import { MenuList, Popover, WText, type Anchor } from '@/components/workspace/ui';
import { measureAnchor, type ViewRef } from '@/components/workspace/measure';

import { DocumentThumbnail } from './DocumentThumbnail';
import { PROJECT_FORMAT_LABEL, ProjectInfo } from './ProjectInfo';
import { formatDimensions } from './labels';

export interface RecentProjectsProps {
  onOpen: (id: string) => void;
  /** Nombre maximal de projets affichés (accueil) ; tous si absent (Fichiers). */
  limit?: number;
  /** Disposition initiale. */
  initialView?: 'grid' | 'list';
}

type Sort = 'recent' | 'name' | 'size';
const SORT_LABELS: Record<Sort, string> = { recent: 'Récent', name: 'Nom', size: 'Taille' };


/** « Jamais enregistré » ou « Non enregistré » sous un projet qui a des modifications en attente. */
function UnsavedBadge({ id }: { id: string }) {
  const status = useSaveStatus(id);
  if (!status.unsaved) return null;
  return (
    <WText style={styles.badge} numberOfLines={1}>
      ● {status.neverSaved ? 'Jamais enregistré' : 'Modifications non enregistrées'}
    </WText>
  );
}

/**
 * Projets de l'appareil : grille ou liste, tri, filtre par nom, et pour
 * chacun un menu (Ouvrir, Renommer, Dupliquer, Supprimer, Informations).
 */
export function RecentProjects({ onOpen, limit, initialView = 'grid' }: RecentProjectsProps) {
  const documents = useDocumentStore((s) => s.documents);
  const order = useDocumentStore((s) => s.order);
  const removeDocument = useDocumentStore((s) => s.removeDocument);
  const renameDocument = useDocumentStore((s) => s.renameDocument);
  const duplicateDocument = useDocumentStore((s) => s.duplicateDocument);
  const [view, setView] = useState(initialView);
  const [sort, setSort] = useState<Sort>('recent');
  const [filter, setFilter] = useState('');
  const [menu, setMenu] = useState<{ doc: GraphicDocument; anchor: Anchor } | null>(null);
  const [sortAnchor, setSortAnchor] = useState<Anchor | null>(null);
  const sortRef = useRef<ViewRef | null>(null);
  const menuRefs = useRef<Record<string, ViewRef | null>>({});
  // On mémorise le document entier : la boîte porte toujours sur celui affiché.
  const [pendingDeletion, setPendingDeletion] = useState<GraphicDocument | null>(null);
  const [renaming, setRenaming] = useState<GraphicDocument | null>(null);
  const [info, setInfo] = useState<GraphicDocument | null>(null);

  const items = useMemo(() => {
    const all = order.map((id) => documents[id]).filter((d): d is GraphicDocument => d !== undefined);
    const q = filter.trim().toLowerCase();
    const filtered = q ? all.filter((d) => d.name.toLowerCase().includes(q)) : all;
    const sorted =
      sort === 'name'
        ? [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
        : sort === 'size'
          ? [...filtered].sort((a, b) => b.width * b.height - a.width * a.height)
          : filtered;
    return limit ? sorted.slice(0, limit) : sorted;
  }, [documents, order, filter, sort, limit]);
  const total = order.length;

  if (total === 0) {
    return (
      <View style={styles.empty} testID="recent-projects-empty">
        <Icon name="file-image-outline" size={36} color={ws.textDim} />
        <WText dim style={styles.center}>
          Aucun projet pour l’instant. Créez un document ou importez une image pour commencer.
        </WText>
      </View>
    );
  }

  const openMenu = (doc: GraphicDocument) => measureAnchor(menuRefs.current[doc.id] ?? null, (anchor) => setMenu({ doc, anchor }));

  const card = (doc: GraphicDocument) => {
    const details = `${formatDimensions(doc.width, doc.height)} · ${PROJECT_FORMAT_LABEL}`;
    const more = (
      <Pressable
        ref={(n) => {
          menuRefs.current[doc.id] = n;
        }}
        accessibilityRole="button"
        accessibilityLabel={`Actions pour ${doc.name}`}
        onPress={() => openMenu(doc)}
        style={styles.more}
        testID={`project-menu-${doc.id}`}
      >
        <Icon name="dots-horizontal" size={20} color={ws.text} />
      </Pressable>
    );
    const open = (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir ${doc.name}`}
        accessibilityHint={`${details}, modifié ${formatRelative(doc.updatedAt)}`}
        onPress={() => onOpen(doc.id)}
        onLongPress={() => openMenu(doc)}
        style={({ pressed }) => [view === 'grid' ? styles.gridOpen : styles.listOpen, pressed && styles.pressed]}
      >
        <DocumentThumbnail document={doc} size={view === 'grid' ? 132 : 52} />
        <View style={view === 'grid' ? styles.gridMeta : styles.listMeta}>
          <WText numberOfLines={1} style={styles.name}>
            {doc.name}
          </WText>
          <WText dim numberOfLines={1} style={styles.small}>
            {details}
          </WText>
          <WText dim numberOfLines={1} style={styles.small}>
            Modifié {formatRelative(doc.updatedAt)}
          </WText>
          <UnsavedBadge id={doc.id} />
        </View>
      </Pressable>
    );
    return (
      <View key={doc.id} style={view === 'grid' ? styles.gridItem : styles.listItem} testID={`project-${doc.id}`}>
        {open}
        {more}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <Pressable
          ref={sortRef}
          accessibilityRole="button"
          accessibilityLabel={`Trier par : ${SORT_LABELS[sort]}`}
          onPress={() => measureAnchor(sortRef.current, setSortAnchor)}
          style={styles.toolButton}
        >
          <WText dim>Trier</WText>
          <WText>{SORT_LABELS[sort]}</WText>
          <Icon name="chevron-down" size={14} color={ws.textDim} />
        </Pressable>
        <View style={styles.filter}>
          <Icon name="magnify" size={16} color={ws.textDim} />
          <TextInput
            accessibilityLabel="Filtrer les projets par nom"
            placeholder="Filtrer les fichiers récents"
            placeholderTextColor={ws.textDisabled}
            value={filter}
            onChangeText={setFilter}
            style={styles.filterInput}
            maxLength={DOCUMENT_LIMITS.maxNameLength}
            testID="projects-filter"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Affichage en liste"
          accessibilityState={{ selected: view === 'list' }}
          onPress={() => setView('list')}
          style={[styles.viewButton, view === 'list' && styles.viewOn]}
        >
          <Icon name="format-list-bulleted" size={18} color={view === 'list' ? ws.text : ws.textDim} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Affichage en grille"
          accessibilityState={{ selected: view === 'grid' }}
          onPress={() => setView('grid')}
          style={[styles.viewButton, view === 'grid' && styles.viewOn]}
        >
          <Icon name="view-grid-outline" size={18} color={view === 'grid' ? ws.text : ws.textDim} />
        </Pressable>
      </View>

      {items.length === 0 ? (
        <WText dim style={styles.noMatch}>
          Aucun projet ne correspond à « {filter.trim()} ».
        </WText>
      ) : null}
      <View style={view === 'grid' ? styles.grid : styles.list}>{items.map(card)}</View>
      {limit && total > items.length && !filter ? (
        <WText dim style={styles.small}>
          {total - items.length} autre{total - items.length > 1 ? 's' : ''} projet{total - items.length > 1 ? 's' : ''} dans Fichiers.
        </WText>
      ) : null}

      <Popover anchor={sortAnchor} onClose={() => setSortAnchor(null)} width={200} testID="sort-menu">
        <MenuList
          entries={(Object.keys(SORT_LABELS) as Sort[]).map((key) => ({ type: 'item', label: SORT_LABELS[key], checked: key === sort, onPress: () => setSort(key) }))}
          onClose={() => setSortAnchor(null)}
        />
      </Popover>
      <Popover anchor={menu?.anchor ?? null} onClose={() => setMenu(null)} width={230} testID="project-menu">
        {menu ? (
          <MenuList
            onClose={() => setMenu(null)}
            entries={[
              { type: 'item', label: 'Ouvrir', icon: 'folder-open-outline', onPress: () => onOpen(menu.doc.id) },
              { type: 'item', label: 'Renommer…', icon: 'rename-box', onPress: () => setRenaming(menu.doc) },
              { type: 'item', label: 'Dupliquer', icon: 'content-duplicate', onPress: () => duplicateDocument(menu.doc, `${menu.doc.name} copie`.slice(0, DOCUMENT_LIMITS.maxNameLength)) },
              { type: 'item', label: 'Informations', icon: 'information-outline', onPress: () => setInfo(menu.doc) },
              { type: 'separator' },
              { type: 'item', label: 'Supprimer…', icon: 'delete-outline', onPress: () => setPendingDeletion(menu.doc) },
            ]}
          />
        ) : null}
      </Popover>

      <ConfirmDialog
        visible={pendingDeletion !== null}
        title="Supprimer le projet ?"
        message={
          pendingDeletion
            ? `« ${pendingDeletion.name} » (${formatDimensions(pendingDeletion.width, pendingDeletion.height)}) sera supprimé définitivement.`
            : ''
        }
        confirmLabel="Supprimer"
        destructive
        onCancel={() => setPendingDeletion(null)}
        onConfirm={() => {
          if (pendingDeletion) removeDocument(pendingDeletion.id);
          setPendingDeletion(null);
        }}
      />
      <PromptDialog
        visible={renaming !== null}
        title="Renommer le projet"
        label="Nom du projet"
        initialValue={renaming?.name ?? ''}
        confirmLabel="Renommer"
        maxLength={DOCUMENT_LIMITS.maxNameLength}
        onCancel={() => setRenaming(null)}
        onSubmit={(name) => {
          if (!renaming) return null;
          const error = renameDocument(renaming.id, name);
          if (error === null) setRenaming(null);
          return error;
        }}
      />
      {info ? <ProjectInfo doc={documents[info.id] ?? info} onClose={() => setInfo(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toolButton: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 8 },
  filter: { flex: 1, minWidth: 90, flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: ws.divider },
  filterInput: { flex: 1, color: ws.text, fontSize: 13, paddingVertical: 0 },
  viewButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  viewOn: { backgroundColor: ws.raised },
  noMatch: { paddingVertical: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  gridItem: { width: 150 },
  gridOpen: { gap: 8, padding: 8, borderRadius: 6, backgroundColor: ws.chrome },
  gridMeta: { gap: 2 },
  list: { gap: 2 },
  listItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 6, backgroundColor: ws.chrome },
  listOpen: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 6 },
  listMeta: { flex: 1, gap: 2 },
  pressed: { backgroundColor: ws.raised },
  more: { position: 'absolute', right: 4, top: 4, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)' },
  name: { fontWeight: '600', fontSize: 13 },
  small: { fontSize: wsMetrics.smallFontSize },
  badge: { fontSize: wsMetrics.smallFontSize, color: '#F5B342' },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  center: { textAlign: 'center' },
});
