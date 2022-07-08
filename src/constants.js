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
  {
    mode: "hooks",
    title: "Hooks",
    badge: "<span class='ui-badge ui-mx-1' style='background-color: indianred'>𝛼</span>",
  },
  { mode: "selection", title: "Selection" },
  {
    mode: "sequencer",
    title: "Sequencer",
    badge: "<span class='ui-badge ui-mx-1' style='background-color: darkorange'>𝛽</span>",
  },
];

export const actionTypes = [
  { id: 'execute', label: 'Execute trigger', group: 'Active Tiles', require: "matt" },
  { id: 'toggle', label: 'Toggle visibility', group: 'Common' },
  { id: 'hide', label: 'Hide', group: 'Common' },
  { id: 'show', label: 'Show', group: 'Common' },
  { id: 'kill', label: 'Kill', group: 'Tokens' },
  { id: 'revive', label: 'Revive', group: 'Tokens' },
  { id: 'endEffect', label: 'End Effects', group: 'Sequences', valueType: 'effectSource' },
];

export const sectionSpecs = [
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
  { id: 'size', group: 'effect', args: [{ type: 'size', label: 'size' }], cat: "Scale" },

  { id: 'stretchTo', group: 'effect', args: [{ type: 'position', label: 'pos' }, { type: "bool", label: "attachTo", option: true }, { type: "bool", label: "cacheLocation", option: true }], cat: 'Move' },
  { id: 'attachTo', group: 'effect', args: [{ type: 'token', label: 'token' }], cat: 'Move' },
  { id: 'moveTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }, { type: "ease", label: "ease", option: true }], cat: 'Move' },
  { id: 'moveSpeed', group: 'effect', args: [{ type: 'int', label: 'speed' }], cat: 'Move' },
  { id: 'snapToGrid', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },
  { id: 'anchor', group: 'effect', args: [{ type: 'size', label: 'val' }], cat: 'Move' },
  { id: 'spriteAnchor', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: 'Move' },
  { id: 'center', group: 'effect', args: [], cat: 'Move' },
  { id: 'offset', group: 'effect', args: [{ type: 'offset', label: 'offset' }, { type: 'bool', label: 'local', option: true }], cat: 'Move' },
  { id: 'spriteOffset', group: 'effect', args: [{ type: 'offset', label: 'offset' }], cat: 'Move' },

  { id: 'from', group: 'effect', args: [{ type: 'placeable', label: 'placeable' }], cat: 'Generic' },

  { id: 'rotateTowards', group: 'effect', args: [{ type: 'position', label: 'pos' }, { type: 'int', label: 'duration', option: true }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' },
  { id: 'rotate', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'randomRotation', group: 'effect', args: [], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateIn', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateOut', group: 'effect', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, //  {ease: "easeInCubic"})
  { id: 'zeroSpriteRotation', group: 'effect', args: [{ type: 'bool', label: 'val' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' },

  { id: 'fadeIn', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOut', group: 'effect', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' },
  { id: 'opacity', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: 'Fade' },

  { id: 'playbackRate', group: 'effect', args: [{ type: 'float', label: 'val' }], cat: 'Generic' },

  { id: 'repeats', group: 'effect', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: 'Generic' },
  { id: 'delay', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'effect', args: [], cat: 'Generic' },
  { id: 'duration', group: 'effect', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'playIf', group: 'effect', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },
  { id: 'private', group: 'effect', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },
  { id: 'missed', group: 'effect', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },
  { id: 'tint', group: 'effect', args: [{ type: 'color', label: 'color' }], cat: 'Generic' },

  { id: 'xray', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: 'Generic' },
  { id: 'mask', group: 'effect', args: [{ type: 'token', label: 'token' }], cat: 'Generic' },
  { id: 'text', group: 'effect', args: [{ type: 'string', label: 'text' }, { type: "color", label: "fill", option: true }, { type: "int", label: "fontSize", option: true }], cat: 'Generic' },

  { id: 'mirrorY', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Mirror" },
  { id: 'mirrorX', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Mirror" },
  { id: 'randomizeMirrorY', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Mirror" },
  { id: 'randomizeMirrorX', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Mirror" },

  { id: 'screenSpace', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Screen space" },
  { id: 'screenSpaceAboveUI', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Screen space" },
  { id: 'screenSpaceAnchor', group: 'effect', args: [{ type: 'offset', label: 'val' }], cat: "Screen space" },
  { id: 'screenSpacePosition', group: 'effect', args: [{ type: 'offset', label: 'val' }], cat: "Screen space" },

  { id: 'belowTokens', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Generic" },
  { id: 'belowTiles', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Generic" },
  { id: 'aboveLightning', group: 'effect', args: [{ type: 'bool', label: 'val' }], cat: "Generic" },
  { id: 'zIndex', group: 'effect', args: [{ type: 'int', label: 'val' }], cat: "Generic" },
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
  { id: 'on', group: 'animation', args: [{ type: 'placeable', label: 'placeable' }], cat: 'Required' },

  { id: 'repeats', group: 'animation', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: "Generic" },
  { id: 'delay', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'animation', args: [], cat: 'Generic' },
  { id: 'duration', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'playIf', group: 'animation', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },

  { id: 'fade', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeIn', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOut', group: 'animation', args: [{ type: 'int', label: 'ms' }], cat: 'Fade' },
  { id: 'opacity', group: 'animation', args: [{ type: 'float', label: 'val' }], cat: 'Fade' },

  { id: 'moveTowards', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: "ease", label: "ease", option: true }], cat: 'Move' },
  { id: 'moveSpeed', group: 'animation', args: [{ type: 'int', label: 'speed' }], cat: 'Move' },
  { id: 'snapToGrid', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },
  { id: 'closestSquare', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Move' },

  { id: 'offset', group: 'animation', args: [{ type: 'offset', label: 'offset' }], cat: 'Move' },

  { id: 'rotateTowards', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: 'int', label: 'duration', option: true }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' },
  { id: 'rotate', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateIn', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, // {ease: "easeInOutCubic"})
  { id: 'rotateOut', group: 'animation', args: [{ type: 'int', label: 'deg' }, { type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Rotate' }, //  {ease: "easeInCubic"})

  { id: 'tint', group: 'animation', args: [{ type: 'color', label: 'color' }], cat: 'Generic' },
  { id: 'hide', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Visibility' },
  { id: 'show', group: 'animation', args: [{ type: 'bool', label: 'val' }], cat: 'Visibility' },

  { id: 'teleportTo', group: 'animation', args: [{ type: 'position', label: 'pos' }, { type: 'bool', label: 'relativeToCenter', option: true }], cat: 'Move' },

  { id: 'volume', group: 'animation', args: [{ type: 'int', label: 'min' }, { type: 'int', label: 'max' }], cat: "Generic" },
  { id: 'fadeInAudio', group: 'animation', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOutAudio', group: 'animation', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' },

  //Sound
  { id: 'file', group: 'sound', args: [{ type: 'sound_file', label: 'file' }], cat: "Required" },
  { id: 'volume', group: 'sound', args: [{ type: 'int', label: 'min' }, { type: 'int', label: 'max' }], cat: "Generic" },

  { id: 'repeats', group: 'sound', args: [{ type: 'int', label: 'count' }, { type: 'int', label: 'delay min' }, { type: 'int', label: 'delay max' }], cat: "Generic" },
  { id: 'delay', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'waitUntilFinished', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' },
  { id: 'async', group: 'sound', args: [], cat: 'Generic' },
  { id: 'duration', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: 'Generic' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'playIf', group: 'sound', args: [{ type: 'bool', label: 'func' }], cat: 'Generic' },

  { id: 'fadeInAudio', group: 'sound', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' }, //1500, {ease: "easeOutCubic", delay: 500})
  { id: 'fadeOutAudio', group: 'sound', args: [{ type: 'int', label: 'ms' }, { type: "ease", label: "ease", option: true }], cat: 'Fade' },

  { id: 'startTime', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'startTimePerc', group: 'sound', args: [{ type: 'float', label: 'val' }], cat: "Time" },
  { id: 'endTime', group: 'sound', args: [{ type: 'int', label: 'ms' }], cat: "Time" },
  { id: 'endTimePerc', group: 'sound', args: [{ type: 'float', label: 'val' }], cat: "Time" },
  { id: 'locally', group: 'sound', args: [], cat: "Generic" },
];

export const hookSpecs = [
  { id: "#onHit", parents: ["updateActor"], test: (actor, updates) => actor.data.data.attributes.hp.value < updates.prevHp },
  { id: "#onHeal", parents: ["updateActor"], test: (actor, updates) => actor.data.data.attributes.hp.value > updates.prevHp },
  { id: "#onDeath", parents: ["updateActor"], test: (actor, _) => actor.data.data.attributes.hp.value <= 0 },
  { id: "#onMove", parents: ["updateToken"], test: (token, updates, _) => "x" in updates || "y" in updates || "elevation" in updates },
];

export const argSpecs = [
  {
    id: "position", options: [
      { value: "#controlled.first", label: "First Controlled", group: "Controlled" },
      { value: "#controlled.last", label: "Last Controlled", group: "Controlled" },
      { value: "#target.first", label: "First Target", group: "Targets" },
      { value: "#target.last", label: "Last Target", group: "Targets" },
      { value: "#manual", label: "Manual", group: "Other" },
      { value: { x: 0, y: 0 }, label: "Fixed", group: "Other" },
      { value: [], label: "Tagger", group: "Other" },
    ], var_types: ["position", "token", "tile", "expression"], default: { x: 0, y: 0 }
  },
  {
    id: "offset", var_types: ["offset", "size", "position", "expression"], default: { x: 0, y: 0 }
  },
  {
    id: "size", var_types: ["offset", "size", "position", "expression"], default: { x: 0, y: 0 }
  },
  {
    id: "placeable", options: [
      { value: "#id:", label: "Id or Name" },
    ], var_types: ["placeable", "token", "tile", "expression"]
  },
  {
    id: "token", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: "#target.first", label: "First Target" },
      { value: "#target.last", label: "Last Target" },
      { value: [], label: "Tagger" },
      { value: "#id:", label: "Id or Name" },
    ], var_types: ["token", "expression"]
  },
  {
    id: "tile", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: [], label: "Tagger" },
      { value: "#id:", label: "Id or Name" },
    ], var_types: ["tile", "expression"]
  },
  {
    id: "targets", options: [
      { value: "#controlled.all", label: "All Controlled", group: "Controlled" },
      { value: "#controlled.random", label: "Random Controlled", group: "Controlled" },
      { value: "#controlled.first", label: "First Controlled", group: "Controlled" },
      { value: "#controlled.last", label: "Last Controlled", group: "Controlled" },
      { value: "#target.all", label: "All Targets", group: "Targets" },
      { value: "#target.random", label: "Random Target", group: "Targets" },
      { value: "#target.first", label: "First Target", group: "Targets" },
      { value: "#target.last", label: "Last Target", group: "Targets" },
      { value: "#id:", label: "Id or Name", group: "Other" },
      { value: "#tokens.all", label: "All Tokens", group: "Other" },
      { value: "#tiles.all", label: "All Tiles", group: "Other" },
      { value: [], label: "Tagger", group: "Other" },
    ]
  },
  {
    id: "bool", var_types: ["bool", "expression"], default: false,
  },
  { id: "effect_file", var_types: ["effect_file", "expression"] },
  { id: "sound_file", var_types: ["sound_file", "expression"] },
  { id: "int", var_types: ["int", "expression"] },
  { id: "float", var_types: ["float", "int", "expression"] },
  { id: "macro", var_types: ["macro", "string", "expression"] },
  { id: "string", var_types: ["string", "expression"] },
  { id: "color", var_types: ["string", "color", "expression"] },
  { id: "code", var_types: ["code", "string", "expression"] },
  { id: "expression", var_types: ["expression"] },
  { id: "token-magic", var_types: ["token-magic", "string", "expression"] },
  {
    id: "hook", var_types: ["hook"], options: [
      { value: "#onHit", label: "On Hit" },
      { value: "#onHeal", label: "On Heal" },
      { value: "#onDeath", label: "On Death" },
      { value: "#onMove", label: "On Move" },
    ]
  },
  {
    id: "effectSource", var_types: ["effect"], options: [
      { value: "#sceneId", label: "All on the scene" },
      { value: "#origin", label: "From sequence" },
      { value: "#name", label: "By name" },
      { value: "#object", label: "By object" },
      { value: "#target", label: "By target" },
      { value: "#source", label: "By source" },
    ]
  },
  {
    id: "ease", var_types: ["ease", "expression"], options: [
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
