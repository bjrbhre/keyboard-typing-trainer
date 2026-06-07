/**
 * Keyboard — layout data, finger mapping, colors
 *
 * Structured to easily add new layouts (AZERTY will be step 3)
 */

const FINGER_COLORS = {
  leftPinky:   '#cba6f7',  // mauve
  leftRing:    '#89b4fa',  // blue
  leftMiddle:  '#94e2d5',  // teal
  leftIndex:   '#a6e3a1',  // green
  rightIndex:  '#f9e2af',  // yellow
  rightMiddle: '#fab387',  // peach
  rightRing:   '#f38ba8',  // red
  rightPinky:  '#cba6f7',  // mauve
  thumb:       '#a6adc8',  // subtext0
};

const QWERTY = {
  name: 'QWERTY',
  rows: [
    // Row 0 — number row
    [
      { char: '`', finger: 'leftPinky',  width: 1 },
      { char: '1', finger: 'leftPinky',  width: 1 },
      { char: '2', finger: 'leftRing',   width: 1 },
      { char: '3', finger: 'leftMiddle', width: 1 },
      { char: '4', finger: 'leftIndex',  width: 1 },
      { char: '5', finger: 'leftIndex',  width: 1 },
      { char: '6', finger: 'rightIndex', width: 1 },
      { char: '7', finger: 'rightIndex', width: 1 },
      { char: '8', finger: 'rightMiddle', width: 1 },
      { char: '9', finger: 'rightRing',  width: 1 },
      { char: '0', finger: 'rightPinky', width: 1 },
      { char: '-', finger: 'rightPinky', width: 1 },
      { char: '=', finger: 'rightPinky', width: 1 },
    ],
    // Row 1 — top row
    [
      { char: 'q', finger: 'leftPinky',  width: 1 },
      { char: 'w', finger: 'leftRing',   width: 1 },
      { char: 'e', finger: 'leftMiddle', width: 1 },
      { char: 'r', finger: 'leftIndex',  width: 1 },
      { char: 't', finger: 'leftIndex',  width: 1 },
      { char: 'y', finger: 'rightIndex', width: 1 },
      { char: 'u', finger: 'rightIndex', width: 1 },
      { char: 'i', finger: 'rightMiddle', width: 1 },
      { char: 'o', finger: 'rightRing',  width: 1 },
      { char: 'p', finger: 'rightPinky', width: 1 },
      { char: '[', finger: 'rightPinky', width: 1 },
      { char: ']', finger: 'rightPinky', width: 1 },
      { char: '\\', finger: 'rightPinky', width: 1 },
    ],
    // Row 2 — home row
    [
      { char: 'a', finger: 'leftPinky',  width: 1, home: true },
      { char: 's', finger: 'leftRing',   width: 1, home: true },
      { char: 'd', finger: 'leftMiddle', width: 1, home: true },
      { char: 'f', finger: 'leftIndex',  width: 1, home: true },
      { char: 'g', finger: 'leftIndex',  width: 1 },
      { char: 'h', finger: 'rightIndex', width: 1, home: true },
      { char: 'j', finger: 'rightIndex', width: 1, home: true },
      { char: 'k', finger: 'rightMiddle', width: 1, home: true },
      { char: 'l', finger: 'rightRing',  width: 1, home: true },
      { char: ';', finger: 'rightPinky', width: 1, home: true },
      { char: "'", finger: 'rightPinky', width: 1 },
    ],
    // Row 3 — bottom row
    [
      { char: 'z', finger: 'leftPinky',  width: 1 },
      { char: 'x', finger: 'leftRing',   width: 1 },
      { char: 'c', finger: 'leftMiddle', width: 1 },
      { char: 'v', finger: 'leftIndex',  width: 1 },
      { char: 'b', finger: 'leftIndex',  width: 1 },
      { char: 'n', finger: 'rightIndex', width: 1 },
      { char: 'm', finger: 'rightIndex', width: 1 },
      { char: ',', finger: 'rightMiddle', width: 1 },
      { char: '.', finger: 'rightRing',  width: 1 },
      { char: '/', finger: 'rightPinky', width: 1 },
      { char: '\n', finger: 'rightPinky', width: 2, label: '↵' },
    ],
    // Row 4 — space bar
    [
      { char: ' ', finger: 'thumb', width: 6 },
    ],
  ],
  // Row offsets (stagger) in key-width units
  offsets: [0, 0.25, 0.5, 0.75, 1.5],
};

