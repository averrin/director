import { v4 as uuidv4 } from "uuid";
import { logger, setting } from "./helpers.js";
import { sectionSpecs, modifierSpecs, SETTINGS, moduleId } from "../constants.js";
import { calculateValue } from "./helpers.js"

import { plainToClass, serialize, deserialize, classToPlain } from 'class-transformer';

export class DSequence {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.sections = [];
    this.variables = [];
    this.inScene = false;

    this.export = {
      vars: [],
      seq: [],
    }
  }

  async prepare(overrides) {
    overrides = overrides || {};
    for (const [name, value] of Object.entries(overrides)) {
      if (value === null) continue;
      const v = this.variables.find(v => v.name == name);
      if (v) {
        v.override(value)
      } else {
        const hd = new Variable(uuidv4(), name, "hookData");
        hd.override(value);
        this.variables.push(hd);
      }
    }
    return await this.constructSeq(this.sections);
  }

  reset() {
    this.onlySection = undefined;
    for (const v of this.variables) {
      v.reset();
    }
    this.export = {
      vars: [],
      seq: [],
    }
  }

  async play(overrides) {
    overrides = overrides || {};
    const sequence = await this.prepare(overrides);
    if (sequence) {
      const p = sequence.play();
      this.reset();
      return p;
    } else {
      this.reset();
      return null;
    }
  }

  getCodeForVal(name, val, type) {
    let replace = false;
    if (typeof val === 'string' || val instanceof String) {
      if (val === "#manual") {
        if (name != "") {
          replace = true;
          val = `const controlled = canvas.tokens.controlled;
let ${name} = await warpgate.crosshairs.show({
  interval: ${setting(SETTINGS.MANUAL_MODE)}
});
${name} = { x: ${name}.x, y: ${name}.y };
controlled.forEach(c => c.control());`;
        } else {
          val = `await warpgate.crosshairs.show({interval: ${setting(SETTINGS.MANUAL_MODE)}})`;
        }
      } else if (val.startsWith("#controlled")) {
        let ret = `canvas.tokens.controlled`;
        if (val.endsWith(".first")) {
          ret += '[0]';
        } else if (val.endsWith(".last")) {
          ret += `[${val}.length-1]`;
        }
        val = ret;
      } else if (val.startsWith("#targets")) {
        ret = `Array.from(game.user.targets)`;
        if (val.endsWith(".first")) {
          ret += '[0]';
        } else if (val.endsWith(".last")) {
          ret += `[${val}.length-1]`;
        }
        val = ret;
      } else if (val.startsWith("@")) {
        val = val.slice(1);
      } else if (type == "expression") {
      } else if (type == "code") {
        val = `() => ${val}`;
      } else {
        val = JSON.stringify(val);
      }
    } else if (Array.isArray(val)) {
      val = `Tagger.getByTag(${JSON.stringify(val)})[0]`;
    } else if (val != null && typeof val === "object" && "x" in val && "y" in val) {
      val = JSON.stringify(val);
    } else {
      // val = JSON.stringify(val);
    }
    return [val, replace];
  }

  convertToCode() {
    let r = `// This macro was created by converting Director's sequence. Correctness of this code isn't guaranteed.\n`;
    r += `// The code isn't indentical to how Director executes sequences, but it should be a good base for modifications.\n`;
    if (this.variables.length > 0) {
      r += `\n//==== Variables (all of them, not only used) ====\n`;
    }
    for (const v of this.variables) {
      const [val, replace] = this.getCodeForVal(v.name, v.value, v.type);
      if (replace) {
        r += val + "\n";
      } else {
        r += `const ${v.name} = ${val};\n`;
      }
    }

    r += `\n//==== Sequence construction ====\n`;
    r += `const sequence = new Sequence("${moduleId}")\n`;
    let i = 0;
    for (const section of this.sections) {
      const args = section.args.map((a, i) => this.getCodeForVal("", a, section.spec.args[i].type)[0]);
      let sectionName = section.type;
      if (section.type == "effect") {
        const name = section.args[0] || `${this.title}-${i}`;
        r += `\t.${section.type}()\n`;
        r += `\t\t.origin("${this.id}")\n`;
        r += `\t\t.name("${name}")\n`;
      } else {
        if (!section.type.startsWith("tm")) {
          r += `\t.${sectionName}(${args.join(", ")})\n`;
        } else {
          if (args[1] == "\"\"") args[1] = null;
          switch (section.type) {
            case "tmAdd":
              const filter = TokenMagic.getPresets().find(p => p.name == args[1].replaceAll('"', ''))?.params;
              r += `\t.thenDo(async () => await TokenMagic.addUpdateFilters(${args[0]}, ${JSON.stringify(filter)}))\n`;
              break;
            case "tmDel":
              r += `\t.thenDo(async () => await TokenMagic.deleteFilters(${args[0]}, ${args[1]}))\n`;
              break
          }
        }
      }

      for (const m of section.modifiers) {
        const args = [];
        const pre_args = m.args.map((a, i) => this.getCodeForVal("", a, m.spec.args[i].type)[0]);
        let n = 0;
        const options = {};
        for (const a of pre_args) {
          const spec = m.spec.args[n];
          if (spec.option) {
            if (typeof a === 'string' || a instanceof String) {
              options[spec.label] = a.replaceAll('"', '');
            }
          } else {
            args.push(a);
          }
          n++;
        }
        if (Object.entries(options).length > 0) {
          args.push(JSON.stringify(options));
        }
        r += `\t\t.${m.type}(${args.join(", ")})\n`;
      }

      i++;
    }
    r += `.play();`
    return r;
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
    let m_files = this.sections.map(s => s.modifiers.find(m => m.type == "file")).filter(m => m);
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
        val = await calculateValue(a, spec.type, this);
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
    try {
      let i = 0;
      for (const section of seq) {
        if (this.onlySection != undefined && section.id != this.onlySection) continue;
        if (section.args[1] == "") section.args[1] = null;
        let args = await this.makeArgs(section);

        let sectionName = section.type;
        if (section.type.startsWith("tm")) {
          sectionName = "thenDo";
          let f;
          let filter;
          let code;
          const AsyncFunction = Object.getPrototypeOf(async function() { }).constructor;
          switch (section.type) {
            case "tmAdd":
              code = 'await TokenMagic.addUpdateFilters(target, filter);'
              filter = TokenMagic.getPresets().find(p => p.name == args[1])?.params;
              break;
            case "tmDel":
              code = 'await TokenMagic.deleteFilters(target, filter);';
              filter = args[1];
              break;
            default:
              break;
          }
          const target = args[0];
          f = new AsyncFunction('target', 'filter', code);
          args = [async () => await f(target, filter)];
        }
        let currentSection = s[sectionName](...args);
        if (section.type == "effect") {
          currentSection = currentSection.origin(this.id);
          const name = args[0] || `${this.title}-${i}`;
          currentSection = currentSection.name(name);
        }
        let currentModifier;
        for (const m of section.modifiers) {
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
          let modName = m.type;
          if (currentModifier) {
            currentModifier = currentModifier[modName](...args);
          } else {
            currentModifier = currentSection[modName](...args);
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
    this.reset();
    return classToPlain(this);
  }
  static fromPlain(plain) {
    if (typeof plain === 'string' || plain instanceof String) {
      plain = JSON.parse(plain);
    }
    const s = plainToClass(DSequence, plain);
    if (s.steps && s.steps.length > 0) { //Migration
      s.sections = s.steps;
      s.steps = undefined;
    }
    s.sections = s.sections?.map(section => Section.fromPlain(section));
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
    this.value = val;
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

  async getValue(seq) {
    if (!this.calcValue) {
      this.calcValue = await calculateValue.bind(this)(this.value, this.type, seq);
    }
    return this.calcValue;
  }
}

export class Section {
  constructor(id, type, args) {
    this.id = id;
    this.modifiers = [];
    this.setType(type)
    this.args = args || [];
    this.collapsed = false;
  }

  setType(type) {
    this.type = type;
    this.spec = sectionSpecs.find(s => s.id == this.type);
    this.args = [];
  }

  static fromPlain(plain) {
    const s = plainToClass(Section, plain);
    s.modifiers = s.modifiers?.map(m => Modifier.fromPlain(m));
    s.spec = sectionSpecs.find(spec => spec.id == s.type);
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

