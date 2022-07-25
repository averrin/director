import { moduleId, SETTINGS } from '../constants.js';
import { writable } from 'svelte/store';
import { DSequence } from "./Sequencer.js";
import Action from "./Actions.js";
import Hook from "./Hooks.js";
import HookManager from './HookManager.js';
import { classToPlain } from 'class-transformer';

export const tokensStore = writable([]);
export const tilesStore = writable([]);
export const currentScene = writable(null);

export const globalTags = writable([]);
export function initGlobalTags() {
  globalTags.set(JSON.parse(game.settings.get(moduleId, SETTINGS.GLOBAL_TAGS)));
  globalTags.subscribe(async (tags) => {
    game.settings.set(moduleId, SETTINGS.GLOBAL_TAGS, JSON.stringify(tags));
  });
}

export const tagColors = writable({});
export function initTagColors() {
  tagColors.set(JSON.parse(game.settings.get(moduleId, SETTINGS.TAG_COLORS)));
  tagColors.subscribe(async (colors) => {
    game.settings.set(moduleId, SETTINGS.TAG_COLORS, JSON.stringify(colors));
  });
}

export const sequences = writable([]);
function updateSequences() {
  const global = game.settings.get(moduleId, SETTINGS.SEQUENCES);
  let inScene = [];
  if (globalThis.canvas.scene) {
    inScene = "director-sequences" in globalThis.canvas.scene?.data.flags
      ? globalThis.canvas.scene.data.flags["director-sequences"].filter((a) => a).map(a => DSequence.fromPlain(a))
      : [];
  }
  sequences.set(
    [...inScene, ...global].flat()
      .filter(s => s).map(s => DSequence.fromPlain(s)));
}
export function initSequences() {
  const ss = game.settings.get(moduleId, SETTINGS.SEQUENCES);
  if (typeof ss === 'string' || ss instanceof String) {
    game.settings.set(moduleId, SETTINGS.SEQUENCES, JSON.parse(ss)); //Migration
  }
  updateSequences();
  sequences.subscribe(async (seqs) => {
    game.settings.set(moduleId, SETTINGS.SEQUENCES, seqs.filter(s => !s.inScene));
    globalThis.canvas.scene?.update({ "flags.director-sequences": seqs.filter(s => s.inScene).map(s => s.toJSON()) });
  });
}

export const actions = writable([]);
export const hooks = writable([]);
let _scene;
export function initCurrentScene() {
  currentScene.subscribe(async (result) => {
    const scene = await result;
    if (!scene || scene == null || _scene == scene) return;
    _scene = scene;

    hooks.set("director-hooks" in scene.data.flags
      ? scene.data.flags["director-hooks"].filter((a) => a).map(a => Hook.fromPlain(a))
      : []);
    actions.set("director-actions" in scene.data.flags
      ? scene.data.flags["director-actions"].filter((a) => a).map(a => Action.fromPlain(a))
      : []);

    await HookManager.onSceneChange(scene);

    updateSequences();
  });
}

export function initActions() {
  actions.subscribe(async (result) => {
    const actions = await result;
    if (!actions) return;
    currentScene.update(async (result) => {
      const scene = await result;
      if (!scene || scene == null) return scene;
      if (scene.data.flags["director-actions"]?.filter((a) => a) != actions) {
        scene.update({ "flags.director-actions": actions.map(a => a.toJSON()) });
        await HookManager.onActionsChange(actions);
      }
      return scene;
    });
  });
}

export function initHooks() {
  hooks.subscribe(async (result) => {
    const hooks = await result;
    if (!hooks) return;
    currentScene.update(async (result) => {
      const scene = await result;
      if (!scene || scene == null) return scene;
      if (scene.data.flags["director-hooks"]?.filter((a) => a) != hooks) {
        scene.update({ "flags.director-hooks": hooks });
        await HookManager.onHooksChange(hooks);
      }
      return scene;
    });
  });
}

export function initStores() {
  initCurrentScene();
  initActions();
  initGlobalTags();
  initTagColors();
  initSequences();
  initHooks();
}
