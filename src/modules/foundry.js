export let foundry;
export let canvas;

export function initFoundry() {
    foundry = globalThis.game;
    canvas = globalThis.canvas;
}
