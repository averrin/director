import { capitalize } from "./helpers";

export default function initIntegrations() {
  initActiveTilesIntegration();
  initTokenMagicIntegration();
  initConvenientEffectsIntegration();
  initFxMasterIntegration();

  Hooks.call("DirectorInitIntegrations");
}

const AsyncFunction = Object.getPrototypeOf(async function() { }).constructor;

function initActiveTilesIntegration() {
  if (!globalThis.game.MonksActiveTiles) return;
  Hooks.on("DirectorInitIntegrations", () => {
    Director.addAction(
      {
        id: 'execute',
        label: 'Execute trigger',
        group: 'Active Tiles',
        execute: (object, action, event) => {
          if (object && object.data.flags["monks-active-tiles"]) {
            globalThis.game.MonksActiveTiles.object = { document: object };
            globalThis.game.MonksActiveTiles.manuallyTrigger(event);
          }
        }
      })
  });
}

function initTokenMagicIntegration() {
  if (!globalThis.TokenMagic) return;
  Hooks.on("DirectorInitIntegrations", () => {
    Director.addSection({
      id: 'tmAdd',
      group: "Token Magic",
      label: 'Add Token Magic',
      args: [{ type: 'token', label: 'target' }, { type: 'token-magic', label: 'filter' }],
      thenDo: (args) => {
        const code = 'await TokenMagic.addUpdateFilters(target, filter);'
        const filter = TokenMagic.getPreset(args[1])?.params;

        const target = args[0];
        const f = new AsyncFunction('target', 'filter', code);
        return async () => await f(target, filter);
      },
      toCode: (args) => {
        if (args.length < 2) return '';
        const filter = TokenMagic.getPreset((args[1] ? args[1].replaceAll('"', '') : ""))?.params;
        return `.thenDo(async () => await TokenMagic.addUpdateFilters(${args[0]}, ${JSON.stringify(filter)}))`;
      }
    });
    Director.addSection({
      id: 'tmDel',
      group: "Token Magic",
      label: 'Remove Token Magic',
      args: [{ type: 'token', label: 'target' }, { type: 'token-magic', label: 'filter' }],
      thenDo: (args) => {
        const code = 'await TokenMagic.deleteFilters(target, filter);';
        const filter = args[1];

        const target = args[0];
        const f = new AsyncFunction('target', 'filter', code);
        return async () => await f(target, filter);
      },
      toCode: (args) => {
        if (args.length < 2) return '';
        return `.thenDo(async () => await TokenMagic.deleteFilters(${args[0]}, ${args[1]}))`;
      }
    });

    Director.addArgSpec({ id: "token-magic", var_types: ["token-magic", "string", "expression"], options: (_) => globalThis.TokenMagic.getPresets().map((p) => { return { value: p.name, label: capitalize(p.name) }; }), control: "select" });

    Director.addAction(
      {
        id: 'tmToggle',
        label: 'Toggle Token Magic',
        group: 'Token Magic',
        execute: (object, action, event) => {
          if (!object) return;
          object.getFlag = object.document.getFlag.bind(object.document);
          if (TokenMagic.hasFilterType(object, action.args[0])) {
            TokenMagic.deleteFilters(object, action.args[0]);
          } else {
            const filter = TokenMagic.getPreset(action.args[0]);
            TokenMagic.addUpdateFilters(object, filter);
          }
        }, args: [{ type: 'token-magic', label: 'filter' }]
      });

    Director.addAction(
      {
        id: 'tmAdd',
        label: 'Add Token Magic',
        group: 'Token Magic',
        execute: (object, action, event) => {
          if (!object) return;
          const filter = TokenMagic.getPreset(action.args[0]);
          TokenMagic.addUpdateFilters(object, filter);
        }, args: [{ type: 'token-magic', label: 'filter' }]
      });

    Director.addAction(
      {
        id: 'tmDelete',
        label: 'Remove Token Magic',
        group: 'Token Magic',
        execute: (object, action, event) => {
          if (!object) return;
          TokenMagic.deleteFilters(object, action.args[0]);
        }, args: [{ type: 'token-magic', label: 'filter' }]
      });

  });
}

function initFxMasterIntegration() {
  if (!globalThis.FXMASTER) return;
  Hooks.on("DirectorInitIntegrations", () => {
    Director.addArgSpec(
      { id: 'weather', options: (_) => Object.keys(CONFIG.fxmaster.weather).map((k) => { return { value: k, label: capitalize(k) }; }), control: "select", var_types: ["string", "weather", "expression"] }
    );

    Director.addAction(
      {
        id: 'fxmSetWeather',
        label: 'Set Weather',
        group: 'FxMaster',
        ignoreTarget: true,
        execute: (_, action, event) => {
          Hooks.call("fxmaster.switchWeather", { type: action.args[0], id: "weather", options: {} });
        }, args: [{ type: 'weather', label: 'weather' }]
      });

    Director.addAction(
      {
        id: 'fxmClear',
        label: 'Clear Weather',
        group: 'FxMaster',
        ignoreTarget: true,
        execute: (_, action, event) => {
          canvas.scene.unsetFlag("fxmaster", "effects");
        }, args: []
      });
  });
}

