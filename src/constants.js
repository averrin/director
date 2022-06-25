export const moduleId = "director";

// import { foundry } from '../modules/foundry.js';
// import { moduleId, SETTINGS } from '../constants.js';

export const SETTINGS = {
    GLOBAL_TAGS: "global-tags",
    TAG_COLORS: "tag-colors",
    SHOW: "show",
    UI_SCALE: "ui-scale",
    RESOLUTION: "resolution",
};

export const HOOKS = [
    'controlToken',
    'updateToken',
    'updateActor',
    'targetToken',

    'canvasReady',
    'createToken',
    'deleteToken',
    'deleteActor',
    // 'renderTokenActionHUD',
];


export const actionTypes = [
	{value: 'execute', label: 'Execute trigger', group: 'Active Tiles', require: "matt"},
	{value: 'toggle', label: 'Toggle visibility', group: 'Common'},
	{value: 'hide', label: 'Hide', group: 'Common'},
	{value: 'show', label: 'Show', group: 'Common'},
	{value: 'kill', label: 'Kill', group: 'Tokens'},
	{value: 'revive', label: 'Revive', group: 'Tokens'},
];
