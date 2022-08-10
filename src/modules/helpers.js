import { moduleId, SETTINGS, infoColor } from '../constants.js';
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

export let logger = consola.withTag(moduleId);
logger._reporters[0].levelColorMap[3] = infoColor;
export function rgb2hex({ r, g, b, a = 1 }) {
  return {
    hex:
      "#" + [r, g, b, Math.round(a * 255) | 0].reduce((acc, v) => `${acc}${v.toString(16).padStart(2, "0")}`, ""),
  };
}

export function contrastColor(color) {
  if (!color || color == "") return "#eeeeeeff";
  const pRed = 0.299;
  const pGreen = 0.587;
  const pBlue = 0.114;
  const rgb = foundry.utils.hexToRGB(parseInt(color.slice(1).substring(0, 6), 16));

  const contrast = Math.sqrt(pRed * rgb[0] ** 2 + pGreen * rgb[1] ** 2 + pBlue * rgb[2] ** 2);
  return contrast > 0.5 ? "#232323ff" : "#eeeeeeff";
}

export function getControlledTiles() {
  if (game.version < 10) {
    return canvas.background.controlled;
  } else {
    return canvas.tiles.controlled;
  }
}

export function hasFlag(obj, flag) {
  if (game.version < 10) {
    return flag in obj.data.flags;
  } else {
    return flag in obj.flags;
  }
}

export function getFlag(obj, flag) {
  if (game.version < 10) {
    return obj.data.flags[flag];
  } else {
    return obj.flags[flag];
  }
}

let _cachedIcons = {};
export async function getIconNames(collection) {
  if (_cachedIcons[collection]) return _cachedIcons[collection];
  const url = `https://api.iconify.design/collection?prefix=${collection}`
  const res = await fetch(url).then(r => r.json());
  _cachedIcons[collection] = [...res.uncategorized];
  for (const [_, i] of Object.entries(res.categories)) {
    _cachedIcons[collection].push(...i);
  }
  return _cachedIcons[collection];

}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function tintImage(src, tint) {
  tint = _getRGBAArray(tint);

  return new Promise((resolve, reject) => {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    let image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
      let data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 0] || data[i + 1] || data[i + 2] || data[i + 3]) {
          data[i + 0] = tint[0];
          data[i + 1] = tint[1];
          data[i + 2] = tint[2];
          data[i + 3] = tint[3];
        }
      }
      context.putImageData(imgData, 0, 0);
      resolve({ url: canvas.toDataURL(), width: image.width, height: image.height });
    };
    image.onerror = error => reject(src, error);
    image.src = src;

  });
}

function _getRGBAArray(color) {
  // Check input as rgba/rgb color
  let m = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/.exec(color);
  if (m) {
    if (m[4]) return [m[1], m[2], m[3], m[4] * 255];
    return [m[1], m[2], m[3], 255];
  }

  // Check input as hex 6-digit color
  m = /^#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/.exec(color);
  if (m) {
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), 255];
  }
}
