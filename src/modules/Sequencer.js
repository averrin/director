import { v4 as uuidv4 } from "uuid";
import { logger, setting } from "crew-components/helpers";
import { SETTINGS, moduleId } from "../constants.js";
import { sectionSpecs, modifierSpecs } from "./Specs.js";
import { argSpecs } from "crew-components/specs";
import { calculateValue } from "./helpers.js"

import { plainToClass, serialize, deserialize, classToPlain } from 'class-transformer';

export class DSequence {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.sections = [];
    this.variables = [];
    this.inScene = false;
    this.version = 1;

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
controlled.forEach(c => c.control({releaseOthers: false}));`;
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
      } else if (val.startsWith("#target")) {
        let ret = `Array.from(game.user.targets)`;
        if (val.endsWith(".first")) {
          ret += '[0]';
        } else if (val.endsWith(".last")) {
          ret += `[${val}.length-1]`;
        }
        val = ret;
      } else if (val.startsWith("#id:")) {
        val = `Director.getPlaceables().find(t => t.id == "${val.slice(4)}" || t.name == "${val.slice(4)}")`;
      } else if (val.startsWith("@")) {
        val = val.slice(1);
      } else if (type == "expression") {
      } else if (type == "code") {
        val = `() => ${val}`;
      } else {
        val = JSON.stringify(val);
      }
    } else if (Array.isArray(val)) {
      if (type == "effectSource") {
        // keep end effect args as array
      } else {
        val = `Tagger.getByTag(${JSON.stringify(val)})[0]`;
      }
    } else if (val != null && typeof val === "object" && "x" in val && "y" in val) {
      val = JSON.stringify(val);
    } else {
      // val = JSON.stringify(val);
    }
    return [val, replace];
  }

  convertToCode() {
    let stage = "beginning";
    let r = `// This macro was created by converting Director's sequence. Correctness of this code isn't guaranteed.\n`;
    r += `// The code isn't indentical to how Director executes sequences, but it should be a good base for modifications.\n`;
    if (this.variables.length > 0) {
      r += `\n//==== Variables (all of them, not only used) ====//\n`;
    }
    for (const v of this.variables) {
      const [val, replace] = this.getCodeForVal(v.name, v.value, v.type);
      if (replace) {
        r += val + "\n";
      } else {
        r += `const ${v.name} = ${val};\n`;
      }
    }

    r += `\n//==== Sequence construction ====//\n`;
    r += `let sequence = new Sequence("${moduleId}")`;
    let i = 0;

