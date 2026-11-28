import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui';
import { WText } from '@/components/workspace/ui';
import { DOCUMENT_LIMITS } from '@/engine/documents';
import { PACKAGE_EXTENSION } from '@/engine/project';
import { saveCopy, saveDocument, saveDocumentAs, type SaveTarget } from '@/features/persistence';
import { ProjectInfo } from '@/features/projects/ProjectInfo';
import { useDocumentStore } from '@/stores/documentStore';
import { ws, wsMetrics } from '@/theme';

import { useFileDialogs } from './fileCommands';

function Dialog({ children, testID, onClose }: { children: React.ReactNode; testID: string; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal testID={testID}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function Button({ label, onPress, primary, disabled, testID }: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean; testID?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, primary ? styles.primary : styles.secondary, pressed && styles.pressed, disabled && styles.off]}
      testID={testID}
    >
      <WText style={primary ? styles.primaryText : undefined}>{label}</WText>
    </Pressable>
  );
}

/** « Enregistrer sous » / « Enregistrer une copie » : nom, emplacement, format. */
function SaveAsDialog() {
  const request = useFileDialogs((s) => s.saveAs);
  const doc = useDocumentStore((s) => (request ? s.documents[request.documentId] : undefined));
  const [name, setName] = useState(() => (doc ? (request?.mode === 'copy' ? `${doc.name} copie` : doc.name) : ''));
  const [target, setTarget] = useState<SaveTarget>('device');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!request || !doc) return null;
  const copy = request.mode === 'copy';
  const close = () => useFileDialogs.setState({ saveAs: null });

  const submit = async () => {
    setBusy(true);
    setError(null);
    const result = copy ? await saveCopy(doc.id, name, target) : await saveDocumentAs(doc.id, name, target);
    setBusy(false);
    if (result.ok) {
      close();
      if (copy) useFileDialogs.setState({ message: target === 'folder' ? `Copie enregistrée : ${name}.${PACKAGE_EXTENSION}` : `Copie enregistrée sur l’appareil : ${name}` });
      else request.then?.(result.id);
    } else if (result.reason === 'error') setError(result.message);
  };

  return (
    <Dialog testID="save-as-dialog" onClose={close}>
      <WText style={styles.title} accessibilityRole="header">
        {copy ? 'Enregistrer une copie' : 'Enregistrer sous'}
      </WText>
      <WText dim style={styles.label}>
        Nom
      </WText>
      <TextInput
        accessibilityLabel="Nom du projet"
        value={name}
        onChangeText={setName}
        maxLength={DOCUMENT_LIMITS.maxNameLength}
        selectTextOnFocus
        style={styles.input}
        testID="save-as-name"
      />
      <WText dim style={styles.label}>
        Emplacement
      </WText>
      <View accessibilityRole="radiogroup" accessibilityLabel="Emplacement" style={styles.targets}>
        {(
          [
            ['device', 'cellphone', 'Sur cet appareil', 'Dans ZENTECH DESIGN : projets récents, enregistrement rapide'],
            ['folder', 'folder-outline', 'Dans un dossier…', `Fichier .${PACKAGE_EXTENSION} dans le dossier de votre choix`],
          ] as const
        ).map(([value, icon, label, hint]) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityHint={hint}
            accessibilityState={{ checked: target === value }}
            onPress={() => setTarget(value)}
            style={[styles.target, target === value && styles.targetOn]}
          >
            <Icon name={icon} size={20} color={target === value ? ws.accentText : ws.textDim} />
            <View style={styles.flex}>
              <WText>{label}</WText>
              <WText dim style={styles.small}>
                {hint}
              </WText>
            </View>
          </Pressable>
        ))}
      </View>
      <WText dim style={styles.small}>
        Format : ZENTECH DESIGN (.{PACKAGE_EXTENSION}) — calques, textes éditables, transformations, propriétés, images d’origine. Pour une image PNG ou JPEG : Fichier › Exporter.
      </WText>
      {error ? (
        <WText style={styles.error} accessibilityRole="alert" testID="save-as-error">
          {error}
        </WText>
      ) : null}
      {busy ? <ActivityIndicator color={ws.accent} /> : null}
      <View style={styles.actions}>
        <Button label="Annuler" onPress={close} disabled={busy} />
        <Button label="Enregistrer" primary onPress={() => void submit()} disabled={busy || name.trim() === ''} testID="save-as-confirm" />
      </View>
    </Dialog>
  );
}

