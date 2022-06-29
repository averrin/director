import {moduleId, SETTINGS} from '../constants.js';
import { writable } from 'svelte/store';
import {DSequence} from '../view/components/SequencerTab.js';

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
export function initSequences() {
    sequences.set(JSON.parse(game.settings.get(moduleId, SETTINGS.SEQUENCES)).map(s => DSequence.fromPlain(s)));
    sequences.subscribe(async (seqs) => {
        game.settings.set(moduleId, SETTINGS.SEQUENCES, JSON.stringify(seqs));
    });
}

export function initStores() {
    initGlobalTags();
    initTagColors();
    initSequences();
}
