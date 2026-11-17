/**
 * Explication en français des erreurs Python les plus fréquentes chez les débutants,
 * affichée sous le message d'origine (qui reste visible, en anglais).
 */
export function pythonHint(stderr: string): string | undefined {
  const last = stderr.trim().split("\n").pop() ?? "";
  if (/ValueError: invalid literal for int\(\) with base 10: '([^']*)'/.test(last)) {
    const text = RegExp.$1;
    if (/[a-zàâçéèêëîïôûùüÿ]{3,}/i.test(text))
      return `int() a reçu le texte « ${text.trim()} » et ne peut pas le transformer en nombre. Pour demander un nombre, mettez input() À L'INTÉRIEUR de int() : age = int(input("Entre ton âge : ")). Puis écrivez la valeur (ex. 18) dans la case « Entrées ».`;
    return `int() a reçu « ${text} », qui n'est pas un nombre entier. Vérifiez la valeur écrite dans la case « Entrées » (un nombre par ligne, ex. 18).`;
  }
  if (/ValueError: could not convert string to float: '([^']*)'/.test(last))
    return `float() a reçu « ${RegExp.$1} », qui n'est pas un nombre. Écrivez un nombre (ex. 12.5, avec un point) dans la case « Entrées », et utilisez float(input("…")).`;
  if (/^EOFError/.test(last))
    return "Le programme attend une valeur avec input(), mais la case « Entrées » est vide (ou n'a pas assez de lignes). Écrivez une valeur par ligne dans « Entrées », puis relancez.";
  if (/TypeError: can only concatenate str \(not "(int|float)"\) to str/.test(last))
    return "On ne peut pas coller (+) un texte et un nombre. Écrivez print(\"Âge :\", age) ou print(\"Âge : \" + str(age)).";
  if (/TypeError: unsupported operand type\(s\) for [^:]+: '(int|float)' and 'str'|'str' and '(int|float)'/.test(last))
    return "Un calcul mélange un nombre et du texte. Ce que renvoie input() est toujours du texte : convertissez-le avec int(input(…)) ou float(input(…)).";
  if (/NameError: name '([^']+)' is not defined/.test(last))
    return `« ${RegExp.$1} » n'existe pas encore : vérifiez l'orthographe (majuscules comprises) ou donnez-lui une valeur avant de l'utiliser. Pour du texte, mettez des guillemets.`;
  if (/IndentationError/.test(last)) return "Problème d'indentation : les lignes d'un même bloc (après « : ») doivent être décalées du même nombre d'espaces (4 en général).";
  if (/SyntaxError/.test(last)) return "Erreur d'écriture : vérifiez les parenthèses, les guillemets et les « : » à la fin des lignes if, for, while, def.";
  if (/ZeroDivisionError/.test(last)) return "Division par zéro : vérifiez que le diviseur n'est pas 0 avant de diviser.";
  return undefined;
}
