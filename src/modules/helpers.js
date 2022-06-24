import {moduleId, SETTINGS} from '../constants.js';
import consola from 'consola/src/browser'


export function hasTrackers() {
    const showTracking = game.settings.get(moduleId, SETTINGS.SHOW_TRACKING);
    if (!showTracking) return false;
    return typeof globalThis.CrashTNT !== 'undefined';
}
export function matchTrackers(token) {
    if (!hasTrackers()) return [];
    const trackers = JSON.parse(game.settings.get(moduleId, SETTINGS.TRACKERS));
    if (!trackers) return [];
    const matched = [];
    const found = globalThis.CrashTNT.getActivitiesForActor(token.document.actor.data.name);
    for (const t of trackers) {
        if (found.filter(f => f.name === t.name)) matched.push(t);
    }
    return matched;
}

export function hasResourceIcons(token) {
    const showRI = game.settings.get(moduleId, SETTINGS.SHOW_RESOURCE_ICONS);
    if (!showRI) return false;
    const data = token.document.data.flags["resource-icons"];
    if (!data) return false;
    if (data.icon1.resource !== '') return true;
    if (data.icon2.resource !== '') return true;
    if (data.icon3.resource !== '') return true;
    return false;
}

export function isAlive(token) {
    return globalThis.getProperty(token?.document?.actor.getRollData(), "attributes.hp.value") > 0;
}

export function isLiving(token) {
    return getProperty(token?.document?.actor.getRollData(), "attributes.hp.max") > 0;
}

export let logger = consola.withTag(moduleId);

export function findItems(token, itemsToFind) {
    // logger.info(`find items for: ${token.data.name}`, token, itemsToFind);
    const items = [];
    const i1 = token?.document?.actor?.items.filter(i => itemsToFind.some(itf => itf == i.name || itf == i.id));
    items.push(...i1);
    const containers = token?.document?.actor?.items.filter(i => i.items);
    for (const c of containers) {
        let i2 = c.items.filter(i => itemsToFind.some(itf => itf == i.name || itf == i.id));
        items.push(...i2);
    }
    return items;
}
