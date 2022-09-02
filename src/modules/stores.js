import { moduleId, SETTINGS, FLAGS } from '../constants.js';
import { writable } from 'svelte/store';
import { DSequence } from "./Sequencer.js";
import Action from "./Actions.js";
import Hook from "./Hooks.js";
import HookManager from './HookManager.js';
import { classToPlain } from 'class-transformer';
import { getFlag, hasFlag } from 'crew-components/helpers';
import { migrateOldTags } from './Tags.js';
import Tag from './Tags.js';

export const tokensStore = writable([]);
export const tilesStore = writable([]);
export const wallsStore = writable([]);
export const lightsStore = writable([]);
export const currentScene = writable(null);
export const theme = writable("light");

export const globalTags = writable([]);
export const tagsStore = writable([]);

function loadTags(scene) {
  const global = game.settings.get(moduleId, SETTINGS.GLOBAL_TAGS);
  let inScene;
  if (scene) {
    inScene = hasFlag(scene, FLAGS.TAGS)
      ? getFlag(scene, FLAGS.TAGS).filter((a) => a)
      : [];
  }
  globalTags.set([...global, ...inScene].flat());
}

function saveGlobalTags(tags, specs) {
  const nSpecs = tags.filter(t => !specs.find(s => s.text == t)).map(t => new Tag(t));
  if (nSpecs.length > 0) {
    specs.push(...nSpecs);
    tagsStore.set(specs);
  }
  game.settings.set(moduleId, SETTINGS.GLOBAL_TAGS, tags.filter(t => specs.find(s => s.text == t)?.global));
  const updates = {};
  updates[`flags.${FLAGS.TAGS}`] = tags.filter(t => !specs.find(s => s.text == t)?.global);
  globalThis.canvas?.scene?.update(updates);
}

export function initGlobalTags() {
  let specs;
  tagsStore.set(game.settings.get(moduleId, SETTINGS.TAGS).map(Tag.fromPlain).filter(a => a));
  tagsStore.subscribe(async (tags) => {
    specs = tags;
    game.settings.set(moduleId, SETTINGS.TAGS, tags);
    globalTags.update(t => {
      if (t.length > 0) {
        saveGlobalTags(t, tags);
      }
      return t;
    })
  });
  loadTags(globalThis.canvas.scene);

  globalTags.subscribe(async (tags) => {
    saveGlobalTags(tags, specs);
  });
}

export const tagColors = writable({});
export function initTagColors() {
  tagColors.set(game.settings.get(moduleId, SETTINGS.TAG_COLORS));
  tagColors.subscribe(async (colors) => {
    game.settings.set(moduleId, SETTINGS.TAG_COLORS, colors);
  });
}

export const sequences = writable([]);
function updateSequences() {
  const global = game.settings.get(moduleId, SETTINGS.SEQUENCES);
  let inScene = [];
  if (globalThis.canvas.scene) {
    inScene = hasFlag(globalThis.canvas.scene, FLAGS.SEQUENCES)
      ? getFlag(globalThis.canvas.scene, FLAGS.SEQUENCES).filter((a) => a).map(a => DSequence.fromPlain(a))
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
    globalThis.Hooks.call("DirectorUpdateSequences", sequences);
  });
}

export const actions = writable([]);

function loadActions(scene) {
  const inScene = hasFlag(scene, FLAGS.ACTIONS)
    ? getFlag(scene, FLAGS.ACTIONS)
    : [];
  const global = game.settings.get(moduleId, SETTINGS.ACTIONS);

  actions.set([...global, ...inScene].flat().filter((a) => a).map(a => Action.fromPlain(a)));
}

export const hooks = writable([]);

function loadHooks(scene) {
  const inScene = hasFlag(scene, FLAGS.HOOKS)
    ? getFlag(scene, FLAGS.HOOKS)
    : [];
  const global = game.settings.get(moduleId, SETTINGS.HOOKS);

  hooks.set([...global, ...inScene].flat().filter((a) => a).map(a => Hook.fromPlain(a)));
}

let _scene;
export function initCurrentScene() {
  currentScene.subscribe(async (result) => {
    const scene = await result;
    if (!scene || scene == null || _scene == scene) return;
    _scene = scene;

    loadHooks(scene);
    loadActions(scene);
    loadTags(scene);

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
      if (getFlag(scene, FLAGS.ACTIONS)?.filter((a) => a) != actions) {
        const updates = {};
        updates[`flags.${FLAGS.ACTIONS}`] = actions.filter(a => !a.global).map(a => a.toJSON())
        scene.update(updates);
        game.settings.set(moduleId, SETTINGS.ACTIONS, actions.filter(a => a.global));
        await HookManager.onActionsChange(actions);
        globalThis.Hooks.call("DirectorUpdateActions", actions);
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
      if (getFlag(scene, FLAGS.HOOKS)?.filter((a) => a) != hooks) {
        const updates = {};
        updates[`flags.${FLAGS.HOOKS}`] = hooks.filter(a => !a.global);
        scene.update(updates);
        game.settings.set(moduleId, SETTINGS.HOOKS, hooks.filter(a => a.global));

        await HookManager.onHooksChange(hooks);
        globalThis.Hooks.call("DirectorUpdateHooks", hooks);
      }
      return scene;
    });
  });
}

export async function initStores() {
  theme.set(game.settings.get(moduleId, SETTINGS.THEME));

  initCurrentScene();
  initActions();
  await migrateOldTags();
  initGlobalTags();
  initTagColors();
  initSequences();
  initHooks();
}
