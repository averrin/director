import { plainToClass, serialize, deserialize } from 'class-transformer';
import { calculateValue } from "./helpers.js"

export default class Action {
  constructor(id) {
    this.id = id;
    this.type = undefined;
    this.args = [];
    this.value = undefined;
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
    return a;
  }

  async run(event, override, seqVars) {
    const value = override || this.value;
    let objects;
    objects = await calculateValue(value, "selection");
    if (!Array.isArray(objects)) objects = [objects];
    switch (this.type?.id) {
      case "toggle":
        objects.map((o) => o.document || o).forEach((o) => o.update({ hidden: !o.data.hidden }));
        break;
      case "hide":
        objects.map((o) => o.document || o).forEach((o) => o.update({ hidden: true }));
        break;
      case "show":
        objects.map((o) => o.document || o).forEach((o) => o.update({ hidden: false }));
        break;
      case "kill":
        objects.map((o) => o.document || o).forEach((o) =>
          o.actor.update({
            "data.attributes.hp.value": 0,
          })
        );
        break;
      case "revive":
        objects.map((o) => o.document || o).forEach((o) =>
          o.actor.update({
            "data.attributes.hp.value": o.actor.data.data.attributes.hp.max,
          })
        );
        break;
      case "execute":
        objects.forEach((o) => {
          if (o.data.flags["monks-active-tiles"]) {
            globalThis.game.MonksActiveTiles.object = { document: o };
            globalThis.game.MonksActiveTiles.manuallyTrigger(event);
          }
        });
        break;
      default:
        if (!this.type || !this.type.id) return;
        if (this.type.id == "endEffect") {
          if (this.args[0].value == "#sceneId") {
            globalThis.Sequencer.EffectManager.endEffects();
          } else if (this.args[0].value == "#origin") {
            globalThis.Sequencer.EffectManager.endEffects({ origin: this.args[1].id });
          } else if (this.args.length >= 2) {
            const f = {};
            f[this.args[0].value.slice(1)] = this.args[1];
            globalThis.Sequencer.EffectManager.endEffects(f);
          }
        } else {
          objects.map(async (o) => {
            const overrides = seqVars || {};
            overrides[this.args[0]?.name || this.args[0]] = o;
            globalThis.Director.playSequence(this.type.id, overrides);
          });
        }
    }
  }
}
