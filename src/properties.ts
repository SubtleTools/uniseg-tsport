/**
 * Unicode property constants and lookup functions
 * Based on Unicode version 15.0.0
 * Ported from github.com/rivo/uniseg
 */

// Grapheme cluster properties - must come first to reduce state vector bits
export const prAny = 0; // prAny must be 0
export const prPrepend = 1;
export const prCR = 2;
export const prLF = 3;
export const prControl = 4;
export const prExtend = 5;
export const prRegionalIndicator = 6;
export const prSpacingMark = 7;
export const prL = 8;
export const prV = 9;
export const prT = 10;
export const prLV = 11;
export const prLVT = 12;
export const prZWJ = 13;
export const prExtendedPictographic = 14;

// Word break properties
export const prNewline = 15;
export const prWSegSpace = 16;
export const prDoubleQuote = 17;
export const prSingleQuote = 18;
export const prMidNumLet = 19;
export const prNumeric = 20;
export const prMidLetter = 21;
export const prMidNum = 22;
export const prExtendNumLet = 23;
export const prALetter = 24;
export const prFormat = 25;
export const prHebrewLetter = 26;
export const prKatakana = 27;

// Sentence break properties
export const prSp = 28;
export const prSTerm = 29;
export const prClose = 30;
export const prSContinue = 31;
export const prATerm = 32;
export const prUpper = 33;
export const prLower = 34;
export const prSep = 35;
export const prOLetter = 36;

// Line break properties
export const prCM = 37;
export const prBA = 38;
export const prBK = 39;
export const prSP = 40;
export const prEX = 41;
export const prQU = 42;
export const prAL = 43;
export const prPR = 44;
export const prPO = 45;
export const prOP = 46;
export const prCP = 47;
export const prIS = 48;
export const prHY = 49;
export const prSY = 50;
export const prNU = 51;
export const prCL = 52;
export const prNL = 53;
export const prGL = 54;
export const prAI = 55;
export const prBB = 56;
export const prHL = 57;
export const prSA = 58;
export const prJL = 59;
export const prJV = 60;
export const prJT = 61;
export const prNS = 62;
export const prZW = 63;
export const prB2 = 64;
export const prIN = 65;
export const prWJ = 66;
export const prID = 67;
export const prEB = 68;
export const prCJ = 69;
export const prH2 = 70;
export const prH3 = 71;
export const prSG = 72;
export const prCB = 73;
export const prRI = 74;
export const prEM = 75;

// East Asian Width properties
export const prN = 76;
export const prNa = 77;
export const prA = 78;
export const prW = 79;
export const prH = 80;
export const prF = 81;

// Emoji properties
export const prEmojiPresentation = 82;

// General Categories
export const gcNone = 0; // gcNone must be 0
export const gcCc = 1;
export const gcZs = 2;
export const gcPo = 3;
export const gcSc = 4;
export const gcPs = 5;
export const gcPe = 6;
export const gcSm = 7;
export const gcPd = 8;
export const gcNd = 9;
export const gcLu = 10;
export const gcSk = 11;
export const gcPc = 12;
export const gcLl = 13;
export const gcSo = 14;
export const gcLo = 15;
export const gcPi = 16;
export const gcCf = 17;
export const gcNo = 18;
export const gcPf = 19;
export const gcLC = 20;
export const gcLm = 21;
export const gcMn = 22;
export const gcMe = 23;
export const gcMc = 24;
export const gcNl = 25;
export const gcZl = 26;
export const gcZp = 27;
export const gcCn = 28;
export const gcCs = 29;
export const gcCo = 30;

// Special code points
export const vs15 = 0xfe0e; // Variation Selector-15 (text presentation)
export const vs16 = 0xfe0f; // Variation Selector-16 (emoji presentation)

/**
 * Unicode property range type [start, end, property]
 */
export type PropertyRange = [number, number, number];

/**
 * Line break property range type [start, end, property, generalCategory]
 */
export type LineBreakRange = [number, number, number, number];

/**
 * Performs binary search on property ranges
 */
