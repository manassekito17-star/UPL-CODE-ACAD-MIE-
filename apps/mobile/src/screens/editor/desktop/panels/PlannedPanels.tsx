import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui';
import { ws } from '@/theme';

import { WText } from '@/components/workspace/ui';

/**
 * Panneaux dont le contenu arrive avec un module ultérieur. Ils sont présents
 * dans le dock pour que la disposition soit définitive, mais n'affichent
 * aucune donnée inventée : chaque entrée est désactivée et porte son module.
 */
function PlannedList({ module, intro, items, testID }: { module: string; intro: string; items: readonly { label: string; icon: IconName }[]; testID: string }) {
  return (
    <View style={styles.panel} testID={testID}>
      <View style={styles.banner}>
        <Icon name="progress-clock" size={14} color={ws.textDim} />
        <WText dim style={styles.flex}>
          {intro} Prévu · {module}
        </WText>
      </View>
      {items.map((item) => (
        <View key={item.label} style={styles.row} accessible accessibilityLabel={item.label} accessibilityState={{ disabled: true }} accessibilityHint={`Prévu au module ${module}`}>
          <Icon name={item.icon} size={16} color={ws.textDisabled} />
          <WText disabled style={styles.flex}>
            {item.label}
          </WText>
        </View>
      ))}
    </View>
  );
}

const ADJUSTMENTS = [
  { label: 'Luminosité / Contraste', icon: 'brightness-6' },
  { label: 'Niveaux', icon: 'chart-histogram' },
  { label: 'Courbes', icon: 'chart-bell-curve-cumulative' },
  { label: 'Exposition', icon: 'camera-iris' },
  { label: 'Vibrance', icon: 'triangle-outline' },
  { label: 'Teinte / Saturation', icon: 'palette-outline' },
  { label: 'Balance des couleurs', icon: 'scale-balance' },
  { label: 'Noir et blanc', icon: 'circle-half-full' },
  { label: 'Filtre photo', icon: 'camera-outline' },
] as const;

export function AdjustmentsPanel() {
  return <PlannedList module="M9" intro="Calques de réglage non destructifs." items={ADJUSTMENTS} testID="adjustments-panel" />;
}

export function ChannelsPanel() {
  return (
    <PlannedList
      module="M15"
      intro="Les canaux demandent le moteur de pixels (M5)."
      items={[
        { label: 'RVB', icon: 'palette-swatch-outline' },
        { label: 'Rouge', icon: 'alpha-r-box-outline' },
        { label: 'Vert', icon: 'alpha-v-box-outline' },
        { label: 'Bleu', icon: 'alpha-b-box-outline' },
      ]}
      testID="channels-panel"
    />
  );
}

export function PathsPanel() {
  return <PlannedList module="M12" intro="Les tracés arrivent avec l’outil Plume." items={[]} testID="paths-panel" />;
}

export function CharacterPanel() {
  return (
    <PlannedList
      module="M13"
      intro="Police Inter, taille, graisse et couleur se règlent déjà dans la barre d’options et les Propriétés."
      items={[
        { label: 'Autres polices', icon: 'format-font' },
        { label: 'Interlignage', icon: 'format-line-spacing' },
        { label: 'Approche et crénage', icon: 'format-letter-spacing' },
        { label: 'Échelle horizontale et verticale', icon: 'arrow-expand-horizontal' },
        { label: 'Faux gras, faux italique, capitales', icon: 'format-italic' },
      ]}
      testID="character-panel"
    />
  );
}

export function ParagraphPanel() {
  return (
    <PlannedList
      module="M13"
      intro="L’alignement gauche, centre, droite est déjà disponible."
      items={[
        { label: 'Justification', icon: 'format-align-justify' },
        { label: 'Retraits', icon: 'format-indent-increase' },
        { label: 'Espace avant et après', icon: 'format-paragraph-spacing' },
        { label: 'Césure', icon: 'format-text-wrapping-wrap' },
      ]}
      testID="paragraph-panel"
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  panel: { paddingVertical: 6 },
  banner: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingHorizontal: 8, paddingBottom: 6 },
  row: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
});
