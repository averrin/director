import { logger, calculateValueSync } from './helpers.js';
import { hookSpecs, moduleId, SETTINGS } from '../constants.js';

class HookManager {
  #hooks = [];
  #handlers = {};
  #actions = [];

  constructor() {
    Hooks.on("preUpdateActor", (actor, _, updates) => {
      updates.prevHp = actor.data.data.attributes.hp.value;
      updates.prevData = JSON.parse(JSON.stringify(actor.data.data));
      logger.info(updates.prevData);
    });
    Hooks.on("preUpdateToken", (token, _, updates) => {
      updates.prevData = JSON.parse(JSON.stringify(token.data));
      updates.prevPos = token.position;
      updates.prevX = token.data.x;
      updates.prevY = token.data.y;
    });
  }

  getHandler(parent) {
    return (...args) => {
      logger.info(this.#hooks);
      for (const hook of this.#hooks) {
        if (!hook.enabled || !hook.event || !hook.target) continue;
        let targets = calculateValueSync(hook.target);
        if (!targets) return;
        if (!Array.isArray(targets)) targets = [targets];
        const spec = hookSpecs.find(s => s.id == hook.event);
        if (parent == "updateActor") {
          const tokensId = globalThis.canvas.scene.tokens.filter(t => t.actor.id == args[0].id).map(t => t.id);
          for (const target of targets) {
            if ([args[0].id, ...tokensId].includes(target.id) && spec.test(...hook.args, ...args)) {
              hook.call(target, ...args);
            }
          }
        } else if (parent == "updateToken") {
          for (const target of targets) {
            if ([args[0].id].includes(target.id) && spec.test(...hook.args, ...args)) {
              hook.call(target, ...args);
            }
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
      globalThis.Hooks.off(hook, handler);
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
      if (this.#hooks.some(h => h.enabled && hookSpecs.find(s => s.id == h.event)?.parents.includes(hook))) {
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
    }

  }
}
export default HookManager = new HookManager();
