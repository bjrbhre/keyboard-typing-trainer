import { WORDS_EN } from './words-en.js';
import { WORDS_FR } from './words-fr.js';

/**
 * Levels — progression definitions and drill generation
 *
 * Levels are defined by fingers + rows (layout-independent).
 * The drill generator resolves actual key characters from the current layout.
 */

// Level specs: which fingers and rows to include
// Keys accumulate — each level adds new fingers/rows on top of previous
const LEVEL_SPECS = [
  { id: 1,  name: 'Home — Index + Thumb',       newFingers: ['leftIndex', 'rightIndex', 'thumb'],           rows: ['home'] },
  { id: 2,  name: 'Home — Middle fingers',       newFingers: ['leftMiddle', 'rightMiddle'],                 rows: ['home'] },
  { id: 3,  name: 'Home — Ring fingers',          newFingers: ['leftRing', 'rightRing'],                     rows: ['home'] },
  { id: 4,  name: 'Home — Left pinky',            newFingers: ['leftPinky'],                                 rows: ['home'] },
  { id: 5,  name: 'Home — Full row',              newFingers: [],                                            rows: ['home'], includeAll: true },
  { id: 6,  name: 'Top row',                      newFingers: [],                                            rows: ['top'], includeAll: true },
  { id: 7,  name: 'Bottom row',                   newFingers: [],                                            rows: ['bottom'], includeAll: true },
  { id: 8,  name: 'Full keyboard',                newFingers: [],                                            rows: ['home', 'top', 'bottom'], includeAll: true },
];

// Validation thresholds
const THRESHOLDS = {
  minChars: 50,
  minSuccessRate: 90,
  minCPM: 20,
};

// Row index mapping in layout.rows
const ROW_MAP = { number: 0, top: 1, home: 2, bottom: 3 };

/**
 * Resolve the set of key characters for a given level + layout
 * Keys accumulate from all previous levels + this level's new fingers/rows
 */
function resolveKeys(levelId, layout) {
  const allKeys = new Set();

  for (let i = 1; i <= levelId; i++) {
    const spec = LEVEL_SPECS.find(s => s.id === i);
    if (!spec) continue;

    if (spec.includeAll) {
      // Include all keys in the specified rows
      for (const rowName of spec.rows) {
        const rowIdx = ROW_MAP[rowName];
        if (rowIdx !== undefined && layout.rows[rowIdx]) {
          for (const key of layout.rows[rowIdx]) {
            allKeys.add(key.char);
          }
        }
      }
    } else {
      // Include keys matching the specified fingers in the specified rows
      for (const rowName of spec.rows) {
        const rowIdx = ROW_MAP[rowName];
        if (rowIdx !== undefined && layout.rows[rowIdx]) {
          for (const key of layout.rows[rowIdx]) {
            if (spec.newFingers.includes(key.finger)) {
              allKeys.add(key.char);
            }
          }
        }
      }
    }
  }

  return allKeys;
}

/**
 * Generate drill text for a given level
 * Early levels (few keys) → character patterns
 * Later levels → could transition to words, but for now drills only
 */
function generateDrill(levelId, layout, length = 150) {
  const keys = resolveKeys(levelId, layout);
  const chars = [...keys].filter(c => c !== ' ');

  // For very early levels, create structured patterns
  if (chars.length <= 4) {
    return generateStructuredDrill(chars, length);
  }

  // For levels with more keys, create random sequences with spaces
  return generateRandomDrill(chars, length);
}

function generateStructuredDrill(chars, length) {
  let text = '';
  let lineLen = 0;
  const groupSizes = [2, 3, 4];

  while (text.length < length) {
    const groupSize = groupSizes[Math.floor(Math.random() * groupSizes.length)];
    let group = '';
    for (let i = 0; i < groupSize; i++) {
      group += chars[Math.floor(Math.random() * chars.length)];
    }
    text += group + ' ';
    lineLen += group.length + 1;
    if (lineLen >= 30) { text += '\n'; lineLen = 0; }
  }

  return text.slice(0, length);
}

function generateRandomDrill(chars, length) {
  let text = '';
  let lineLen = 0;
  const wordsSizes = [3, 4, 5, 6, 7];

  while (text.length < length) {
    const wordSize = wordsSizes[Math.floor(Math.random() * wordsSizes.length)];
    let word = '';
    for (let i = 0; i < wordSize; i++) {
      word += chars[Math.floor(Math.random() * chars.length)];
    }
    text += word + ' ';
    lineLen += word.length + 1;
    if (lineLen >= 30) { text += '\n'; lineLen = 0; }
  }

  return text.slice(0, length);
}

/**
 * Generate training text from real words filtered by available keys.
 * Returns null if not enough words are available (< MIN_WORDS),
 * signaling the caller to fall back to drills.
 */
const MIN_WORDS = 10;

function generateTrainingText(levelId, layout, language = 'en', length = 150) {
  const keys = resolveKeys(levelId, layout);
  const corpus = language === 'fr' ? WORDS_FR : WORDS_EN;

  const filtered = corpus.filter(word =>
    [...word].every(c => keys.has(c))
  );

  if (filtered.length < MIN_WORDS) return null;

  let text = '';
  let lineLen = 0;
  const sentenceSizes = [3, 4, 5, 6];

  while (text.length < length) {
    const sentenceLen = sentenceSizes[Math.floor(Math.random() * sentenceSizes.length)];
    const words = [];
    for (let i = 0; i < sentenceLen; i++) {
      words.push(filtered[Math.floor(Math.random() * filtered.length)]);
    }
    text += words.join(' ') + '\n';
  }

  return text.slice(0, length);
}

/**
 * Check if a level is completed based on stats
 */
function isLevelCompleted(stats) {
  return (
    stats.totalChars >= THRESHOLDS.minChars &&
    stats.successRate >= THRESHOLDS.minSuccessRate &&
    stats.cpm >= THRESHOLDS.minCPM
  );
}

export { LEVEL_SPECS, THRESHOLDS, ROW_MAP, resolveKeys, generateDrill, generateTrainingText, isLevelCompleted, MIN_WORDS };