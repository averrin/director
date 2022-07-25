import { moduleId, SETTINGS } from '../constants.js';
import { addArgSpec, addModifier, addSection, addHook, addAction } from "./Specs.js";
import { sequences } from "./stores.js";
import { DSequence } from "./Sequencer.js";

const API = {
  addArgSpec, addModifier, addSection, addHook, addAction,

  getSequence: async (name, overrides) => {
    let seq;
    sequences.update(seqs => {
      seq = seqs.find(s => s.title == name || s.id == name);
      return seqs;
    });
    if (!seq) {
      logger.error(`Sequence ${name} not found`);
      return null;
    } else {
      const s_seq = await seq.prepare(overrides);
      seq.reset();
      return s_seq;
    }
  },

  listSequences: () => {
    let seq;
    sequences.update(seqs => {
      seq = seqs;
      return seqs;
    });
    return seq;
  },

  findSequence: (name) => {
    let seq;
    sequences.update(seqs => {
      seq = seqs.find(s => s.title == name || s.id == name);
      return seqs;
    });
    return seq;
  },

  playSequence: (name, overrides) => {
    let seq;
    sequences.update(seqs => {
      seq = seqs.find(s => s.title == name || s.id == name);
      return seqs;
    });
    if (!seq) {
      logger.error(`Sequence ${name} not found`);
    } else {
      seq = DSequence.fromPlain(seq);
      return seq.play(overrides);
    }
  },

  getControlled: () => [globalThis.canvas.background.controlled, ...globalThis.canvas.tokens.controlled].flat(),
  getPlaceables: () => [Array.from(globalThis.canvas.scene.tokens.values()), ...Array.from(globalThis.canvas.scene.tiles.values())].flat(),

  clearSceneData: () => {
    globalThis.canvas.scene.update({ "flags.director-hooks": [] });
    globalThis.canvas.scene.update({ "flags.director-actions": [] });
    globalThis.canvas.scene.update({ "flags.director-sequences": [] });
  },

  clearGlobalData: () => {
    globalThis.game.settings.set(moduleId, SETTINGS.SEQUENCES, []);
  },
};

export function initAPI() {
  window.Director = API;
}
