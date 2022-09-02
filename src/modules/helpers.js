import { setting } from "crew-components/helpers"
import { moduleId, SETTINGS } from "../constants.js"

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
  const found = globalThis.CrashTNT.getActivitiesForActor(token.document.actor.name);
  for (const t of trackers) {
    if (found.filter(f => f.name === t.name)) matched.push(t);
  }
  return matched;
}

export function hasResourceIcons(token) {
  const showRI = game.settings.get(moduleId, SETTINGS.SHOW_RESOURCE_ICONS);
  if (!showRI) return false;
  const data = token.document.flags["resource-icons"];
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

export const tools = {
  toggle: async (o) => await o.update({ hidden: !(o.hidden || o.data?.hidden) }),
  hide: async (o) => await o.update({ hidden: true }),
  show: async (o) => await o.update({ hidden: false }),
  kill: async (o) =>
    await o.actor.update({
      "data.attributes.hp.value": 0,
    }),
  revive: async (o) =>
    await o.actor.update({
      "data.attributes.hp.value": o.actor.getRollData().attributes.hp.max,
    }),
};

export function calculateValueSync(val, type, seq) {
  let varName = this?.name || 'inline';
  if (typeof val === 'string' || val instanceof String) {
    if (val === "#manual") {
      logger.warn("#manual can be handled only by async version of calculateValue");
      return val;
    } else if (val.startsWith("#controlled")) {
      let ret = globalThis.canvas.tokens.controlled;
      ret = [getControlledTiles(), ...ret].flat();
      if (ret.length == 0) {
        throw new Error("Nothing is selected.");
      }
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
      if (ret.length == 0) {
        throw new Error("Nothing is targeted.");
      }
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
      for (const v of seq.variables.filter(v => v.name != varName && v.value != val)) {
        vars[v.name] = v.lazy ? v.calcValue : calculateValueSync(v.value, v.type, seq);
      }
      let code = `'use strict'; try {return ${val}} catch(e) {return false}`;
      const f = new Function(...Object.keys(vars), code)
      return f(...Object.values(vars));
    } else if (type == "code") {
      const AsyncFunction = Object.getPrototypeOf(async function() { }).constructor;
      const vars = { "_tools": tools };
      for (const v of seq.variables) {
        vars[v.name] = v.lazy ? v.calcValue : calculateValueSync(v.value, v.type, seq);
      }
      let code = `'use strict'; try {${val}} catch(e) {}`;
      const f = new AsyncFunction(...Object.keys(vars), code)
      return () => f(...Object.values(vars));
    } else if (type == "sequence") {
      return Director.getSequence(val);
    }
  } else if (Array.isArray(val)) {
    if (type == "effectSource" || type == "hookData") {
      return val;
    } else {
      val = val.map(tag => {
        return new RegExp("^" + tag.replace("{#}", "([1-9]+[0-9]*)") + "$")
      })
      val = globalThis.Tagger.getByTag(val);
      if (type != "selection") {
        if (val.length > 0) val = globalThis.Sequencer.Helpers.random_array_element(val);
      }
    }
  }
  return val;
}

export async function calculateValue(val, type, seq) {
  const varName = this ? this.name : "inline";
  if (typeof val === 'string' || val instanceof String) {
    if (val === "#manual") {
      const controlled = [getControlledTiles(), ...globalThis.canvas.tokens.controlled].flat();
      let t = await globalThis.warpgate.crosshairs.show({
        drawIcon: true,
        icon: "modules/director/icons/crosshair.png",
        label: `@${varName}: position`,
        interval: setting(SETTINGS.MANUAL_MODE)
      });
      t = { x: t.x, y: t.y };
      controlled.forEach(c => c.control());
      return t;
    }
  }
  return calculateValueSync(val, type, seq)
}

export function evalExpression(expr, ...args) {
  let code = `try {return ${expr}} catch(e) {console.error(e); return false}`;
  const f = new Function("...args", code);
  return f(...args)
}

export function rgb2hex({ r, g, b, a = 1 }) {
  return {
    hex:
      "#" + [r, g, b, Math.round(a * 255) | 0].reduce((acc, v) => `${acc}${v.toString(16).padStart(2, "0")}`, ""),
  };
}

export function getControlledTiles() {
  if (game.version < 10) {
    return canvas.background.controlled;
  } else {
    return canvas.tiles.controlled;
  }
}
