import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { WText } from '@/components/workspace/ui';
import { formatBytes, formatNumber, fromPixels, type GraphicDocument } from '@/engine/documents';
import { usePersistenceStore } from '@/features/persistence/persistence';
import { ws } from '@/theme';
import { formatDateTime } from '@/utils/date';

import { DocumentThumbnail } from './DocumentThumbnail';
import { BACKGROUND_LABELS, formatDimensions } from './labels';

/** Format du projet tel qu'il est enregistré (format natif de l'application). */
export const PROJECT_FORMAT_LABEL = 'Projet ZENTECH';

/** Fiche « Informations du document » (accueil et Fichier › Informations). */
export function ProjectInfo({ doc, onClose }: { doc: GraphicDocument; onClose: () => void }) {
  const file = usePersistenceStore((s) => s.files[doc.id]);
  const rows: [string, string][] = [
    ['Nom', doc.name],
    ['Format', PROJECT_FORMAT_LABEL],
    ['Emplacement', file?.location ? file.location.name : file?.savedOnce ? 'Sur cet appareil' : 'Jamais enregistré'],
    ['Dimensions', formatDimensions(doc.width, doc.height)],
    ['Taille d’impression', `${formatNumber(fromPixels(doc.width, 'cm', doc.resolution))} × ${formatNumber(fromPixels(doc.height, 'cm', doc.resolution))} cm`],
    ['Résolution', `${formatNumber(doc.resolution)} pixels/pouce`],
    ['Mode', 'Couleurs RVB, 8 bits/couche'],
    ['Arrière-plan', doc.background === 'color' ? `${BACKGROUND_LABELS.color} ${doc.backgroundColor}` : BACKGROUND_LABELS[doc.background]],
    ['Calques', String(doc.layers.length)],
    ['Mémoire par calque', formatBytes(doc.width * doc.height * 4)],
    ['Créé le', formatDateTime(doc.createdAt)],
    ['Modifié le', formatDateTime(doc.updatedAt)],
  ];
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityElementsHidden importantForAccessibility="no" />
        <View style={styles.infoDialog} accessibilityViewIsModal testID="project-info">
          <WText style={styles.infoTitle} accessibilityRole="header">
            Informations du document
          </WText>
          <View style={styles.infoHead}>
            <DocumentThumbnail document={doc} size={96} />
          </View>
          {rows.map(([label, value]) => (
            <View key={label} style={styles.infoRow} accessible accessibilityLabel={`${label} : ${value}`}>
              <WText dim>{label}</WText>
              <WText style={styles.infoValue}>{value}</WText>
            </View>
          ))}
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={onClose} style={styles.closeButton}>
            <WText>Fermer</WText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  infoDialog: { width: '100%', maxWidth: 420, gap: 8, padding: 20, borderRadius: 8, backgroundColor: ws.panel, borderWidth: 1, borderColor: ws.border },
  infoTitle: { fontSize: 16, fontWeight: '600' },
  infoHead: { alignItems: 'center', paddingVertical: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  infoValue: { flexShrink: 1, textAlign: 'right' },
  closeButton: { alignSelf: 'flex-end', height: 40, paddingHorizontal: 20, justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: ws.textDim, marginTop: 8 },
});
