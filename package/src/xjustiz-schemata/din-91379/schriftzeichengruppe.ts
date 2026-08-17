/**
 * An incomplete version of "Normative lateinische Buchstaben" defined in table 3
 * of the {@link _StringLatinPlusSpecification | StringLatin+ specification}.
 *
 * Incomplete primarily because it includes multi code point Unicode sequences,
 * that can't be matched by the TypeScript compiler. Furthermore, the table is
 * huge. Focus on ASCII range to focus on impact. Future extensions possible.
 */
// prettier-ignore
export type LateinischeBuchstabenIncomplete = "a" | "A" | "b" | "B" | "c" | "C" | "d" | "D" | "e" | "E" | "f" | "F" | "g" | "G" | "h" | "H" | "i" | "I" | "j" | "J" | "k" | "K" | "l" | "L" | "m" | "M" | "n" | "N" | "o" | "O" | "p" | "P" | "q" | "Q" | "r" | "R" | "s" | "S" | "t" | "T" | "u" | "U" | "v" | "V" | "w" | "W" | "x" | "X" | "y" | "Y" | "z" | "Z";

/**
 * "Nicht-Buchstaben N1" defined in table 5 of the {@link _StringLatinPlusSpecification | String.Latin+ specification}.
 */
// prettier-ignore
export type NichtBuchstabenN1 = " " | "'" | "," | "-" | "." | "`" | "~" | "¨" | "´" | "·" | "ʹ" | "ʺ" | "ʾ" | "ʿ" | "ˈ" | "ˌ" | "’" | "‡"

/**
 * "Nicht-Buchstaben N2" defined in table 5 of the {@link _StringLatinPlusSpecification | String.Latin+ specification}.
 */
// prettier-ignore
export type NichtBuchstabenN2 = "!" | '"' | "#" | "$" | "%" | "&" | "(" | ")" | "*" | "+" | "/" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | ":" | ";" | "<" | "=" | ">" | "?" | "@" | "[" | "\\" | "]" | "^" | "_" | "{" | "|" | "}" | "¡" | "¢" | "£" | "¥" | "§" | "©" | "ª" | "«" | "¬" | "®" | "¯" | "°" | "±" | "²" | "³" | "μ" | "¶" | "¹" | "º" | "»" | "¿" | "×" | "÷" | "€";

/**
 * "Nicht-Buchstaben N3" defined in table 7 of the {@link _StringLatinPlusSpecification | String.Latin+ specification}.
 * Consists of 6 normative characters required for the entries of legal entities (Namen juristischer Personen).
 */
// prettier-ignore
export type NichtBuchstabenN3 = "¤" | "¦" | "¸" | "¼" | "½" | "¾";

/**
 * "Nicht-Buchstaben N4" defined in table 8 of the {@link _StringLatinPlusSpecification | String.Latin+ specification}.
 * Consists of 4 structural layouts and control strings (tab, line feed, carriage return, and no-break space).
 */
// prettier-ignore
export type NichtBuchstabenN4 = "\t" | "\n" | "\r" | "\u00A0";

/**
 * "Griechische Buchstaben" defined in table A.1 of the {@link _StringLatinPlusSpecification | String.Latin+ specification}.
 */
// prettier-ignore
export type GriechischeBuchstaben = "Ά" | "Έ" | "Ή" | "Ί" | "Ό" | "Ύ" | "Ώ" | "ΐ" | "Α" | "Β" | "Γ" | "Δ" | "Ε" | "Ζ" | "Η" | "Θ" | "Ι" | "Κ" | "Λ" | "Μ" | "Ν" | "Ξ" | "Ο" | "Π" | "Ρ" | "Σ" | "Τ" | "Υ" | "Φ" | "Χ" | "Ψ" | "Ω" | "Ϊ" | "Ϋ" | "ά" | "έ" | "ή" | "ί" | "ΰ" | "α" | "β" | "γ" | "δ" | "ε" | "ζ" | "η" | "θ" | "ι" | "κ" | "λ" | "μ" | "ν" | "ξ" | "ο" | "π" | "ρ" | "ς" | "σ" | "τ" | "υ" | "φ" | "χ" | "ψ" | "ω" | "ϊ" | "ϋ" | "ό" | "ύ" | "ώ";

/**
 * "Kyrillische Buchstaben" defined in table A.2 of the {@link _StringLatinPlusSpecification | String.Latin+ specification}.
 */
// prettier-ignore
export type KyrillischeBuchstabenA3 = "Ѝ" | "А" | "Б" | "В" | "Г" | "Д" | "Е" | "Ж" | "З" | "И" | "Й" | "К" | "Л" | "М" | "Н" | "О" | "П" | "Р" | "С" | "Т" | "У" | "Ф" | "Х" | "Ц" | "Ч" | "Ш" | "Щ" | "Ъ" | "Ь" | "Ю" | "Я" | "а" | "б" | "в" | "г" | "д" | "е" | "ж" | "з" | "и" | "й" | "к" | "л" | "м" | "н" | "о" | "п" | "р" | "с" | "т" | "у" | "ф" | "х" | "ц" | "ч" | "ш" | "щ" | "ъ" | "ь" | "ю" | "я" | "ѝ";

/**
 * "Nicht-Buchstaben E1" defined in table A.3 of the {@link _StringLatinPlusSpecification | String.Latin+ specification}.
 */
// prettier-ignore
export type NichtBuchstabenE1 = "ƒ" | "ʰ" | "ʳ" | "ˆ" | "˜" | "ˢ" | "ᵈ" | "ᵗ" | "‘" | "‚" | "“" | "”" | "„" | "†" | "…" | "‰" | "‹" | "›" | "⁰" | "⁴" | "⁵" | "⁶" | "⁷" | "⁸" | "⁹" | "ⁿ" | "₀" | "₁" | "₂" | "₃" | "₄" | "₅" | "₆" | "₇" | "₈" | "₉" | "™" | "∞" | "≤" | "≥";

/**
 * String.Latin+ specification by KoSIT (Koordinierungsstelle für IT-Standards)
 * as supplementing and commented version of the DIN 91379.
 *
 * @see {@link https://www.xoev.de/sixcms/media.php/13/StringLatin%2012.zip | PDF Document}
 */
type _StringLatinPlusSpecification =
  "https://www.xoev.de/sixcms/media.php/13/StringLatin%2012.zip";
