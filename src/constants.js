export const moduleId = "director";
export const infoColor = "#8232BB";

export function evalExpression(expr, ...args) {
  let code = `try {return ${expr}} catch(e) {return false}`;
  const f = new Function("...args", code);
  return f(...args)
}

// import { foundry } from '../modules/foundry.js';
// import { moduleId, SETTINGS } from '../constants.js';

export const FLAGS = {
  SEQUENCES: "director-sequences",
  HOOKS: "director-hooks",
  ACTIONS: "director-actions",
  TAGS: "director-tags",
}

export const SETTINGS = {
  HIDE_GIZMOS: "hide-gizmos",
  CTRL_BLOCK_DIRECTOR: "ctrl-block-director",
  SHIFT_INSTANT_EFFECT: "shift-instant-effect",
  SAVED_EFFECTS: "saved-effects",
  DROPPED_TILES_TO_EFFECTS: "dropped-tiles-to-effects",
  PATCH_SEQ_DB_DROP: "patch-seq-db-drop",

  TAGS: "tags",
  GLOBAL_TAGS: "global-tags",
  TAG_COLORS: "tag-colors",
  SHOW: "show",
  UI_SCALE: "ui-scale",
  RESOLUTION: "resolution",
  SEQUENCES: "sequences",
  ACTIONS: "actions",
  HOOKS: "hooks",
  SHOW_SEQUENCER: "show-sequencer",

  MANUAL_MODE: "warpgate-mode",
  SELECTED_SEQ: "selected-seq",
  SELECTED_TAB: "selected-tab",
  HIDE_IMPORT: "hide-import",
  ICON_COLLECTION: "icon-collection",
  COLLAPSED: "collapsed",

  KEY_SHOW: "key-show",
  KEY_COLLAPSE: "key-collapsed",
  THEME: "theme",
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
  },
  { mode: "selection", title: "Selection" },
  {
    mode: "sequencer",
    title: "Sequencer",
  },
  {
    mode: "effects", title: "Effects", premium: true,
  },
  { mode: "import", title: "Import" },
];

