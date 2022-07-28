import { moduleId, SETTINGS } from '../constants.js';
import { foundry } from './foundry.js';

export let setting = key => {
  return game.settings.get(moduleId, key);
};

const debouncedReload = debounce(() => window.location.reload(), 100);
export function initSettings(app) {
  game.settings.register(moduleId, SETTINGS.SHOW, {
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register(moduleId, SETTINGS.GLOBAL_TAGS, {
    scope: "world",
    config: false,
    type: Array,
    default: '[]',
  });

  game.settings.register(moduleId, SETTINGS.SEQUENCES, {
    scope: "world",
    config: false,
    type: Array,
    default: '[]',
  });

  game.settings.register(moduleId, SETTINGS.TAG_COLORS, {
    scope: "world",
    config: false,
    type: Object,
    default: '{}',
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
    onChange: value => {
      debouncedReload();
    },
    range: {
      min: 0.1,
      max: 2,
      step: 0.01
    }
  });

  game.settings.register(moduleId, SETTINGS.RESOLUTION, {
    name: "Selected image resolution",
    hint: "Higher is better quality but slower",
    scope: "world",
    config: true,
    range: {
      min: 30,
      max: 600,
      step: 5,
    },
    default: 200,
    type: Number,
    onChange: debouncedReload
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
    default: 2,
    type: Number,
  });

  game.settings.register(moduleId, SETTINGS.HIDE_IMPORT, {
    name: "Disable import/export feature",
    hint: "Just hide buttons if you don't need it",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(moduleId, SETTINGS.ICON_COLLECTION, {
    name: "Icon collection for actions",
    hint: "Examples: mdi, material-symbols, openmoji. More: https://icon-sets.iconify.design",
    scope: "client",
    config: true,
    default: "mdi",
    type: String,
  });
}
