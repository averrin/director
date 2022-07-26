import { logger, calculateValueSync, evalExpression } from './helpers.js';
import { moduleId, SETTINGS } from '../constants.js';
import { hookSpecs } from "./Specs.js";

class HookManager {
  #hooks = [];
  #handlers = {};
  #actions = [];
  #counts = {};

  constructor() {
    Hooks.on("preUpdateActor", (actor, _, updates) => {
      updates.prevHp = actor.data.data.attributes.hp.value;
      updates.prevData = { ...actor.getRollData() };
    });
    Hooks.on("preUpdateToken", (token, _, updates) => {
      updates.prevTokenData = { ...token.data };
      updates.prevPos = token.position;
      updates.prevX = token.data.x;
      updates.prevY = token.data.y;
    });
  }

  getHandler(_parent) {
    return (...args) => {
      const parent = _parent;
      for (const hook of this.#hooks) {
        const spec = hookSpecs.find(s => s.id == hook.event);
        if (!spec.parents.includes(parent)) continue;
        if (!hook.enabled || !hook.event || !hook.target) continue;
        let targets = calculateValueSync(hook.target);
        if (!targets) return;
        if (!Array.isArray(targets)) targets = [targets];
        for (const target of targets) {
          if (hook.testTarget(target, ...args) && hook.testCondition(...args)) {
            hook.call(target, ...args);
          }
        }
      }
    }
  }

  getActionHandler(h) {
    return (...args) => {
      for (const a of this.#actions.filter(a => a.value == h.id)) {
        logger.info(`Hook ${h.name} triggers action ${a.id}`, args);
        a.run(new MouseEvent("custom"), args[0], { hookData: args })
      }
    };
  }

  async onSceneChange(scene) {
    for (const [hook, handler] of Object.entries(this.#handlers)) {
      try {
        globalThis.Hooks.off(hook, handler);
      } catch (e) {
        console.warn(e);
      }
      delete this.#handlers[hook]
      logger.info(`Hook: ${hook}#${handler} was uninstalled.`)
      logger.info(this.#handlers);
    }
  }

  async onActionsChange(actions) {
    this.#actions = actions;
    this.updateHandlers();
    for (const a of this.#actions) {
      if (!a.value || Array.isArray(a.value) || typeof a.value === "object" || a.value.startsWith("#")) continue;
      const h = this.#hooks.find(h => a.value == h.id);
      if (!h) continue;
      const hName = h.getHookName();
      if (hName in this.#handlers) continue;
      this.#handlers[hName] = globalThis.Hooks.on(hName, this.getActionHandler(h));
      logger.info(`Hook: ${hName}#${this.#handlers[hName]} was installed.`);
      logger.info(this.#handlers);
    }
  }

  isActionListen(a, hook) {
    if (!a.value || Array.isArray(a.value) || typeof a.value === "object" || a.value.startsWith("#")) return false;
    const h = this.#hooks.find(h => a.value == h.id);
    return hook == h.getHookName();
  }

  updateHandlers() {
    for (const [hook, handler] of Object.entries(this.#handlers)) {
      if (hook.startsWith("#setInterval")) {
        if (this.#hooks.some(h => h.enabled && `${h.event}-${h.args[1]}` == hook)) {
          continue;
        } else {
          try {
            globalThis.Hooks.off(hook, handler);
          } catch (e) {
            console.warn(e);
          }
          delete this.#handlers[hook]
          logger.info(`Hook: ${hook}#${handler} was uninstalled.`)
          logger.info(this.#handlers);
        }
      } else if (this.#hooks.some(h => h.enabled &&
        hookSpecs.find(s => s.id == h.event)?.parents.includes(hook))) {
        continue;
      } else if (this.#actions.some(a => this.isActionListen(a, hook))) {
        continue;
      } else {
        globalThis.Hooks.off(hook, handler);
        delete this.#handlers[hook]
        logger.info(`Hook: ${hook}#${handler} was uninstalled.`)
        logger.info(this.#handlers);
      }
    }
  }

  getIntervalHandler(hook) {
    return (...args) => {
      const interval = evalExpression(hook.args[1])
      setTimeout(() => {
        const spec = hookSpecs.find(s => s.id == hook.event);
        const id = `${spec.id}-${hook.args[1]}`;
        if (id in this.#handlers) {
          if (hook.enabled, spec.test(...hook.args, this.#counts[id] || 0, ...args)) {
            if (id in this.#counts) {
              this.#counts[id]++;
            } else {
              this.#counts[id] = 1;
            }
            logger.info(`Interval hook ${hook.getHookName()} was called: ${this.#counts[id]}`, hook);
            globalThis.Hooks.call(hook.getHookName(), ...hook.args);
          }
          this.#handlers[id]();
        }
      }, interval);
    }
  }

  async onHooksChange(hooks) {
    this.#hooks = hooks;
    this.updateHandlers();
    for (const hook of hooks.filter(h => h.enabled && h)) {
      const spec = hookSpecs.find(s => s.id == hook.event);
      if (!spec) continue;
      for (const parent of spec.parents) {
        if (parent in this.#handlers) continue;
        this.#handlers[parent] = globalThis.Hooks.on(parent, this.getHandler(parent));
        logger.info(`Hook: ${parent}#${this.#handlers[parent]} was installed.`);
        logger.info(this.#handlers);
      }
      if (spec.id == "#setInterval") {
        const id = `${spec.id}-${hook.args[1]}`;
        if (id in this.#handlers) continue;
        this.#handlers[id] = this.getIntervalHandler(hook);
        this.#handlers[id]();
        logger.info(`Hook: ${id}#${this.#handlers[id]} was installed.`);
      }
    }

  }
}
export default HookManager = new HookManager();