function propertySearch<T extends PropertyRange | LineBreakRange>(
  dictionary: readonly T[],
  codePoint: number
): T | undefined {
  let from = 0;
  let to = dictionary.length;

  while (to > from) {
    const middle = Math.floor((from + to) / 2);
    const range = dictionary[middle];

    if (!range) {
      return undefined;
    }

    if (codePoint < range[0]) {
      to = middle;
    } else if (codePoint > range[1]) {
      from = middle + 1;
    } else {
      return range;
    }
  }

  return undefined;
}

/**
 * Returns the Unicode property value of the given code point
 */
export function property(dictionary: readonly PropertyRange[], codePoint: number): number {
  const result = propertySearch(dictionary, codePoint);
  return result ? result[2] : prAny;
}

/**
 * Returns the grapheme cluster property of the given code point
 * Fast tracks ASCII characters for performance
 */
export function propertyGraphemes(codePoint: number): number {
  // Fast track ASCII printable characters
  if (codePoint >= 0x20 && codePoint <= 0x7e) {
    return prAny;
  }

  // Fast track common control characters
  if (codePoint === 0x0a) return prLF;
  if (codePoint === 0x0d) return prCR;
  if ((codePoint >= 0x00 && codePoint <= 0x1f) || codePoint === 0x7f) {
    return prControl;
  }

  // Use binary search for other characters
  return property(graphemeCodePoints, codePoint);
}

/**
 * Returns the East Asian Width property of the given code point
 */
export function propertyEastAsianWidth(codePoint: number): number {
  // Fast track ASCII characters
  if (codePoint >= 0x20 && codePoint <= 0x7e) {
    return prNa; // Narrow
  }

  // Fast track control characters
  if ((codePoint >= 0x00 && codePoint <= 0x1f) || codePoint === 0x7f) {
    return prN; // Neutral
  }

  return property(eastAsianWidth, codePoint);
}

/**
 * Returns line break property and general category
 */
export function propertyLineBreak(codePoint: number): [number, number] {
  // Fast track ASCII letters and digits
  if (codePoint >= 0x61 && codePoint <= 0x7a) {
    // a-z
    return [prAL, gcLl];
  }
  if (codePoint >= 0x41 && codePoint <= 0x5a) {
    // A-Z
    return [prAL, gcLu];
  }
  if (codePoint >= 0x30 && codePoint <= 0x39) {
    // 0-9
    return [prNU, gcNd];
  }

  const result = propertySearch(lineBreakCodePoints, codePoint);
  if (result && result.length >= 4) {
    return [result[2], result[3]];
  }
  return [prAL, gcNone];
}

/**
 * Grapheme cluster code points table (subset for now - full table would be much larger)
 * This is a minimal implementation covering basic cases
 */
