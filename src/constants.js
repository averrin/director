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
  { id: 'effect', label: 'Effect' },
  { id: 'wait', label: 'Wait', args: [{ type: 'int', label: 'ms' }] },
  { id: 'macro', label: 'Macro', args: [{ type: 'macro', label: 'name' }] },
];
export const modifierSpecs = [
  { id: 'file', group: 'effect', args: [{ type: 'effect_file', label: 'file' }], cat: "Required" },
  { id: 'atLocation', group: 'effect', args: [{ type: 'position', label: 'pos' }], cat: "Required" },

  { id: 'scaleToObject', group: 'effect', args: [{ type: 'float', label: 'scale' }], cat: "Scale" },
  { id: 'scale', group: 'effect', args: [{ type: 'float', label: 'scale' }], cat: "Scale" },
  { id: 'scaleIn', group: 'effect', args: [{ type: 'float', label: 'scale' }, { type: 'int', label: 'ms' }], cat: "Scale" }, // {ease: "easeInOutCubic"})
  { id: 'scaleOut', group: 'effect', args: [{ type: 'float', label: 'scale' }, { type: 'int', label: 'ms' }], cat: "Scale" }, // {ease: "easeInCubic"})

  { id: 'stretchTo', group: 'effect', args: [{ type: 'position', label: 'pos' }] },
  { id: 'attachTo', group: 'effect', args: [{ type: 'token', label: 'pos' }] },
  { id: 'rotateTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }] },
  { id: 'moveTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }] },
  { id: 'moveSpeed', group: 'effect', args: [{ type: 'int', label: 'speed' }] },

  { id: 'repeats', group: 'effect', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }] },
  { id: 'randomizeMirrorY', group: 'effect', args: [] },
  { id: 'belowTokens', group: 'effect', args: [] },
  { id: 'duration', group: 'effect', args: [{ type: 'int', label: 'ms' }] }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeIn', group: 'effect', args: [{ type: 'int', label: 'ms' }] }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOut', group: 'effect', args: [{ type: 'int', label: 'ms' }] },
  { id: 'rotate', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }] }, // {ease: "easeInOutCubic"})
  { id: 'rotateIn', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }] }, // {ease: "easeInOutCubic"})
  { id: 'rotateOut', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }] }, //  {ease: "easeInCubic"})
  { id: 'waitUntilFinished', group: 'effect', args: [{ type: 'int', label: 'ms' }] },
  { id: 'async', group: 'effect', args: [] },
  { id: 'locally', group: 'effect', args: [] },
  { id: 'noLoop', group: 'effect', args: [{ type: 'bool', label: 'val' }] },
  { id: 'snapToGrid', group: 'effect', args: [{ type: 'bool', label: 'val' }] },
  { id: 'zeroSpriteRotation', group: 'effect', args: [{ type: 'bool', label: 'val' }] },
  { id: 'persist', group: 'effect', args: [{ type: 'bool', label: 'val' }] },
  { id: 'delay', group: 'effect', args: [{ type: 'int', label: 'ms' }] },
  { id: 'startTime', group: 'effect', args: [{ type: 'int', label: 'ms' }] },
  { id: 'startTimePerc', group: 'effect', args: [{ type: 'float', label: 'val' }] },
  { id: 'endTime', group: 'effect', args: [{ type: 'int', label: 'ms' }] },
  { id: 'endTimePerc', group: 'effect', args: [{ type: 'float', label: 'val' }] },
  { id: 'extraEndDuration', group: 'effect', args: [{ type: 'int', label: 'ms' }] },
  { id: 'timeRange', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: 'int', label: 'ms' }] },

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
  { id: "int" },
  { id: "float" },
  { id: "macro" },
];
