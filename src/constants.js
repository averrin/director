export const moduleId = "director";
export const infoColor = "#8232BB";

export function evalExpression(expr, ...args) {
  let code = `try {return ${expr}} catch(e) {return false}`;
  const f = new Function("...args", code);
  return f(...args)
}

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

  MANUAL_MODE: "warpgate-mode",
  SELECTED_SEQ: "selected-seq",
  SELECTED_TAB: "selected-tab",
  HIDE_IMPORT: "hide-import",
  ICON_COLLECTION: "icon-collection",

  KEY_SHOW: "key-show",
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
  { mode: "import", title: "Import" },
];

