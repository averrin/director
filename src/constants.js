export const moduleId = "director";

// import { foundry } from '../modules/foundry.js';
// import { moduleId, SETTINGS } from '../constants.js';

export const SETTINGS = {
  GLOBAL_TAGS: "global-tags",
  TAG_COLORS: "tag-colors",
  SHOW: "show",
  UI_SCALE: "ui-scale",
  RESOLUTION: "resolution",
  SEQUENCES: "sequences",
  SHOW_SEQUENCER: "show-sequencer",
};

export const HOOKS = [
  'controlToken',
  'updateToken',
  'updateActor',
  'targetToken',

  'canvasReady',
  'createToken',
  'deleteToken',
  'deleteActor',
  // 'renderTokenActionHUD',
];


export const actionTypes = [
  { id: 'execute', label: 'Execute trigger', group: 'Active Tiles', require: "matt" },
  { id: 'toggle', label: 'Toggle visibility', group: 'Common' },
  { id: 'hide', label: 'Hide', group: 'Common' },
  { id: 'show', label: 'Show', group: 'Common' },
  { id: 'kill', label: 'Kill', group: 'Tokens' },
  { id: 'revive', label: 'Revive', group: 'Tokens' },
];

export const stepSpecs = [
  { id: 'effect', label: 'Effect', args: [{ type: 'string', label: 'name' }] },
  { id: 'animation', label: 'Animation' },
  { id: 'sound', label: 'Sound' },
  { id: 'wait', label: 'Wait', args: [{ type: 'int', label: 'ms' }] },
  { id: 'macro', label: 'Macro', args: [{ type: 'macro', label: 'name' }] },
];

export const modifierSpecs = [
  //Effect
  { id: 'file', group: 'effect', args: [{ type: 'effect_file', label: 'file' }], cat: "Required" },
  { id: 'atLocation', group: 'effect', args: [{ type: 'position', label: 'pos' }], cat: "Required" },
  //{ id: 'name', group: 'effect', args: [{ type: 'string', label: 'name' }], cat: "Generic" },

  { id: 'scaleToObject', group: 'effect', args: [{ type: 'float', label: 'scale' }], cat: "Scale" },
  { id: 'scale', group: 'effect', args: [{ type: 'float', label: 'scale' }], cat: "Scale" },
  { id: 'scaleIn', group: 'effect', args: [{ type: 'float', label: 'scale' }, { type: 'int', label: 'ms' }], cat: "Scale" }, // {ease: "easeInOutCubic"})
  { id: 'scaleOut', group: 'effect', args: [{ type: 'float', label: 'scale' }, { type: 'int', label: 'ms' }], cat: "Scale" }, // {ease: "easeInCubic"})

  { id: 'stretchTo', group: 'effect', args: [{ type: 'position', label: 'pos' }], cat: 'Move' },
  { id: 'attachTo', group: 'effect', args: [{ type: 'token', label: 'token' }], cat: 'Move' },
  { id: 'moveTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }], cat: 'Move' },
  { id: 'moveSpeed', group: 'effect', args: [{ type: 'int', label: 'speed' }], cat: 'Move' },

  { id: 'rotateTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }, { type: 'int', label: 'duration', option: true }], cat: 'Rotate' },
  { id: 'rotate', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateIn', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateOut', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }], cat: 'Rotate' }, //  {ease: "easeInCubic"})

  { id: 'fadeIn', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOut', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' },

  { id: 'repeats', group: 'effect', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: 'Generic' },
  { id: 'delay', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'effect', args: [], cat: 'Generic' },
  { id: 'duration', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})

  { id: 'randomizeMirrorY', group: 'effect', args: [] },
  { id: 'belowTokens', group: 'effect', args: [] },
  { id: 'locally', group: 'effect', args: [] },
  { id: 'noLoop', group: 'effect', args: [{ type: 'bool', label: 'val' }] },
  { id: 'snapToGrid', group: 'effect', args: [{ type: 'bool', label: 'val' }] },
  { id: 'zeroSpriteRotation', group: 'effect', args: [{ type: 'bool', label: 'val' }] },
  { id: 'persist', group: 'effect', args: [{ type: 'bool', label: 'val' }] },
  { id: 'startTime', group: 'effect', args: [{ type: 'int', label: 'ms' }] },
  { id: 'startTimePerc', group: 'effect', args: [{ type: 'float', label: 'val' }] },
  { id: 'endTime', group: 'effect', args: [{ type: 'int', label: 'ms' }] },
  { id: 'endTimePerc', group: 'effect', args: [{ type: 'float', label: 'val' }] },
  { id: 'extraEndDuration', group: 'effect', args: [{ type: 'int', label: 'ms' }] },
  { id: 'timeRange', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: 'int', label: 'ms' }] },

  //Animation
  { id: 'on', group: 'animation', args: [{ type: 'token', label: 'token' }], cat: 'Required' },

  { id: 'repeats', group: 'animation', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }] },
  { id: 'delay', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'animation', args: [], cat: 'Generic' },
  { id: 'duration', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})

  { id: 'fade', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeIn', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOut', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' },

  { id: 'moveTowards', group: 'animation', args: [{ type: 'position', label: 'pos' }], cat: 'Move' },
  { id: 'moveSpeed', group: 'animation', args: [{ type: 'int', label: 'speed' }], cat: 'Move' },
  { id: 'snapToGrid', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },
  { id: 'closestSquare', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },

  { id: 'rotateTowards', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: 'int', label: 'duration', option: true }], cat: 'Rotate' },
  { id: 'rotate', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateIn', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateOut', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }], cat: 'Rotate' }, //  {ease: "easeInCubic"})

  { id: 'hide', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Visibility' },
  { id: 'show', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Visibility' },

  { id: 'teleportTo', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: 'bool', label: 'relativeToCenter', option: true }], cat: 'Move' },

  //Sound
  { id: 'file', group: 'sound', args: [{ type: 'sound_file', label: 'file' }], cat: "Required" },
  { id: 'volume', group: 'sound', args: [{ type: 'int', label: 'min' }, { type: 'int', label: 'max' }], cat: "Generic" },

  { id: 'repeats', group: 'sound', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }] },
  { id: 'delay', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'sound', args: [], cat: 'Generic' },
  { id: 'duration', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})

  { id: 'fadeInAudio', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOutAudio', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' },
];

export const argSpecs = [
  {
    id: "position", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: "#target.first", label: "First Target" },
      { value: "#target.last", label: "Last Target" },
      { value: "#manual", label: "Manual" },
    ]
  },
  {
    id: "token", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: "#target.first", label: "First Target" },
      { value: "#target.last", label: "Last Target" },
    ]
  },
  {
    id: "bool", options: [
      { value: true, label: "True" },
      { value: false, label: "False" },
    ]
  },
  { id: "effect_file" },
  { id: "sound_file" },
  { id: "int" },
  { id: "float" },
  { id: "macro" },
];
