import { moduleId, SETTINGS } from "../../constants.js";
import { logger } from "../../modules/helpers.js";
import { v4 as uuidv4 } from 'uuid';
import { stepSpecs, modifierSpecs, argSpecs } from "../../constants.js";

import { classToPlain, plainToClass, serialize, deserialize, Type } from 'class-transformer';

export class DSequence {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.steps = [];
    this.variables = [];
  }
  async prepare(overrides) {
    overrides = overrides || {};
    for (const v of this.variables) {
      if (v.name in overrides) {
        v.override(overrides[v.name]);
      }
    }
    return await this.constructSeq(this.steps);
  }
  reset() {
    for (const v of this.variables) {
      v.reset();
    }
  }

  async play(overrides) {
    overrides = overrides || {};
    const sequence = await this.prepare(overrides);
    const p = sequence.play();
    this.reset();
    return p;
  }

  async makeArgs(args) {
    const result = [];
    for (const a of args) {
      if ((typeof a === 'string' || a instanceof String) && a.startsWith('@')) {
        const v = this.variables.find(vr => vr.name === a.slice(1));
        if (v) {
          result.push(await v.getValue());
          continue;
        }
      }
      result.push(await Variable.calculateValue(a));
    }
    return result;
  }

  async constructSeq(seq) {
    const s = new globalThis.Sequence(moduleId);
    for (const step of seq) {
      const currentStep = s[step.type](...(await this.makeArgs(step.args)));
      let currentModifier;
      for (const m of step.modifiers) {
        const args = await this.makeArgs(m.args);
        logger.info(`.${m.type}(${args})`);
        if (currentModifier) {
          currentModifier = currentModifier[m.type](...args);
        } else {
          currentModifier = currentStep[m.type](...args);
        }
      }
    }
    return s;
  }

  toJSON() {
    return serialize(this);
  }
  static fromPlain(plain) {
    if (typeof plain === 'string' || plain instanceof String) {
      plain = JSON.parse(plain);
    }
    const s = plainToClass(DSequence, plain);
    s.steps = s.steps?.map(step => Step.fromPlain(step));
    s.variables = s.variables?.map(v => Variable.fromPlain(v));
    return s;
  }
}

export class Variable {
  constructor(id, name, type) {
    this.id = id;
    this.name = name;
    this.setType(type);
    this.reset();
  }

  override(val) {
    this.calcValue = val;
  }

  reset() {
    this.calcValue = undefined;
  }

  setType(type) {
    this.type = type;
    this.value = '';
    this.reset();
  }

  setValue(value) {
    this.value = value;
    this.reset();
  }

  static fromPlain(plain) {
    const s = plainToClass(Variable, plain);
    return s;
  }

  static async calculateValue(val) {
    if (typeof val === 'string' || val instanceof String) {
      if (val === "#manual") {
        const controlled = globalThis.canvas.tokens.controlled;
        const t = await globalThis.warpgate.crosshairs.show({ drawIcon: false });
        controlled.forEach(t => t.control());
        return t;
      } else if (val.startsWith("#controlled")) {
        if (val.endsWith(".first")) {
          return globalThis.canvas.tokens.controlled[0];
        } else {
          return globalThis.canvas.tokens.controlled[globalThis.canvas.tokens.controlled.length - 1];
        }
      } else if (val.startsWith("#target")) {
        if (val.endsWith(".first")) {
          return Array.from(globalThis.game.user.targets)[0];
        } else {
          return Array.from(globalThis.game.user.targets)[globalThis.game.user.targets.size - 1];
        }
      }
    }
    return val;
  }

  async getValue() {
    if (!this.calcValue) {
      this.calcValue = await Variable.calculateValue(this.value);
    }
    return this.calcValue;
  }
}

export class Step {
  constructor(id, type, args) {
    this.id = id;
    this.modifiers = [];
    this.setType(type)
    this.args = args || [];
  }

  setType(type) {
    this.type = type;
    this.spec = stepSpecs.find(s => s.id == this.type);
    this.args = [];
  }

  static fromPlain(plain) {
    const s = plainToClass(Step, plain);
    s.modifiers = s.modifiers?.map(m => Modifier.fromPlain(m));
    return s;
  }
}

let lastManual;
export class Modifier {
  constructor(id, type, args) {
    this.id = id;
    this.setType(type)
    this.args = args || [];
  }
  setType(type) {
    this.type = type;
    this.spec = modifierSpecs.find(s => s.id == this.type);
    this.args = [];
  }

  static fromPlain(plain) {
    const s = plainToClass(Modifier, plain);
    return s;
  }
}
