import { useRef, useState } from 'react';

import { TextField } from './TextField';

export interface NumberFieldProps {
  label: string;
  value: number;
  suffix?: string;
  /** Décimales affichées (0 = entier). */
  decimals?: number;
  editable?: boolean;
  /**
   * Valide la saisie. Renvoie un message d'erreur (la valeur d'origine est
   * alors réaffichée) ou null si la valeur est acceptée.
   */
  onCommit: (value: number) => string | null;
  testID?: string;
}

const format = (value: number, decimals: number) =>
  decimals === 0 ? String(Math.round(value)) : value.toFixed(decimals).replace(/\.?0+$/, '');

/**
 * Champ numérique : la valeur est appliquée en fin de saisie (validation du
 * clavier ou perte du focus), pas à chaque caractère.
 */
export function NumberField({ label, value, suffix, decimals = 0, editable = true, onCommit, testID }: NumberFieldProps) {
  const [text, setText] = useState(format(value, decimals));
  const [error, setError] = useState<string | undefined>(undefined);
  // Entrée puis perte du focus déclenchent deux fins de saisie : on ne valide
  // qu'une fois le même texte (sinon l'historique enregistrerait un doublon).
  const lastHandled = useRef<string | null>(null);

  // Valeur modifiée ailleurs (autre champ, glisser sur le canvas) : on
  // réaffiche la nouvelle valeur (mise à jour pendant le rendu, forme
  // recommandée par React plutôt qu'un effet).
  const shown = format(value, decimals);
  const [lastShown, setLastShown] = useState(shown);
  if (shown !== lastShown) {
    setLastShown(shown);
    setText(shown);
  }

  const commit = () => {
    if (lastHandled.current === text) return;
    lastHandled.current = text;
    const parsed = Number(text.replace(',', '.').trim());
    if (text.trim() === '' || !Number.isFinite(parsed)) {
      setError('Nombre attendu.');
      setText(format(value, decimals));
      return;
    }
    if (parsed === value) {
      setError(undefined);
      return;
    }
    const message = onCommit(parsed);
    setError(message ?? undefined);
    if (message) setText(format(value, decimals));
  };

  return (
    <TextField
      label={label}
      value={text}
      suffix={suffix}
      onChangeText={(next) => {
        lastHandled.current = null;
        setText(next);
      }}
      onBlur={commit}
      onSubmitEditing={commit}
      keyboardType="numbers-and-punctuation"
      inputMode="decimal"
      returnKeyType="done"
      editable={editable}
      error={error}
      testID={testID}
    />
  );
}
