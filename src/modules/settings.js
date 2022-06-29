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

  foundry.settings.register(moduleId, SETTINGS.SHOW_SEQUENCER, {
    name: 'Show Sequencer tab',
    hint: 'Early beta! Buggy and lacks of features. Requires refresh.',
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      debouncedReload();
    },
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
}
