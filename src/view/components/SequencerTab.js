import { moduleId, SETTINGS } from "../../constants.js";
import { logger, setting } from "../../modules/helpers.js";
import { v4 as uuidv4 } from 'uuid';
import { stepSpecs, modifierSpecs, argSpecs } from "../../constants.js";
// import ScopedEval from "scoped-eval";

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
    this.onlySection = undefined;
    for (const v of this.variables) {
      v.reset();
    }
  }

  async play(overrides) {
    overrides = overrides || {};
    const sequence = await this.prepare(overrides);
    if (sequence) {
      logger.info("\t.play()");
      const p = sequence.play();
      this.reset();
      return p;
    } else {
      this.reset();
      return null;
    }
  }

  async playSection(id) {
    this.onlySection = id;
    const sequence = await this.prepare();
    const p = sequence.play();
    this.reset();
    return p;
  }

  async stop() {
    globalThis.Sequencer.EffectManager.endEffects({ origin: this.id });
  }

  async preload() {
    let m_files = this.steps.map(s => s.modifiers.find(m => m.type == "file")).filter(m => m);
    const files = [];
    for (const f of m_files) {
      files.push((await this.makeArgs(f))[0]);
    }
    logger.info("preloading", files);
    return Promise.all([
      globalThis.Sequencer.Preloader.preloadForClients(files, false),
      globalThis.Sequencer.Preloader.preload(files, true),
    ]);
  }

  async makeArgs(obj) {
    const args = obj.args;
    const result = [];
    const options = {};
    let n = 0;
    for (const a of args) {
      let val;
      if ((typeof a === 'string' || a instanceof String) && a.startsWith('@')) {
        const v = this.variables.find(vr => vr.name === a.slice(1));
        if (v) {
          val = await v.getValue(this);
        }
      }
      const spec = obj.spec.args[n];
      if (val === undefined) {
        val = await Variable.calculateValue(a, spec.type, this);
      }
      if (spec.option) {
        options[spec.label] = val;
      } else {
        result.push(val);
      }
      n++;
    }
    if (Object.entries(options).length > 0) {
      result.push(options);
    }
    return result;
  }

  async constructSeq(seq) {
    const s = new globalThis.Sequence(moduleId);
    logger.info(`new Sequence(${moduleId})`);
    try {
      let i = 0;
      for (const step of seq) {
        if (this.onlySection != undefined && step.id != this.onlySection) continue;
        const args = await this.makeArgs(step);
        let currentStep = s[step.type](...args);
        if (step.type == "effect") {
          logger.info(`\t.${step.type}()`);
          currentStep = currentStep.origin(this.id);
          logger.info(`\t\t.origin("${this.id}")`);
          const name = args[0] || `${this.title}-${i}`;
          currentStep = currentStep.name(name);
          logger.info(`\t\t.name("${name}")`);
        } else {
          logger.info(`\t.${step.type}(${args.join(", ")})`);
        }
        let currentModifier;
        for (const m of step.modifiers) {
          const args = await this.makeArgs(m);
          let argsString = args.map(a => {
            if (a == undefined || a == null) return a;
            if (Object.getPrototypeOf(a) == null || Object.getPrototypeOf(a) === Object.getPrototypeOf({})) {
              return JSON.stringify(a).substring(0, 50);
            } else {
              if (typeof a === 'string' || a instanceof String) {
                return JSON.stringify(a);
              }
              return a;
            }
          });
          argsString = argsString.join(', ');
          logger.info(`\t\t.${m.type}(${argsString})`);
          if (currentModifier) {
            currentModifier = currentModifier[m.type](...args);
          } else {
            currentModifier = currentStep[m.type](...args);
          }
        }
        i++;
      }
    } catch (error) {
      logger.error(error);
      alert(error);
      return null;
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

  static async calculateValue(val, type, seq) {
    if (typeof val === 'string' || val instanceof String) {
      if (val === "#manual") {
        const controlled = globalThis.canvas.tokens.controlled;
        let t = await globalThis.warpgate.crosshairs.show({
          drawIcon: true,
          icon: "modules/director/icons/crosshair.png",
          label: `@${this.name}: position`,
          interval: setting(SETTINGS.MANUAL_MODE)
        });
        t = { x: t.x, y: t.y };
        controlled.forEach(c => c.control());
        return t;
      } else if (val.startsWith("#controlled")) {
        const ret = globalThis.canvas.tokens.controlled;
        if (val.endsWith(".first")) {
          return ret[0];
        } else if (val.endsWith(".last")) {
          return ret[ret.length - 1];
        } else {
          return ret;
        }
      } else if (val.startsWith("#target")) {
        const ret = Array.from(globalThis.game.user.targets);
        if (val.endsWith(".first")) {
          return ret[0];
        } else if (val.endsWith(".last")) {
          return ret[ret.length - 1];
        } else {
          return ret;
        }
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

  async getValue(seq) {
    if (!this.calcValue) {
      this.calcValue = await Variable.calculateValue.bind(this)(this.value, this.type, seq);
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
    this.collapsed = false;
  }

  setType(type) {
    this.type = type;
    this.spec = stepSpecs.find(s => s.id == this.type);
    this.args = [];
  }

  static fromPlain(plain) {
    const s = plainToClass(Step, plain);
    s.modifiers = s.modifiers?.map(m => Modifier.fromPlain(m));
    s.spec = stepSpecs.find(spec => spec.id == s.type);
    return s;
  }
}

export class Modifier {
  constructor(id, type, args) {
    this.id = id;
    this.setType(type)
    this.args = args || [];
  }
  setType(type, sectionType) {
    this.type = type;
    this.spec = modifierSpecs.filter(s => s.group == sectionType).find(s => s.id == this.type);
    this.args = [];
  }

  static fromPlain(plain) {
    const m = plainToClass(Modifier, plain);
    return m;
  }
}
