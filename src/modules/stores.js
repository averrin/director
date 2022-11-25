import { moduleId, SETTINGS, FLAGS } from '../constants.js';
import { writable, get } from 'svelte/store';
import { DSequence, Modifier } from "./Sequencer.js";
import Action from "./Actions.js";
import Hook from "./Hooks.js";
import HookManager from './HookManager.js';
import { classToPlain } from 'class-transformer';
import { getFlag, hasFlag, logger, setting } from 'crew-components/helpers';
import { migrateOldTags } from './Tags.js';
import Tag from './Tags.js';
import { settingStore, hookedStore, currentScene } from "crew-components/stores"

import { getControlledTiles } from "./helpers.js";

export let tokensStore = writable([]);
export let tilesStore = writable([]);
export let wallsStore = writable([]);
export let lightsStore = writable([]);

export const globalTags = writable([]);
export const tagsStore = writable([]);

function loadTags(scene) {
  const global = game.settings.get(moduleId, SETTINGS.GLOBAL_TAGS);
  let inScene = [];
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
  logger.info(hasFlag(scene, FLAGS.ACTIONS), getFlag(scene, FLAGS.ACTIONS));
  const inScene = hasFlag(scene, FLAGS.ACTIONS)
    ? getFlag(scene, FLAGS.ACTIONS)
    : [];
  const global = game.settings.get(moduleId, SETTINGS.ACTIONS);

  const aa = [...global, ...inScene].flat().filter((a) => a).map(a => Action.fromPlain(a));
  actions.set(aa);
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
    if (!scene || scene === null || _scene === scene) return;
    _scene = scene;

    logger.info(`update current scene: ${scene.name}`);
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
    const scene = get(currentScene);
    if (!scene || scene == null) return scene;
    if (getFlag(scene, FLAGS.ACTIONS)?.filter((a) => a) != actions) {
      const updates = {};
      updates[`flags.${FLAGS.ACTIONS}`] = actions.filter(a => !a.global).map(a => a.toJSON())
      scene.update(updates);
      game.settings.set(moduleId, SETTINGS.ACTIONS, actions.filter(a => a.global));
      await HookManager.onActionsChange(actions);
      globalThis.Hooks.call("DirectorUpdateActions", actions);
    }
  });
}

export function initHooks() {
  hooks.subscribe(async (result) => {
    const hooks = await result;
    if (!hooks) return;
    const scene = get(currentScene);
    if (!scene || scene == null) return scene;
    if (getFlag(scene, FLAGS.HOOKS)?.filter((a) => a) != hooks) {
      const updates = {};
      updates[`flags.${FLAGS.HOOKS}`] = hooks.filter(a => !a.global);
      scene.update(updates);
      game.settings.set(moduleId, SETTINGS.HOOKS, hooks.filter(a => a.global));

      await HookManager.onHooksChange(hooks);
      globalThis.Hooks.call("DirectorUpdateHooks", hooks);
    }
  });
}

import { v4 as uuidv4 } from "uuid";
export let editingEffect = writable(null);

const _m = (t, v) => {
  const m = new Modifier(uuidv4(), "");
  m.setType(t, "effect");
  m.args = v;
  return m;
};

function initDropHandler() {
  Hooks.on("dropCanvasData", (canvas, data) => {
    if (!setting(SETTINGS.DROPPED_TILES_TO_EFFECTS)) return true;
    if (data.blockDirector) return true;
    if (data.type != "Tile" && data.type != "Effect") return true;
    if (data.type == "Tile") {
      let file = data.texture.src;
      const db = Sequencer.Database.inverseFlattenedEntries.get(file)
      if (db) {
        file = db
      }

      const id = uuidv4()

      logger.info(data);
      canvas["sequencerEffects"].activate();
      let token;
      const tokens = canvas.tokens.placeables.filter(t => (t.x + t.w > data.x && t.y + t.h > data.y && t.x < data.x && t.y < data.y))
      if (tokens.length == 1) {
        token = tokens[0];
      }
      Director.openEffectEditor({
        data: { id, file, opacity: 1, persist: !data.temp },
        position: data, token,
        temp: data.temp, instant: data.instant,
      });
      return false;
    }
    if (data.type == "Effect") {
      const id = uuidv4()
      data.effect.id = id;
      data.effect.origin = id;

      logger.info(data);
      canvas["sequencerEffects"].activate();
      if (data.section) {
        if (!data.section.modifiers) {
          data.section = null;
        } else {
          data.section.modifiers = data.section.modifiers?.filter(m => !["atLocation", "attachTo"].includes(m.type)) ?? []
          const tokens = canvas.tokens.placeables.filter(t => (t.x + t.w > data.x && t.y + t.h > data.y && t.x < data.x && t.y < data.y))
          if (tokens.length == 1) {
            data.section.modifiers.push(_m("attachTo", ["#token:" + tokens[0].document.id]))
          } else {
            data.section.modifiers.push(_m("atLocation", [{ x: data.x, y: data.y }]))
          }
          if (data.section.lightConfig) {
            data.section.lightConfig.x = data.x;
            data.section.lightConfig.y = data.y;
            logger.info(data, data.section.lightConfig)
          }
        }
      }
      //TODO: get rid of section.position. rewrite it with data.x/y
      Director.openEffectEditor({
        data: data.effect, position: data, section: data.section,
        temp: data.temp, instant: data.instant,
        persist: !data.temp
      });
      // Sequencer.EffectManager.play({ data: data.effect, position: data })
      return false;
    }
    return true;
  });
}

export let savedEffects = writable(null);

export async function initStores() {

  savedEffects = settingStore(savedEffects, SETTINGS.SAVED_EFFECTS)

  const HOOKS = [
    "controlToken",
    "updateToken",
    "destroyToken",
    "controlTile",
    "updateTile",
    "destroyTile",
    "controlWall",
    "destroyWall",
    "controlAmbientLight",
    "updateWall",
    "updateAmbientLight",
    "destroyAmbientLight",
  ];

  tokensStore = hookedStore(HOOKS, _ => canvas.tokens.controlled);
  tilesStore = hookedStore(HOOKS, _ => getControlledTiles());
  wallsStore = hookedStore(HOOKS, _ => canvas.walls.controlled);
  lightsStore = hookedStore(HOOKS, _ => canvas.lighting.controlled);

  initCurrentScene();
  initActions();
  await migrateOldTags();
  initGlobalTags();
  initTagColors();
  initSequences();
  initHooks();

  initDropHandler()

  Hooks.on("renderSequencerDatabaseViewer", (_, html) => {
    if (setting(SETTINGS.PATCH_SEQ_DB_DROP)) {
      html[0].querySelectorAll(".database-entry").forEach(e => {
        e.setAttribute("draggable", true);
        e.ondragstart = event => {

          logger.info(e.dataset.id)
          const dragData = {
            type: "Tile",
            texture: { src: e.dataset.id },
            tileSize: 100,
            temp: event.ctrlKey,
            instant: event.altKey,
          };
          event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        }
      })
    }
  })
}
