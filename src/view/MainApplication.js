import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
// import { TJSGameSettings } from "@typhonjs-fvtt/runtime/svelte/store";
import { moduleId, SETTINGS } from "../constants.js";
// import { logger } from "../modules/helpers.js";
import { setting } from "../modules/settings.js";
import { tilesStore, tokensStore, currentScene, initStores, sequences } from "../modules/stores.js";

import MainUI from "./MainUI.svelte";

const API = {};

export default class MainApplication extends SvelteApplication {
  // #gameSettings = new TJSGameSettings();

  #HOOKS = ["controlToken", "updateToken", "controlTile", "updateTile"];

  constructor() {
    super({ widgetId: "selected" });
    for (const hook of this.#HOOKS) {
      globalThis.Hooks.on(hook, this.onSelectionUpdate.bind(this));
    }
    globalThis.Hooks.on("closeMainApplication", () => {
      globalThis.game.settings.set(moduleId, SETTINGS.SHOW, false);
    });

    Hooks.on("canvasInit", () => {
      Hooks.once("renderCombatTracker", this.onSelectionUpdate.bind(this));
    });
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "director",
      width: "600",
      height: "auto",
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
    window.Director = API;

    API.getSequence = (name, overrides) => {
      let seq;
      sequences.update(seqs => {
        seq = seqs.find(s => s.title == name);
        return seqs;
      });
      if (!seq) {
        logger.error(`Sequence ${name} not found`);
        return null;
      } else {
        const s_seq = seq.prepare(overrides);
        return s_seq;
      }
    };

    API.playSequence = (name, overrides) => {
      let seq;
      sequences.update(seqs => {
        seq = seqs.find(s => s.title == name);
        return seqs;
      });
      if (!seq) {
        logger.error(`Sequence ${name} not found`);
      } else {
        return seq.play(overrides);
      }
    };
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
    tilesStore.set(canvas.background.controlled);
    currentScene.set(canvas.scene);
  }
}
