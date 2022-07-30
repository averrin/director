import { plainToClass, serialize, deserialize, classToPlain } from 'class-transformer';
import { calculateValue } from "./helpers.js"
import { actionTypes } from './Specs.js';

export default class Action {
  constructor(id) {
    this.id = id;
    this.type = undefined;
    this.args = [];
    this.value = undefined;
    this.color = undefined;
    this.icon = undefined;
    this.name = "";
    this.hidden = false;
    this.version = 1;
  }

  toJSON() {
    this.type = { ...this.type };
    delete this.type?.execute;
    return classToPlain(this, { excludePrefixes: ["_"] });
  }

  static fromPlain(plain) {
    if (typeof plain === 'string' || plain instanceof String) {
      plain = JSON.parse(plain);
    }
    const a = plainToClass(Action, plain);
    if (a.tags) { //Migration
      a.value = a.tags;
      a.tags = undefined;
    }
    a.type = { ...actionTypes.find(t => t.id == a?.type?.id) };
    if (a?.type?.execute) {
      delete a.type.execute;
    }
    return a;
  }

  async run(event, override, seqVars) {
    const spec = actionTypes.find(t => t.id == this.type.id);
    const value = override || this.value;
    let objects;
    objects = await calculateValue(value, "selection");
    if (!Array.isArray(objects)) objects = [objects];
    if (spec?.execute) {
      if (spec.ignoreTarget) {
        spec.execute(null, this, event, seqVars);
      } else {
        objects.forEach((o) => spec.execute(o, this, event, seqVars));
      }
    } else {
      if (!this.type || !this.type.id) return;
      objects.map(async (o) => {
        const overrides = seqVars || {};
        overrides[this.args[0]?.name || this.args[0]] = o;
        globalThis.Director.playSequence(this.type.id, overrides);
      });
    }
  }
}
