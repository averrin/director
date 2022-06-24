import { writable } from 'svelte/store';

export const tokensStore = writable([]);
export const tilesStore = writable([]);
export const currentScene = writable(null);