export const graphemeCodePoints: readonly PropertyRange[] = [
  [0x0000, 0x0009, prControl],
  [0x000a, 0x000a, prLF],
  [0x000b, 0x000c, prControl],
  [0x000d, 0x000d, prCR],
  [0x000e, 0x001f, prControl],
  [0x007f, 0x009f, prControl],
  [0x00ad, 0x00ad, prControl], // Soft hyphen
  [0x0300, 0x036f, prExtend], // Combining diacriticals
  [0x0483, 0x0489, prExtend], // Cyrillic combining marks
  [0x0591, 0x05bd, prExtend], // Hebrew accents
  [0x05bf, 0x05bf, prExtend],
  [0x05c1, 0x05c2, prExtend],
  [0x05c4, 0x05c5, prExtend],
  [0x05c7, 0x05c7, prExtend],
  [0x0600, 0x0605, prPrepend], // Arabic number signs
  [0x0610, 0x061a, prExtend], // Arabic marks
  [0x061c, 0x061c, prControl], // Arabic letter mark
  [0x064b, 0x065f, prExtend], // Arabic diacritics
  [0x0670, 0x0670, prExtend], // Arabic superscript alef
  [0x06d6, 0x06dc, prExtend], // Arabic small high marks
  [0x06dd, 0x06dd, prPrepend], // Arabic end of ayah
  [0x06df, 0x06e4, prExtend], // Arabic small high marks
  [0x06e7, 0x06e8, prExtend],
  [0x06ea, 0x06ed, prExtend],
  [0x0711, 0x0711, prExtend], // Syriac letter superscript alaph
  [0x0730, 0x074a, prExtend], // Syriac points
  [0x07a6, 0x07b0, prExtend], // Thaana marks
  [0x07eb, 0x07f3, prExtend], // NKO combining marks
  [0x0816, 0x0819, prExtend], // Samaritan marks
  [0x081b, 0x0823, prExtend],
  [0x0825, 0x0827, prExtend],
  [0x0829, 0x082d, prExtend],
  [0x0859, 0x085b, prExtend], // Mandaic marks
  [0x08e3, 0x0902, prExtend], // Arabic and Devanagari marks
  [0x093a, 0x093a, prExtend], // Devanagari vowel sign OE
  [0x093c, 0x093c, prExtend], // Devanagari sign nukta
  [0x0941, 0x0948, prExtend], // Devanagari vowel signs
  [0x094d, 0x094d, prExtend], // Devanagari sign virama
  [0x0951, 0x0957, prExtend], // Devanagari stress signs
  [0x0962, 0x0963, prExtend], // Devanagari vowel signs vocalic
  [0x0981, 0x0981, prExtend], // Bengali sign candrabindu
  [0x0982, 0x0983, prSpacingMark], // Bengali signs
  [0x09bc, 0x09bc, prExtend], // Bengali sign nukta
  [0x09be, 0x09c4, prExtend], // Bengali vowel signs
  [0x09c7, 0x09c8, prSpacingMark], // Bengali vowel signs E, AI
  [0x09cb, 0x09cc, prSpacingMark], // Bengali vowel signs O, AU
  [0x09cd, 0x09cd, prExtend], // Bengali sign virama
  [0x09d7, 0x09d7, prExtend], // Bengali AU length mark
  [0x09e2, 0x09e3, prExtend], // Bengali vowel signs vocalic
  [0x09fe, 0x09fe, prExtend], // Bengali sandhi mark
  [0x1100, 0x115f, prL], // Hangul Jamo L
  [0x1160, 0x11a7, prV], // Hangul Jamo V
  [0x11a8, 0x11ff, prT], // Hangul Jamo T
  [0x1f1e6, 0x1f1ff, prRegionalIndicator], // Regional indicator symbols
  [0x200d, 0x200d, prZWJ], // Zero width joiner
  [0x1f3fb, 0x1f3ff, prExtend], // Emoji skin tone modifiers
  [0x1f600, 0x1f64f, prExtendedPictographic], // Emoticons
  [0x1f680, 0x1f6ff, prExtendedPictographic], // Transport and map symbols
  [0x1f700, 0x1f77f, prExtendedPictographic], // Alchemical symbols
  [0x1f780, 0x1f7ff, prExtendedPictographic], // Geometric shapes extended
  [0x1f800, 0x1f8ff, prExtendedPictographic], // Supplemental arrows-C
  [0x1f900, 0x1f9ff, prExtendedPictographic], // Supplemental symbols and pictographs
  [0x1fa70, 0x1faff, prExtendedPictographic], // Symbols and Pictographs Extended-A
  [0x00a9, 0x00a9, prExtendedPictographic], // Copyright sign
  [0x00ae, 0x00ae, prExtendedPictographic], // Registered sign
  [0x203c, 0x203c, prExtendedPictographic], // Double exclamation mark
  [0x2049, 0x2049, prExtendedPictographic], // Exclamation question mark
  [0x2122, 0x2122, prExtendedPictographic], // Trade mark sign
  [0x2139, 0x2139, prExtendedPictographic], // Information source
  [0x2194, 0x2199, prExtendedPictographic], // Arrow symbols
  [0x21a9, 0x21aa, prExtendedPictographic], // Arrow symbols
  [0x231a, 0x231b, prExtendedPictographic], // Watch, hourglass
  [0x2328, 0x2328, prExtendedPictographic], // Keyboard
  [0x23cf, 0x23cf, prExtendedPictographic], // Eject symbol
  [0x23e9, 0x23f3, prExtendedPictographic], // Play/pause/fast forward symbols
  [0x23f8, 0x23fa, prExtendedPictographic], // Pause/play/record buttons
  [0x24c2, 0x24c2, prExtendedPictographic], // Circled latin capital letter M
  [0x25aa, 0x25ab, prExtendedPictographic], // Small squares
  [0x25b6, 0x25b6, prExtendedPictographic], // Play button
  [0x25c0, 0x25c0, prExtendedPictographic], // Reverse button
  [0x25fb, 0x25fe, prExtendedPictographic], // Square symbols
  [0x2600, 0x2604, prExtendedPictographic], // Weather symbols
  [0x260e, 0x260e, prExtendedPictographic], // Telephone
  [0x2611, 0x2611, prExtendedPictographic], // Ballot box with check
  [0x2614, 0x2615, prExtendedPictographic], // Umbrella, hot beverage
  [0x2618, 0x2618, prExtendedPictographic], // Shamrock
  [0x261d, 0x261d, prExtendedPictographic], // Pointing finger
  [0x2620, 0x2620, prExtendedPictographic], // Skull and crossbones
  [0x2622, 0x2623, prExtendedPictographic], // Radioactive, biohazard
  [0x2626, 0x2626, prExtendedPictographic], // Orthodox cross
  [0x262a, 0x262a, prExtendedPictographic], // Star and crescent
  [0x262e, 0x262f, prExtendedPictographic], // Peace symbol, yin yang
  [0x2638, 0x2639, prExtendedPictographic], // Wheel of dharma, frowning face
  [0x263a, 0x263a, prExtendedPictographic], // Smiling face
  [0x2640, 0x2640, prExtendedPictographic], // Female sign
  [0x2642, 0x2642, prExtendedPictographic], // Male sign
  [0x2648, 0x2653, prExtendedPictographic], // Zodiac symbols
  [0x265f, 0x2660, prExtendedPictographic], // Chess pieces
  [0x2663, 0x2663, prExtendedPictographic], // Club suit
  [0x2665, 0x2666, prExtendedPictographic], // Heart and diamond suits
  [0x2668, 0x2668, prExtendedPictographic], // Hot springs
  [0x267b, 0x267b, prExtendedPictographic], // Recycling symbol
  [0x267e, 0x267f, prExtendedPictographic], // Infinity, wheelchair
  [0x2692, 0x2697, prExtendedPictographic], // Tool symbols
  [0x2699, 0x2699, prExtendedPictographic], // Gear
  [0x269b, 0x269c, prExtendedPictographic], // Atom symbol, fleur-de-lis
  [0x26a0, 0x26a1, prExtendedPictographic], // Warning, high voltage
  [0x26a7, 0x26a7, prExtendedPictographic], // Male with stroke symbol
  [0x26aa, 0x26ab, prExtendedPictographic], // Circles
  [0x26b0, 0x26b1, prExtendedPictographic], // Coffin, funeral urn
  [0x26bd, 0x26be, prExtendedPictographic], // Soccer ball, baseball
  [0x26c4, 0x26c5, prExtendedPictographic], // Snowman, sun behind cloud
  [0x26c8, 0x26c8, prExtendedPictographic], // Thunder cloud and rain
  [0x26ce, 0x26cf, prExtendedPictographic], // Ophiuchus, pick
  [0x26d1, 0x26d1, prExtendedPictographic], // Helmet with cross
  [0x26d3, 0x26d4, prExtendedPictographic], // Chains, no entry
  [0x26e9, 0x26ea, prExtendedPictographic], // Shinto shrine, church
  [0x26f0, 0x26f5, prExtendedPictographic], // Mountain, sailboat
  [0x26f7, 0x26fa, prExtendedPictographic], // Skier to tent
  [0x26fd, 0x26fd, prExtendedPictographic], // Fuel pump
];