const AZERTY = {
  name: 'AZERTY',
  rows: [
    // Row 0 — number row
    [
      { char: '²', finger: 'leftPinky',  width: 1 },
      { char: '&', finger: 'leftPinky',  width: 1 },
      { char: 'é', finger: 'leftRing',   width: 1 },
      { char: '"', finger: 'leftMiddle', width: 1 },
      { char: "'", finger: 'leftIndex',  width: 1 },
      { char: '(', finger: 'leftIndex',  width: 1 },
      { char: '-', finger: 'rightIndex', width: 1 },
      { char: 'è', finger: 'rightIndex', width: 1 },
      { char: '_', finger: 'rightMiddle', width: 1 },
      { char: 'ç', finger: 'rightRing',  width: 1 },
      { char: 'à', finger: 'rightPinky', width: 1 },
      { char: ')', finger: 'rightPinky', width: 1 },
    ],
    // Row 1 — top row
    [
      { char: 'a', finger: 'leftPinky',  width: 1 },
      { char: 'z', finger: 'leftRing',   width: 1 },
      { char: 'e', finger: 'leftMiddle', width: 1 },
      { char: 'r', finger: 'leftIndex',  width: 1 },
      { char: 't', finger: 'leftIndex',  width: 1 },
      { char: 'y', finger: 'rightIndex', width: 1 },
      { char: 'u', finger: 'rightIndex', width: 1 },
      { char: 'i', finger: 'rightMiddle', width: 1 },
      { char: 'o', finger: 'rightRing',  width: 1 },
      { char: 'p', finger: 'rightPinky', width: 1 },
      { char: '^', finger: 'rightPinky', width: 1 },
      { char: '$', finger: 'rightPinky', width: 1 },
    ],
    // Row 2 — home row
    [
      { char: 'q', finger: 'leftPinky',  width: 1, home: true },
      { char: 's', finger: 'leftRing',   width: 1, home: true },
      { char: 'd', finger: 'leftMiddle', width: 1, home: true },
      { char: 'f', finger: 'leftIndex',  width: 1, home: true },
      { char: 'g', finger: 'leftIndex',  width: 1 },
      { char: 'h', finger: 'rightIndex', width: 1, home: true },
      { char: 'j', finger: 'rightIndex', width: 1, home: true },
      { char: 'k', finger: 'rightMiddle', width: 1, home: true },
      { char: 'l', finger: 'rightRing',  width: 1, home: true },
      { char: 'm', finger: 'rightPinky', width: 1, home: true },
      { char: 'ù', finger: 'rightPinky', width: 1 },
    ],
    // Row 3 — bottom row
    [
      { char: 'w', finger: 'leftPinky',  width: 1 },
      { char: 'x', finger: 'leftRing',   width: 1 },
      { char: 'c', finger: 'leftMiddle', width: 1 },
      { char: 'v', finger: 'leftIndex',  width: 1 },
      { char: 'b', finger: 'leftIndex',  width: 1 },
      { char: 'n', finger: 'rightIndex', width: 1 },
      { char: ',', finger: 'rightIndex', width: 1 },
      { char: ';', finger: 'rightMiddle', width: 1 },
      { char: ':', finger: 'rightRing',  width: 1 },
      { char: '!', finger: 'rightPinky', width: 1 },
      { char: '\n', finger: 'rightPinky', width: 2, label: '↵' },
    ],
    // Row 4 — space bar
    [
      { char: ' ', finger: 'thumb', width: 6 },
    ],
  ],
  offsets: [0, 0.25, 0.5, 0.75, 1.5],
};

const LAYOUTS = { QWERTY, AZERTY };

export { FINGER_COLORS, QWERTY, AZERTY, LAYOUTS };
