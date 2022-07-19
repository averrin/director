export default function initIntegrations() {
  initTokenMagicIntegration();

  Hooks.call("DirectorInitIntegrations");
}

const AsyncFunction = Object.getPrototypeOf(async function() { }).constructor;
function initTokenMagicIntegration() {
  if (!globalThis.TokenMagic) return;
  Hooks.on("DirectorInitIntegrations", () => {
    Director.addSection({
      id: 'tmAdd',
      label: 'Token Magic Add',
      args: [{ type: 'token', label: 'target' }, { type: 'token-magic', label: 'filter' }],
      thenDo: (args) => {
        const code = 'await TokenMagic.addUpdateFilters(target, filter);'
        const filter = TokenMagic.getPresets().find(p => p.name == args[1])?.params;

        const target = args[0];
        const f = new AsyncFunction('target', 'filter', code);
        return async () => await f(target, filter);
      },
      toCode: (args) => {
        if (args.length < 2) return '';
        const filter = TokenMagic.getPresets().find(p => p.name == (args[1] ? args[1].replaceAll('"', '') : ""))?.params;
        return `\t.thenDo(async () => await TokenMagic.addUpdateFilters(${args[0]}, ${JSON.stringify(filter)}))\n`;
      }
    });
    Director.addSection({
      id: 'tmDel',
      label: 'Token Magic Remove',
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
        return `\t.thenDo(async () => await TokenMagic.deleteFilters(${args[0]}, ${args[1]}))\n`;
      }
    });

    Director.addArgSpec({ id: "token-magic", var_types: ["token-magic", "string", "expression"], options: (_) => globalThis.TokenMagic.getPresets().map((p) => p.name), control: "select" });
  });
}
