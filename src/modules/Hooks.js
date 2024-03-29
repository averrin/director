import { plainToClass } from 'class-transformer';
import { logger } from "crew-components/helpers";
import { hookSpecs } from './Specs.js';

export default class Hook {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.enabled = false;
    this.event = undefined;
    this.target = undefined;
    this.args = [];
    this.version = 1;
    this.global = false;
  }

  static fromPlain(plain) {
    if (typeof plain === 'string' || plain instanceof String) {
      plain = JSON.parse(plain);
    }
    const a = plainToClass(Hook, plain);
    return a;
  }

  getHookName() {
    return `DirectorHook[${this.name}]`
  }

  call(...args) {
    const spec = hookSpecs.find(s => s.id == this.event);
    logger.info(`${this.name} [${spec.id}]: triggered for `, args[0]);
    globalThis.Hooks.call(this.getHookName(), ...args);
  }

  testTarget(target, ...args) {
    const spec = hookSpecs.find(s => s.id == this.event);
    return "target" in spec && spec.target(target, ...args);
  }

  testCondition(target, ...args) {
    const spec = hookSpecs.find(s => s.id == this.event);
    return spec.test(target, ...this.args.slice(0, spec?.args?.length || 0), ...args);
  }
}

