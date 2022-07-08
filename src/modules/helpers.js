import { moduleId, SETTINGS } from '../constants.js';
import consola from 'consola/src/browser'

export let setting = key => {
  return game.settings.get(moduleId, key);
};

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

export function calculateValueSync(val, type, seq) {
  let varName = this?.name || 'inline';
  if (typeof val === 'string' || val instanceof String) {
    if (val === "#manual") {
      logger.warn("#manual can be handled only by async version of calculateValue");
      return val;
    } else if (val.startsWith("#controlled")) {
      let ret = globalThis.canvas.tokens.controlled;
      ret = [globalThis.canvas.background.controlled, ...ret].flat();
      if (val.endsWith(".first")) {
        seq?.export.vars.push(`const ${varName} = Director.getControlled();`);
        return ret[0];
      } else if (val.endsWith(".last")) {
        seq?.export.vars.push(`const ${varName} = Director.getControlled()[Director.getControlled().length - 1];`);
        return ret[ret.length - 1];
      } else if (val.endsWith(".random")) {
        seq?.export.vars.push(`const ${varName} = Sequencer.Helpers.random_array_element(Director.getControlled());`);
        return globalThis.Sequencer.Helpers.random_array_element(ret);
      } else {
        seq?.export.vars.push(`const ${varName} = Director.getControlled();`);
        return ret;
      }
    } else if (val.startsWith("#target")) {
      const ret = Array.from(globalThis.game.user.targets);
      if (val.endsWith(".first")) {
        seq?.export.vars.push(`const ${varName} = Array.from(game.user.targets)[0];`);
        return ret[0];
      } else if (val.endsWith(".last")) {
        seq?.export.vars.push(`const ${varName} = Array.from(game.user.targets)[game.user.targets.size - 1];`);
        return ret[ret.length - 1];
      } else if (val.endsWith(".random")) {
        seq?.export.vars.push(`const ${varName} = Sequencer.Helpers.random_array_element(Array.from(game.user.targets));`);
        return globalThis.Sequencer.Helpers.random_array_element(ret);
      } else {
        seq?.export.vars.push(`const ${varName} = Array.from(game.user.targets);`);
        return ret;
      }
    } else if (val.startsWith("#tokens")) {
      return Array.from(globalThis.canvas.scene.tokens.values());
    } else if (val.startsWith("#tiles")) {
      return Array.from(globalThis.canvas.scene.tiles.values());
    } else if (val.startsWith("#id:")) {
      return globalThis.Director.getPlaceables().find(t => t.id == val.slice(4) || t.name == val.slice(4));
    } else if (type == "expression") {
      const vars = {};
      seq.variables.forEach(v => vars[v.name] = v.calcValue);
      let code = `'use strict'; try {return ${val}} catch(e) {return false}`;
      const f = new Function(...Object.keys(vars), code)
      return f(...Object.values(vars));
    } else if (type == "code") {
      const vars = {};
      seq.variables.forEach(v => vars[v.name] = v.calcValue);
      let code = `'use strict'; try {${val}} catch(e) {}`;
      const f = new Function(...Object.keys(vars), code)
      return () => f(...Object.values(vars));
    }
  } else if (Array.isArray(val)) {
    val = globalThis.Tagger.getByTag(val);
    if (val.length > 0) val = val[0];
  }
  return val;
}

export async function calculateValue(val, type, seq) {
  if (typeof val === 'string' || val instanceof String) {
    if (val === "#manual") {
      const controlled = [globalThis.canvas.background.controlled, ...globalThis.canvas.tokens.controlled].flat();
      let t = await globalThis.warpgate.crosshairs.show({
        drawIcon: true,
        icon: "modules/director/icons/crosshair.png",
        label: `@${this.name}: position`,
        interval: setting(SETTINGS.MANUAL_MODE)
      });
      t = { x: t.x, y: t.y };
      controlled.forEach(c => c.control());
      return t;
    }
  }
  return calculateValueSync(val, type, seq)
}
