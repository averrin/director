import MainApplication from './view/MainApplication.js';
import 'reflect-metadata';

import { moduleId, SETTINGS, infoColor } from "./constants.js";
import { initSettings, migrateFromString, setting } from "./modules/settings.js";
import { logger } from "crew-components/helpers";
import { initFoundry } from './modules/foundry.js';
import initHelpers from "crew-components/helpers";
initHelpers(moduleId, infoColor, SETTINGS);
import HelpActions from "./view/help/HelpActions.html?raw"
// console.log(HelpActions)


const app = new MainApplication();

Hooks.once('init', async () => {
  initFoundry();
  initSettings(app);

  game.keybindings.register(moduleId, SETTINGS.KEY_SHOW, {
    name: 'Show Director',
    editable: [{ key: 'KeyD', modifiers: [KeyboardManager.MODIFIER_KEYS.ALT] }],
    namespace: 'Director',
    onDown: () => {
      app.toggle();
    }
  });

  game.keybindings.register(moduleId, SETTINGS.KEY_COLLAPSE, {
    name: 'Toggle collapsed UI',
    editable: [{ key: 'KeyC', modifiers: [KeyboardManager.MODIFIER_KEYS.ALT] }],
    namespace: 'Director',
    onDown: () => {
      app.toggleCollapsed();
    }
  });

  if (game.modules.get("alpha-suit")?.active) {
    AlphaSuit.addTool({
      name: "alpha-director",
      title: "Toggle Director",
      icon: "twemoji:clapper-board",
      onClick: () => {
        app.toggle();
      },
    })

    AlphaSuit.addHelp({
      id: "h-director",
      name: "Director",
      icon: "twemoji:clapper-board",
      content: [
        {
          id: "director-actions",
          name: "Actions",
          icon: "fa-solid:play",
          content: HelpActions
        },
        {
          id: "director-hooks",
          name: "Hooks",
          icon: "openmoji:hook",
          content: HelpActions
        },
        {
          id: "director-selection",
          name: "Selection",
          icon: "carbon:select-window",
          content: HelpActions
        },
        {
          id: "director-sequencer",
          name: "Sequencer",
          icon: "fa-solid:film",
          content: HelpActions
        },
        {
          id: "director-import",
          name: "Import",
          icon: "bxs:file-import",
          content: HelpActions
        },
      ]
    })
  }
});

Hooks.on('getSceneControlButtons', (buttons) => {
  if (game.user.isGM) {
    const tokenButton = buttons.find(b => b.name == "tiles");
    if (tokenButton) {
      tokenButton.tools.push({
        name: "director",
        title: "Toggle Director",
        icon: "fas director-icon",
        visible: game.user.isGM,
        onClick: () => {
          app.toggle();
        },
        button: true
      });
    }
  }
});

Hooks.once('sequencerReady', async () => {
  if (game.user.isGM) {
    await migrateFromString(SETTINGS.GLOBAL_TAGS);
    await migrateFromString(SETTINGS.SEQUENCES);
    await migrateFromString(SETTINGS.TAG_COLORS);

    await app.start();
    if (setting(SETTINGS.SHOW)) app.show();

    logger.info("Started!")
  }
});