/**
 * East Asian Width code points table (minimal subset)
 */
export const eastAsianWidth: readonly PropertyRange[] = [
  [0x1100, 0x115f, prF], // Hangul Jamo
  [0x2329, 0x232a, prW], // Left/right-pointing angle bracket
  [0x2e80, 0x2e99, prW], // CJK Radicals Supplement
  [0x2e9b, 0x2ef3, prW],
  [0x2f00, 0x2fd5, prW], // Kangxi Radicals
  [0x2ff0, 0x2ffb, prW], // Ideographic Description Characters
  [0x3000, 0x3000, prF], // Ideographic space
  [0x3001, 0x303e, prW], // CJK Symbols and Punctuation
  [0x3041, 0x3096, prW], // Hiragana
  [0x3099, 0x30ff, prW], // Hiragana + Katakana
  [0x3105, 0x312f, prW], // Bopomofo
  [0x3131, 0x318e, prW], // Hangul Compatibility Jamo
  [0x3190, 0x31e3, prW], // CJK Strokes
  [0x31f0, 0x321e, prW], // Katakana Phonetic Extensions
  [0x3220, 0x3247, prW], // Enclosed CJK Letters and Months
  [0x3250, 0x4dbf, prW], // CJK Unified Ideographs Extension A
  [0x4e00, 0x9fff, prW], // CJK Unified Ideographs
  [0xa960, 0xa97f, prW], // Hangul Jamo Extended-A
  [0xac00, 0xd7a3, prW], // Hangul Syllables
  [0xd7b0, 0xd7c6, prW], // Hangul Jamo Extended-B
  [0xf900, 0xfaff, prW], // CJK Compatibility Ideographs
  [0xfe10, 0xfe19, prW], // Vertical forms
  [0xfe30, 0xfe6f, prW], // CJK Compatibility Forms
  [0xff01, 0xff60, prF], // Fullwidth ASCII variants
  [0xffe0, 0xffe6, prF], // Fullwidth symbol variants
];

