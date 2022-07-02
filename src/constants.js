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

  DEFAULT_TAB: "default-tab",
  MANUAL_MODE: "warpgate-mode",
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

export const tabs = [
  { mode: "actions", title: "Actions" },
  { mode: "selection", title: "Selection" },
  {
    mode: "sequencer",
    title: "Sequencer",
    badge: "<span class='ui-badge ui-mx-1' style='background-color: indianred'>beta</span>",
  }
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
  { id: 'thenDo', label: 'thenDo', args: [{ type: 'code', label: 'func' }] },

  { id: 'tmAdd', label: 'Token Magic Add', require: "TokenMagic", args: [{ type: 'token', label: 'target' }, { type: 'token-magic', label: 'filter' }] },
  { id: 'tmDel', label: 'Token Magic Remove', require: "TokenMagic", args: [{ type: 'token', label: 'target' }, { type: 'token-magic', label: 'filter' }] },
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
  { id: 'moveTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }, { type: "ease", label: "ease", option: true }], cat: 'Move' },
  { id: 'moveSpeed', group: 'effect', args: [{ type: 'int', label: 'speed' }], cat: 'Move' },
  { id: 'snapToGrid', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },

  { id: 'rotateTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }, { type: 'int', label: 'duration', option: true }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' },
  { id: 'rotate', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateIn', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateOut', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, //  {ease: "easeInCubic"})
  { id: 'zeroSpriteRotation', group: 'effect', args: [{ type: 'bool', label: 'val' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' },

  { id: 'fadeIn', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOut', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' },

  { id: 'repeats', group: 'effect', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: 'Generic' },
  { id: 'delay', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'effect', args: [], cat: 'Generic' },
  { id: 'duration', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'playIf', group: 'effect', args: [{ type: 'expression', label: 'func' }], cat: 'Generic' },

  { id: 'randomizeMirrorY', group: 'effect', args: [], cat: "Generic" },
  { id: 'belowTokens', group: 'effect', args: [], cat: "Generic" },
  { id: 'locally', group: 'effect', args: [], cat: "Generic" },
  { id: 'noLoop', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Generic" },

  { id: 'persist', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Time" },
  { id: 'startTime', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'startTimePerc', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: "Time" },
  { id: 'endTime', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'endTimePerc', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: "Time" },
  { id: 'extraEndDuration', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'timeRange', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: 'int', label: 'ms' }], cat: "Time" },

  //Animation
  { id: 'on', group: 'animation', args: [{ type: 'token', label: 'token' }], cat: 'Required' },

  { id: 'repeats', group: 'animation', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: "Generic" },
  { id: 'delay', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'animation', args: [], cat: 'Generic' },
  { id: 'duration', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'playIf', group: 'animation', args: [{ type: 'expression', label: 'func' }], cat: 'Generic' },

  { id: 'fade', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeIn', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOut', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' },

  { id: 'moveTowards', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: "ease", label: "ease", option: true }], cat: 'Move' },
  { id: 'moveSpeed', group: 'animation', args: [{ type: 'int', label: 'speed' }], cat: 'Move' },
  { id: 'snapToGrid', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },
  { id: 'closestSquare', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },

  { id: 'rotateTowards', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: 'int', label: 'duration', option: true }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' },
  { id: 'rotate', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateIn', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateOut', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, //  {ease: "easeInCubic"})

  { id: 'hide', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Visibility' },
  { id: 'show', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Visibility' },

  { id: 'teleportTo', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: 'bool', label: 'relativeToCenter', option: true }], cat: 'Move' },

  //Sound
  { id: 'file', group: 'sound', args: [{ type: 'sound_file', label: 'file' }], cat: "Required" },
  { id: 'volume', group: 'sound', args: [{ type: 'int', label: 'min' }, { type: 'int', label: 'max' }], cat: "Generic" },

  { id: 'repeats', group: 'sound', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: "Generic" },
  { id: 'delay', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'sound', args: [], cat: 'Generic' },
  { id: 'duration', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'playIf', group: 'sound', args: [{ type: 'expression', label: 'func' }], cat: 'Generic' },

  { id: 'fadeInAudio', group: 'sound', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOutAudio', group: 'sound', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' },
];

export const argSpecs = [
  {
    id: "position", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: "#target.first", label: "First Target" },
      { value: "#target.last", label: "Last Target" },
      { value: "#manual", label: "Manual" },
      { value: [], label: "Tagger" },
    ]
  },
  {
    id: "token", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: "#target.first", label: "First Target" },
      { value: "#target.last", label: "Last Target" },
      { value: [], label: "Tagger" },
    ]
  },
  {
    id: "targets", options: [
      { value: "#controlled.all", label: "All Controlled" },
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: "#target.all", label: "All Targets" },
      { value: "#target.first", label: "First Target" },
      { value: "#target.last", label: "Last Target" },
      { value: [], label: "Tagger" },
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
  { id: "code" },
  { id: "expression" },
  { id: "token-magic" },
  {
    id: "ease", options: [
      { value: "linear", label: "linear" },
      { value: "easeInSine", label: "InSine" },
      { value: "easeOutSine", label: "OutSine" },
      { value: "easeInOutSine", label: "InOutSine" },
      { value: "easeInQuad", label: "InQuad" },
      { value: "easeOutQuad", label: "OutQuad" },
      { value: "easeInOutQuad", label: "InOutQuad" },
      { value: "easeInCubic", label: "InCubic" },
      { value: "easeOutCubic", label: "OutCubic" },
      { value: "easeInOutCubic", label: "InOutCubic" },
      { value: "easeInQuart", label: "InQuart" },
      { value: "easeOutQuart", label: "OutQuart" },
      { value: "easeInOutQuart", label: "InOutQuart" },
      { value: "easeInQuint", label: "InQuint" },
      { value: "easeOutQuint", label: "OutQuint" },
      { value: "easeInOutQuint", label: "InOutQuint" },
      { value: "easeInExpo", label: "InExpo" },
      { value: "easeOutExpo", label: "OutExpo" },
      { value: "easeInOutExpo", label: "InOutExpo" },
      { value: "easeInCirc", label: "InCirc" },
      { value: "easeOutCirc", label: "OutCirc" },
      { value: "easeInOutCirc", label: "InOutCirc" },
      { value: "easeInBack", label: "InBack" },
      { value: "easeOutBack", label: "OutBack" },
      { value: "easeInOutBack", label: "InOutBack" },
      { value: "easeInElastic", label: "InElastic" },
      { value: "easeOutElastic", label: "OutElastic" },
      { value: "easeInOutElastic", label: "InOutElastic" },
      { value: "easeInBounce", label: "InBounce" },
      { value: "easeOutBounce", label: "OutBounce" },
      { value: "easeInOutBounce", label: "InOutBounce" },
    ]
  }
];