/** « Enregistrer les modifications avant de fermer ? » pour chaque document modifié. */
function CloseDialog() {
  const closing = useFileDialogs((s) => s.closing);
  const id = closing?.queue[0];
  const doc = useDocumentStore((s) => (id ? s.documents[id] : undefined));
  const [busy, setBusy] = useState(false);
  if (!closing || !id || !doc) return null;

  const next = (discard: boolean) => {
    const queue = closing.queue.slice(1);
    const discarded = discard ? [...closing.discard, id] : closing.discard;
    if (queue.length > 0) useFileDialogs.setState({ closing: { ...closing, queue, discard: discarded } });
    else {
      useFileDialogs.setState({ closing: null });
      closing.after(discarded);
    }
  };
  const save = async () => {
    setBusy(true);
    const result = await saveDocument(id);
    setBusy(false);
    if (result.ok) next(false);
    else if (result.reason === 'needsSaveAs') {
      // Premier enregistrement : « Enregistrer sous », puis la fermeture continue.
      useFileDialogs.setState({
        closing: null,
        saveAs: {
          documentId: id,
          mode: 'saveAs',
          then: () => {
            useFileDialogs.setState({ closing });
            next(false);
          },
        },
      });
    } else if (result.reason === 'error') useFileDialogs.setState({ message: `Enregistrement impossible : ${result.message}` });
  };

  return (
    <Dialog testID="close-dialog" onClose={() => useFileDialogs.setState({ closing: null })}>
      <View style={styles.row}>
        <Icon name="alert-outline" size={28} color="#F5B342" />
        <WText style={[styles.title, styles.flex]} accessibilityRole="header">
          Enregistrer les modifications apportées au document « {doc.name} » avant de fermer ?
        </WText>
      </View>
      <WText dim>Sinon, les modifications depuis le dernier enregistrement seront perdues.</WText>
      {busy ? <ActivityIndicator color={ws.accent} /> : null}
      <View style={styles.actions}>
        <Button label="Annuler" onPress={() => useFileDialogs.setState({ closing: null })} disabled={busy} testID="close-cancel" />
        <Button label="Ne pas enregistrer" onPress={() => next(true)} disabled={busy} testID="close-discard" />
        <Button label="Enregistrer" primary onPress={() => void save()} disabled={busy} testID="close-save" />
      </View>
    </Dialog>
  );
}

function MessageDialog() {
  const message = useFileDialogs((s) => s.message);
  if (!message) return null;
  return (
    <Dialog testID="file-message" onClose={() => useFileDialogs.setState({ message: null })}>
      <WText accessibilityRole="alert">{message}</WText>
      <View style={styles.actions}>
        <Button label="OK" primary onPress={() => useFileDialogs.setState({ message: null })} />
      </View>
    </Dialog>
  );
}

function InfoDialog() {
  const id = useFileDialogs((s) => s.infoFor);
  const doc = useDocumentStore((s) => (id ? s.documents[id] : undefined));
  if (!doc) return null;
  return <ProjectInfo doc={doc} onClose={() => useFileDialogs.setState({ infoFor: null })} />;
}

/** Toutes les fenêtres du menu Fichier (rendues une fois, à la racine). */
export function FileDialogs() {
  const saveAsKey = useFileDialogs((s) => (s.saveAs ? `${s.saveAs.documentId}:${s.saveAs.mode}` : 'none'));
  return (
    <>
      <SaveAsDialog key={saveAsKey} />
      <CloseDialog />
      <InfoDialog />
      <MessageDialog />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  dialog: { width: '100%', maxWidth: 480, gap: 10, padding: 20, borderRadius: 8, backgroundColor: ws.panel, borderWidth: 1, borderColor: ws.border },
  title: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: wsMetrics.smallFontSize, marginTop: 4 },
  input: { height: 42, paddingHorizontal: 10, color: ws.text, fontSize: 14, backgroundColor: ws.input, borderRadius: 4, borderWidth: 1, borderColor: ws.border },
  targets: { gap: 6 },
  target: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: ws.border, backgroundColor: ws.input },
  targetOn: { borderColor: ws.accent },
  small: { fontSize: wsMetrics.smallFontSize },
  error: { color: '#FF7A7A' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  button: { height: 42, minWidth: 96, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 21 },
  primary: { backgroundColor: ws.accent },
  primaryText: { color: '#FFFFFF', fontWeight: '700' },
  secondary: { borderWidth: 1, borderColor: ws.textDim },
  pressed: { opacity: 0.8 },
  off: { opacity: 0.45 },
});