/**
 * Line break code points table (minimal subset)
 */
export const lineBreakCodePoints: readonly LineBreakRange[] = [
  [0x0009, 0x0009, prBA, gcCc], // Tab
  [0x000a, 0x000a, prLF, gcCc], // Line Feed
  [0x000b, 0x000b, prBK, gcCc], // Vertical Tab
  [0x000c, 0x000c, prBK, gcCc], // Form Feed
  [0x000d, 0x000d, prCR, gcCc], // Carriage Return
  [0x0020, 0x0020, prSP, gcZs], // Space
  [0x0021, 0x0021, prEX, gcPo], // Exclamation Mark
  [0x0022, 0x0022, prQU, gcPo], // Quotation Mark
  [0x0028, 0x0028, prOP, gcPs], // Left Parenthesis
  [0x0029, 0x0029, prCP, gcPe], // Right Parenthesis
  [0x002c, 0x002c, prIS, gcPo], // Comma
  [0x002d, 0x002d, prHY, gcPd], // Hyphen-Minus
  [0x002e, 0x002e, prIS, gcPo], // Full Stop
  [0x002f, 0x002f, prSY, gcPo], // Solidus
  [0x003a, 0x003a, prIS, gcPo], // Colon
  [0x003b, 0x003b, prIS, gcPo], // Semicolon
  [0x003f, 0x003f, prEX, gcPo], // Question Mark
  [0x005b, 0x005b, prOP, gcPs], // Left Square Bracket
  [0x005d, 0x005d, prCP, gcPe], // Right Square Bracket
  [0x007b, 0x007b, prOP, gcPs], // Left Curly Bracket
  [0x007d, 0x007d, prCP, gcPe], // Right Curly Bracket
  [0x00a0, 0x00a0, prGL, gcZs], // No-Break Space
  [0x00a1, 0x00a1, prOP, gcPo], // Inverted Exclamation Mark
  [0x00a7, 0x00a7, prAI, gcPo], // Section Sign
  [0x00b7, 0x00b7, prAI, gcPo], // Middle Dot
  [0x00bf, 0x00bf, prOP, gcPo], // Inverted Question Mark
];