    for (const _section of this.sections) {
      const section = Section.fromPlain(_section);
      let isMulti = false;
      let mode;
      let targets;
      for (const m of section.modifiers) {
        if (m.type == "multiply") {
          isMulti = true;
          mode = m.args[1] || section._spec.multiplyMode;
          targets = m.args[0];
        }
      }
      if (isMulti) {
        section.modifiers = section.modifiers.filter(m => m.type != "multiply");
        if (mode) {
          const mod = new Modifier(uuidv4(), mode);
          mod.setType(mode, section.type);
          mod.args[0] = "@_target";
          section.modifiers.push(mod);
        } else {
          section.args[0] = "@_target";
        }
        if (stage == "normal") r += ";";
        r += `\n\nfor (const _target of ${this.getCodeForVal("", targets, "selection")[0]}) {`;
        stage = "in_multi";
      }

      r += `\n// ${stage}`;

      if (stage == "beginning") r += "\n\t";
      if (stage == "in_multi") r += "\n\tsequence = sequence";
      if (stage == "after_multi") {
        r += "\nsequence = sequence";
      }

      const args = section.args.filter(a => a !== undefined && a !== null).map((a, i) => this.getCodeForVal("", a, section._spec?.args[i]?.type)[0]);
      let sectionName = section.type;
      if (stage == "normal") r += "\n\t";
      if (stage == "after_multi") {
        stage = "normal";
      }
      if (section.type == "effect") {
        const name = args[0] || `${this.title}-${i}`;
        r += `.${section.type}()`;
        r += `\n\t\t.origin("${this.id}")`;
        r += `\n\t\t.name(${name})`;
      } else if (section.type == "addSequence") {
        r += `/* .${section.type}() */ // please combine sequences by yourself`;
      } else {
        if (section._spec && "toCode" in section._spec) {
          r += section._spec.toCode(args);
        } else {
          r += `.${sectionName}(${args.join(", ")})`;
        }
      }

      for (const m of section.modifiers) {
        const args = [];
        const pre_args = m.args?.filter(a => a !== undefined && a !== null).map((a, i) => this.getCodeForVal("", a, m._spec?.args[i]?.type)[0]);
        let n = 0;
        const options = {};
        for (const a of pre_args) {
          const spec = m._spec?.args[n];
          if (spec?.option) {
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
        r += `\n\t\t.${m.type}(${args.join(", ")})`;
      }

      if (isMulti) {
        r += `;\n}\n`
        stage = "after_multi";
      }

      if (stage == "beginning" && i == 0) {
        stage = "normal";
      }
      i++;
    }
    if (stage != "in_multi" && stage != "after_multi") r += ";";
    r += `\nsequence.play();`
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
      if (!obj._spec.args) {
        n++;
        result.push(undefined);
        continue;
      }
      const spec = obj._spec.args[n];
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
      const _seq = [...seq]
      seq = [];
      for (const section of _seq) {
        let isMulti = false;
        let targets;
        let mode;
        for (const m of section.modifiers) {
          if (m.type == "multiply") {
            isMulti = true;
            targets = await calculateValue(m.args[0], "selection");
            mode = m.args[1] || section._spec.multiplyMode;
          }
        }
        if (!isMulti) {
          seq.push(section);
        } else {
          for (const target of targets) {
            const ns = Section.fromPlain(section);
            ns.id = uuidv4();
            ns.modifiers = ns.modifiers.filter(m => m.type != "multiply");
            if (mode == "self") {
              ns.args[0] = target;
            } else {
              const mod = new Modifier(uuidv4(), mode);
              mod.setType(mode, section.type);
              mod.args[0] = target;
              ns.modifiers.push(mod);
            }
            seq.push(ns);
          }
        }
      }
      for (const section of seq) {
        if (this.onlySection != undefined && section.id != this.onlySection) continue;
        if (section.args[1] == "") section.args[1] = null;
        let args = await this.makeArgs(section);

        let sectionName = section.type;
        if ("thenDo" in section._spec) {
          sectionName = "thenDo";
          args = [section._spec.thenDo(args)];
        } else if ("addSequence" in section._spec) {
          sectionName = "addSequence";
          args = [section._spec.addSequence(args)];
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
    return classToPlain(this, { excludePrefixes: ["_"] });
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
    this.lazy = false;
    this.version = 1;
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
    const spec = argSpecs.find(s => s.id == this.type);
    this.lazy = spec?.options?.find(v => v.value == value)?.lazy || spec?.lazy;
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
    this.version = 1;
  }

  setType(type) {
    this.args = [];
    this.type = type;
    this._spec = sectionSpecs.find(s => s.id == this.type);
    this.modifiers = [];
    if (!this._spec || !this._spec.args) return;
    for (const arg of this._spec?.args) {
      const spec = argSpecs.find(s => s.id == arg.type);
      let value = arg.default === undefined ? spec.default : arg.default;
      if (value === undefined && spec.options) {
        let ops = spec.options;
        if (typeof spec.options === "function") {
          ops = spec.options(value, this);
        }
        if (typeof ops[0] === "object") {
          value = ops[0].value;
        } else {
          value = ops[0];
        }
      }
      if (value === undefined) {
        value = ""
      }
      this.args.push(value);
    }
  }

  static fromPlain(plain) {
    const s = plainToClass(Section, plain);
    s.modifiers = s.modifiers?.map(m => Modifier.fromPlain(m, s.type));
    s._spec = sectionSpecs.find(spec => spec.id == s.type);
    return s;
  }
}

export class Modifier {
  constructor(id, type, args) {
    this.id = id;
    this.sectionType = "";
    this.setType(type)
    this.args = args || [];
    this.version = 1;
  }
  setType(type, sectionType) {
    this._spec = modifierSpecs.filter(s => s.group == sectionType).find(s => s.id == type);
    this.sectionType = sectionType;
    if (this.type == type) return;
    this.type = type;
    this.args = [];
    if (!this._spec || !this._spec.args) return;
    for (const arg of this._spec?.args) {
      const spec = argSpecs.find(s => s.id == arg.type);
      let value = arg.default === undefined ? spec?.default : arg.default;
      if (value === undefined && spec.options) {
        let ops = spec.options;
        if (typeof spec.options === "function") {
          ops = spec.options(value, this);
        }
        if (typeof ops[0] === "object") {
          value = ops[0].value;
        } else {
          value = ops[0];
        }
      }
      if (value === undefined || arg.optional) {
        value = ""
      }
      this.args.push(value);
    }
  }

  static fromPlain(plain, sectionType) {
    const m = plainToClass(Modifier, plain);
    m.setType(m.type, sectionType);
    // this._spec = modifierSpecs.filter(s => s.group == sectionType).find(s => s.id == m.type);
    return m;
  }
}

