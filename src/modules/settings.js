import { moduleId, SETTINGS } from '../constants.js';
import { foundry } from './foundry.js';

export let setting = key => {
    return game.settings.get(moduleId, key);
};

const debouncedReload = debounce(() => window.location.reload(), 100);
export function initSettings(app) {
    game.settings.register(moduleId, SETTINGS.SHOW, {
	    scope: "client",
	    config: false,
	    type: Boolean,
	    default: false,
    });

    game.settings.register(moduleId, SETTINGS.GLOBAL_TAGS, {
	    scope: "world",
	    config: false,
	    type: Array,
	    default: '[]',
    });

    game.settings.register(moduleId, SETTINGS.TAG_COLORS, {
	    scope: "world",
	    config: false,
	    type: Object,
	    default: '{}',
    });
}