function initConvenientEffectsIntegration() {
  if (!globalThis.game.dfreds || !globalThis.game.dfreds.effectInterface) return;
  Hooks.on("DirectorInitIntegrations", () => {
    Director.addArgSpec(
      { id: 'ce-effect', options: (_) => game.dfreds.effects.all.map(e => { return { value: e.name, label: capitalize(e.name) }; }), control: "select", var_types: ["string", "ce-effect", "expression"] }
    );
    Director.addSection({
      id: 'ceToggle',
      group: "Convenient Effects",
      label: 'Toggle Convenient Effect',
      args: [
        { type: 'token', label: 'target' },
        { type: 'ce-effect', label: 'name' }
      ],
      thenDo: (args) => {
        const code = `game.dfreds.effectInterface.toggleEffect(name, { uuids: [target.actor.uuid] });`;

        const target = args[0];
        const f = new AsyncFunction('target', 'name', code);
        return async () => await f(target, args[1]);
      },
      toCode: (args) => {
        if (args.length < 2) return '';
        return `.thenDo(async () => game.dfreds.effectInterface.toggleEffect(${args[1]}, { uuids: [${args[0]}.actor.uuid] }))`;
      }
    });

    Director.addSection({
      id: 'ceAdd',
      group: "Convenient Effects",
      label: 'Add Convenient Effect',
      args: [
        { type: 'token', label: 'target' },
        { type: 'ce-effect', label: 'name' }
      ],
      thenDo: (args) => {
        const code = `game.dfreds.effectInterface.addEffect({effectName: name, uuid: target.actor.uuid });`;

        const target = args[0];
        const f = new AsyncFunction('target', 'name', code);
        return async () => await f(target, args[1]);
      },
      toCode: (args) => {
        if (args.length < 2) return '';
        return `.thenDo(async () => game.dfreds.effectInterface.addEffect({effectName: ${args[1]}, uuid: ${args[0]}.actor.uuid }))`;
      }
    });

    Director.addSection({
      id: 'ceRemove',
      group: "Convenient Effects",
      label: 'Remove Convenient Effect',
      args: [
        { type: 'token', label: 'target' },
        { type: 'ce-effect', label: 'name' }
      ],
      thenDo: (args) => {
        const code = `game.dfreds.effectInterface.removeEffect({effectName: name, uuid: target.actor.uuid });`;

        const target = args[0];
        const f = new AsyncFunction('target', 'name', code);
        return async () => await f(target, args[1]);
      },
      toCode: (args) => {
        if (args.length < 2) return '';
        return `.thenDo(async () => game.dfreds.effectInterface.removeEffect({effectName: ${args[1]}, uuid: ${args[0]}.actor.uuid }))`;
      }
    });

    Director.addAction(
      {
        id: 'ceToggle',
        label: 'Toggle Convenient Effect',
        group: 'Convenient Effects',
        execute: (object, action, event) => {
          object && game.dfreds.effectInterface.toggleEffect(action.args[0], { uuids: [object.actor.uuid] });
        }, args: [{ type: 'ce-effect', label: 'effect' }]
      });

    Director.addAction(
      {
        id: 'ceAdd',
        label: 'Add Convenient Effect',
        group: 'Convenient Effects',
        execute: (object, action, event) => {
          object && game.dfreds.effectInterface.addEffect({ effectName: action.args[0], uuid: object.actor.uuid });
        },
        args: [{ type: 'ce-effect', label: 'effect' }]
      });

    Director.addAction(
      {
        id: 'ceRemove',
        label: 'Remove Convenient Effect',
        group: 'Convenient Effects',
        execute: (object, action, event) => {
          object && game.dfreds.effectInterface.removeEffect({ effectName: action.args[0], uuid: object.actor.uuid });
        }, args: [{ type: 'ce-effect', label: 'effect' }]
      });


    Director.addHook(
      {
        id: "#onCeAdd",
        name: "On Add Convenient Effect",
        parents: ["createActiveEffect"],
        target: (target, ...args) => {
          return target.actor.id == args[0].parent.id;
        },
        test: (target, effect, ...args) => {
          return args[0].data.label == effect;
        }, args: [{ type: "ce-effect", label: "effect" }]
      });

    Director.addHook(
      {
        id: "#onCeDelete",
        name: "On Remove Convenient Effect",
        parents: ["deleteActiveEffect"],
        target: (target, ...args) => {
          return target.actor.id == args[0].parent.id;
        },
        test: (target, effect, ...args) => {
          return args[0].data.label == effect;
        }, args: [{ type: "ce-effect", label: "effect" }]
      });
  });
}
