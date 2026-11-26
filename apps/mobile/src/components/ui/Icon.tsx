import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

import { colors } from '@/theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Icône du thème (jeu Material Design Icons, licence Apache 2.0 pour les
 * glyphes, MIT pour @expo/vector-icons). Décorative : le libellé accessible
 * est porté par le contrôle parent.
 */
export function Icon({ name, size = 24, color = colors.textPrimary }: IconProps) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
