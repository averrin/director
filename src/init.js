import MainApplication from './view/MainApplication.js';
import 'reflect-metadata';

import { moduleId, SETTINGS } from "./constants.js";
import { initSettings, migrateFromString, setting } from "./modules/settings.js";
import { logger } from "./modules/helpers.js";
import { initFoundry } from './modules/foundry.js';


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
