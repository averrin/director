import { moduleId, SETTINGS } from '../constants.js';
import { foundry } from './foundry.js';
import { setIconCollection } from "crew-components/specs"
setIconCollection("game-icons")

export let setting = key => {
  return game.settings.get(moduleId, key);
};

export async function migrateFromString(key) {
  try {
    let current = game.settings.get(moduleId, key);
    if (typeof current === "string" || current instanceof String) {
      current = JSON.parse(current);
      await game.settings.set(moduleId, key, current);
    }
    if (typeof current[0] === "string" || current[0] instanceof String) {
      current = JSON.parse(current[0]);
      if (Array.isArray(current)) {
        await game.settings.set(moduleId, key, current);
      }
    }
  } catch (error) {

  }
}

const debouncedReload = debounce(() => window.location.reload(), 100);
export function initSettings(app) {
  game.settings.register(moduleId, SETTINGS.SHOW, {
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register(moduleId, SETTINGS.COLLAPSED, {
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register(moduleId, SETTINGS.GLOBAL_TAGS, {
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.register(moduleId, SETTINGS.TAGS, {
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.register(moduleId, SETTINGS.SAVED_EFFECTS, {
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });


  game.settings.register(moduleId, SETTINGS.SEQUENCES, {
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.register(moduleId, SETTINGS.ACTIONS, {
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.register(moduleId, SETTINGS.HOOKS, {
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  //depricated
  game.settings.register(moduleId, SETTINGS.TAG_COLORS, {
    scope: "world",
    config: false,
    type: Object,
    default: {},
  });

  game.settings.register(moduleId, SETTINGS.SELECTED_SEQ, {
    scope: "client",
    config: false,
    type: String,
    default: '',
  });

  game.settings.register(moduleId, SETTINGS.SELECTED_TAB, {
    scope: "client",
    config: false,
    type: String,
    default: '',
  });

  foundry.settings.register(moduleId, SETTINGS.UI_SCALE, {
    name: 'UI scale',
    hint: 'If ui are too big or too small for your display. Requires refresh.',
    config: true,
    type: Number,
    default: 1,
    range: {
      min: 0.25,
      max: 2,
      step: 0.01
    }
  });
  game.settings.register(moduleId, SETTINGS.RESOLUTION, {
    name: "Selected image resolution",
    hint: "Higher is better quality but slower",
    scope: "client",
    config: true,
    range: {
      min: 30,
      max: 600,
      step: 5,
    },
    default: 200,
    type: Number,
  });

  game.settings.register(moduleId, SETTINGS.THEME, {
    name: "UI theme",
    hint: "",
    scope: "client",
    config: true,
    choices: {
      'light': "Light",
      'dark': "Dark",
    },
    default: "light",
    type: String,
  });

  game.settings.register(moduleId, SETTINGS.MANUAL_MODE, {
    name: "Position picker snapping mode",
    hint: "",
    scope: "client",
    config: true,
    choices: {
      '-1': "Grid centers",
      '0': "No snapping",
      '1': "Intersections",
      '2': "Intersections and centers"
    },
    default: "2",
    type: String,
  });

  game.settings.register(moduleId, SETTINGS.HIDE_IMPORT, {
    name: "Disable import/export feature",
    hint: "Just hide buttons if you don't need it",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(moduleId, SETTINGS.ICON_COLLECTION, {
    name: "Icon collection for actions",
    hint: "Examples: game-icons, mdi, material-symbols, openmoji. More: https://icon-sets.iconify.design",
    scope: "client",
    config: true,
    default: "game-icons",
    type: String,
    onChange: v => setIconCollection(v)
  });

  game.settings.register(moduleId, SETTINGS.DROPPED_TILES_TO_EFFECTS, {
    name: "Tile drop integration",
    hint: "Enable adding dropped tiles to effects",
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register(moduleId, SETTINGS.PATCH_SEQ_DB_DROP, {
    name: "Patch Sequencer's Database Viewer",
    hint: "Adding ability to drag and drop db entries as effects",
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register(moduleId, SETTINGS.CTRL_BLOCK_DIRECTOR, {
    name: "Hold CTRL to add dropped tile as tile instead of effect",
    hint: "Works only with Alpha File Manager",
    scope: "client",
    config: false,
    default: true,
    type: Boolean,
  });

  game.settings.register(moduleId, SETTINGS.SHIFT_INSTANT_EFFECT, {
    name: "Hold ALT to add dropped tile instantly without editor",
    hint: "Works only with Alpha File Manager. Default: persistant effect, hold CTRL to mke it temporary",
    scope: "client",
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(moduleId, SETTINGS.HIDE_GIZMOS, {
    name: "Hide Effect Editor gizmos",
    hint: "I mean sliders for rotation and scale.",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
  });
}