/**
 * Emoji presentation code points table (minimal subset)
 */
export const emojiPresentation: readonly PropertyRange[] = [
  [0x231a, 0x231b, prEmojiPresentation], // Watch, Hourglass
  [0x23e9, 0x23ec, prEmojiPresentation], // Media controls
  [0x23f0, 0x23f0, prEmojiPresentation], // Alarm Clock
  [0x23f3, 0x23f3, prEmojiPresentation], // Hourglass with flowing sand
  [0x25fd, 0x25fe, prEmojiPresentation], // White/Black medium squares
  [0x2614, 0x2615, prEmojiPresentation], // Umbrella with rain drops, Hot beverage
  [0x2648, 0x2653, prEmojiPresentation], // Zodiac signs
  [0x267f, 0x267f, prEmojiPresentation], // Wheelchair symbol
  [0x2693, 0x2693, prEmojiPresentation], // Anchor
  [0x26a1, 0x26a1, prEmojiPresentation], // High voltage
  [0x26aa, 0x26ab, prEmojiPresentation], // White/Black circles
  [0x26bd, 0x26be, prEmojiPresentation], // Soccer ball, Baseball
  [0x26c4, 0x26c5, prEmojiPresentation], // Snowman, Sun behind cloud
  [0x26ce, 0x26ce, prEmojiPresentation], // Ophiuchus
  [0x26d4, 0x26d4, prEmojiPresentation], // No entry
  [0x26ea, 0x26ea, prEmojiPresentation], // Church
  [0x26f2, 0x26f3, prEmojiPresentation], // Fountain, Flag in hole
  [0x26f5, 0x26f5, prEmojiPresentation], // Sailboat
  [0x26fa, 0x26fa, prEmojiPresentation], // Tent
  [0x26fd, 0x26fd, prEmojiPresentation], // Fuel pump
  [0x2705, 0x2705, prEmojiPresentation], // Check mark button
  [0x270a, 0x270b, prEmojiPresentation], // Raised fist, Raised hand
  [0x2728, 0x2728, prEmojiPresentation], // Sparkles
  [0x274c, 0x274c, prEmojiPresentation], // Cross mark
  [0x274e, 0x274e, prEmojiPresentation], // Cross mark button
  [0x2753, 0x2755, prEmojiPresentation], // Question mark ornaments
  [0x2757, 0x2757, prEmojiPresentation], // Exclamation mark symbol
  [0x2795, 0x2797, prEmojiPresentation], // Plus, minus, division signs
  [0x27b0, 0x27b0, prEmojiPresentation], // Curly loop
  [0x27bf, 0x27bf, prEmojiPresentation], // Double curly loop
  [0x2b1b, 0x2b1c, prEmojiPresentation], // Black/White large squares
  [0x2b50, 0x2b50, prEmojiPresentation], // Star
  [0x2b55, 0x2b55, prEmojiPresentation], // Heavy large circle
  [0x1f004, 0x1f004, prEmojiPresentation], // Mahjong red dragon
  [0x1f0cf, 0x1f0cf, prEmojiPresentation], // Playing card black joker
  [0x1f18e, 0x1f18e, prEmojiPresentation], // AB button
  [0x1f191, 0x1f19a, prEmojiPresentation], // CL, COOL, FREE, ID, NEW, NG, OK, SOS, UP! buttons
  [0x1f1e6, 0x1f1ff, prEmojiPresentation], // Regional indicator symbols
  [0x1f201, 0x1f202, prEmojiPresentation], // Japanese "here" and "service charge" buttons
  [0x1f21a, 0x1f21a, prEmojiPresentation], // Japanese "free of charge" button
  [0x1f22f, 0x1f22f, prEmojiPresentation], // Japanese "reserved" button
  [0x1f232, 0x1f236, prEmojiPresentation], // Japanese buttons
  [0x1f238, 0x1f23a, prEmojiPresentation], // Japanese buttons
  [0x1f250, 0x1f251, prEmojiPresentation], // Japanese "advantage" and "accept" buttons
];
