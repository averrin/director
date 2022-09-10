import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { moduleId, SETTINGS } from "../constants.js";
import { setting } from "../modules/settings.js";
import { tilesStore, wallsStore, tokensStore, currentScene, initStores, sequences, lightsStore } from "../modules/stores.js";
import { DSequence } from "../modules/Sequencer.js";
import initIntegrations from "../modules/Integrations.js";
import { initAPI } from "../modules/API.js";

import MainUI from "./MainUI.svelte";
import { getControlledTiles } from "../modules/helpers.js";

export default class MainApplication extends SvelteApplication {
  // #gameSettings = new TJSGameSettings();

  #HOOKS = [
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

  constructor() {
    super({ widgetId: "selected" });
    for (const hook of this.#HOOKS) {
      globalThis.Hooks.on(hook, this.onSelectionUpdate.bind(this));
    }
    globalThis.Hooks.on("closeMainApplication", () => {
      globalThis.game.settings.set(moduleId, SETTINGS.SHOW, false);
    });

    Hooks.on("canvasInit", () => {
      Hooks.once("renderCombatTracker", this.onSceneUpdate.bind(this));
    });
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "director",
      width: "600",
      height: "800",
      resizable: true,
      minimizable: true,
      zIndex: 95,
      title: "Director",

      svelte: {
        class: MainUI,
        target: document.body,
        props: function() {
          return {};
        },
      },
    });
  }

  start() {
    initStores();
    initAPI();

    initIntegrations();
  }

  toggleCollapsed() {
    Hooks.call("DirectorToggleCollapse");
  }

  toggle() {
    if (setting(SETTINGS.SHOW)) {
      this.hide();
    } else {
      this.show();
    }
  }

  async show() {
    await this.render(true);
    globalThis.game.settings.set(moduleId, SETTINGS.SHOW, true);
  }
  async hide() {
    await this.close(true);
    globalThis.game.settings.set(moduleId, SETTINGS.SHOW, false);
  }

  onSelectionUpdate() {
    tokensStore.set(canvas.tokens.controlled);
    tilesStore.set(getControlledTiles());
    wallsStore.set(canvas.walls.controlled);
    lightsStore.set(canvas.lighting.controlled);
  }
  onSceneUpdate() {
    logger.info("update scene")
    currentScene.set(canvas.scene);
  }
}
