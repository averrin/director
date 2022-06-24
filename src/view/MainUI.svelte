<script>
    export let elementRoot;
    import '../styles/main.scss';
    import { v4 as uuidv4 } from 'uuid';

    import { PlusIcon } from "@rgossiaux/svelte-heroicons/solid";

    //import TagManager from './components/TagManager.svelte';

    import {logger} from '../modules/helpers.js';
    import {moduleId, SETTINGS} from '../constants.js';
    import { ApplicationShell }   from '@typhonjs-fvtt/runtime/svelte/component/core';
    import Tags from './components/Tags.svelte'
    import ActionItem from './components/ActionItem.svelte'
    import { onDestroy } from 'svelte';

    import {HsvPicker} from 'svelte-color-picker';

    import {tilesStore, tokensStore, currentScene}          from '../modules/stores.js';


    let actions;
    let globalTags = JSON.parse(game.settings.get(moduleId, SETTINGS.GLOBAL_TAGS));
    function onTags(event) {
        const tags = event.detail.tags.filter(t => t.trim() != "");
        game.settings.set(moduleId, SETTINGS.GLOBAL_TAGS, JSON.stringify(tags));
        globalTags = tags;
    }

    function onTagsSelected(event, i) {
        const tags = event.detail.tags.filter(t => t.trim() != "");
        if (i != -1) {
            Tagger.setTags(selection[i], tags);
        } else {
            const add = tags.filter(t => !tagsMutualOld.includes(t));
            const remove = tagsMutualOld.filter(t => !tags.includes(t));
            if(add.length > 0) selection.forEach(tile => Tagger.addTags(tile, add));
            if(remove.length > 0) selection.forEach(tile => Tagger.removeTags(tile, remove));
            tagsMutualOld = [...tagsMutual];
        }
    }

    let colors = JSON.parse(game.settings.get(moduleId, SETTINGS.TAG_COLORS));

    let tagsSelected;
    let tagsMutual;
    let tagsMutualOld;
    let selection;
    let tiles = [];
    let tokens = [];

    function updateMutual() {
        tagsSelected = selection.map(t => Tagger.getTags(t).filter(t => t.trim() != ""));
        tagsMutual = [];
        for (let a of tagsSelected) {
            for (let t of a) {
                if (!tagsMutual.includes(t) && tagsSelected.every(tags => tags.includes(t)))
                    tagsMutual.push(t);
            }
        }
        tagsMutualOld = [...tagsMutual];
    }

    const unsubscribe = tilesStore.subscribe(value => {
        tiles = value;
        selection = [...tiles, ...tokens];
        updateMutual();
    });
    onDestroy(unsubscribe);

    const unsubscribe2 = tokensStore.subscribe(value => {
        tokens = value;
        selection = [...tiles, ...tokens];
        updateMutual();
    });
    onDestroy(unsubscribe2);

    let savedActions;
    const unsubscribe3 = currentScene.subscribe(scene => {
        savedActions = scene.data.flags["director-actions"].filter(a => a);
        actions = savedActions ? savedActions : [{id: uuidv4(), tags: [], type: ''}];
    });
    onDestroy(unsubscribe3);


	let pickerOpen = false;
	
	let editTag;
	$: debounce(game.settings.set(moduleId, SETTINGS.TAG_COLORS, JSON.stringify(colors)), 500);
	function onTagClick(e, tag) {
	    editTag = tag;
        pickerOpen = !pickerOpen;
	}
	function applyColor() {
	    if (pickerOpen) {
            pickerOpen = false;
	    }
	}

    function rgb2hex({ r, g, b, a = 1 }) {
        return {
            hex: '#' +
                [r, g, b, Math.round(a * 255) | 0].reduce((acc, v) => `${acc}${v.toString(16).padStart(2, '0')}`, '')
        };
    }
	function changeColor(e) {
	    const c = e.detail;
	    colors[editTag] = rgb2hex(c).hex;
	    colors = colors;
	}
	async function deleteAction(_, id) {
	    actions = actions.filter(a => a.id !== id);
        await canvas.scene.update({'flags.director-actions': actions});
	}

	function selectByTags(tags) {
	    canvas.tokens.releaseAll();
	    canvas.background.releaseAll();
        const objects = Tagger.getByTag(tags);
        for (const doc of objects) {
            canvas.tokens.ownedTokens.find(t => t.document.id == doc.id)?.control({releaseOthers: false});
            canvas.background.placeables.find(t => t.document.id == doc.id)?.control({releaseOthers: false});
        }
        if (canvas.tokens.controlled.length > 0) {
            mode = 'selection';
        }
	}


	function selectAction(_, id) {
        const action = actions.find(a => a.id === id)
	    selectByTags(action.tags);
	}

	function execAction(event, id) {
        const action = actions.find(a => a.id === id)
        const objects = Tagger.getByTag(action.tags);
        switch (action.type) {
            case 'toggle':
                objects.forEach(o => o.update({hidden: !o.data.hidden}));
            break;
            case 'hide':
                objects.forEach(o => o.update({hidden: true}));
            break;
            case 'show':
                objects.forEach(o => o.update({hidden: false}));
            break;
            case 'kill':
                objects.forEach(o => o.actor.update({
                    "data.attributes.hp.value": 0,
                }));
            break;
            case 'revive':
                objects.forEach(o => o.actor.update({
                    "data.attributes.hp.value": o.actor.data.data.attributes.hp.max,
                }));
            break;
            case 'execute':
                objects.forEach(o => {
                    globalThis.game.MonksActiveTiles.object = {document: o};
                    globalThis.game.MonksActiveTiles.manuallyTrigger(event);
                });
            break;
        }
        logger.info(action);
	}
	async function actionTags(event, id) {
        const tags = event.detail.tags.filter(t => t.trim() != "");
        const action = actions.find(a => a.id === id)
        action.tags = tags;
        await canvas.scene.update({'flags.director-actions': actions});
        logger.info(event, id);
	}

	function handleSelect(event, id) {
        const type = event.detail.value;
        const action = actions.find(a => a.id === id)
        action.type = type;
        canvas.scene.update({'flags.director-actions': actions});
        logger.info(event, id);
	}
	function handleClear(event, id) {
        const action = actions.find(a => a.id === id)
        action.type = '';
        canvas.scene.update({'flags.director-actions': actions});
        logger.info(event, id);
	}

    logger.info("Fetched actions from scene", savedActions);
    function addAction(tags) {
        actions = [{id: uuidv4(), tags: tags || [], type: ''}, ...actions]
    }

    function editObject(_, object) {
        object.document.sheet.render(true);
    }
    function createAction(_, i) {
        mode = "actions";
        if (i >= 0) {
            addAction(tagsSelected[i]);
        } else {
            addAction(tagsMutual);
        }
    }

    import SortableList from 'svelte-sortable-list';
    const sortActions = ev => {
        let sorted = ev.detail.filter(a => a);
        if (sorted.length == actions.length) {
            actions = sorted;
            canvas.scene.update({'flags.director-actions': actions});
        }
    };

    let mode = "actions";

    $: {
        actions = actions.filter(a => a);
    }

    let startColor = editTag && editTag in colors ? colors[editTag] : '#232323';
</script>


<svelte:options accessors={true}/>

<input type="checkbox" id="color-modal" class="modal-toggle" bind:checked={pickerOpen}/>
<label for="color-modal" class="modal cursor-pointer">
  <label class="modal-box relative w-fit" for="">
    <HsvPicker on:colorChange={changeColor} {startColor}/>
  </label>
</label>

<ApplicationShell bind:elementRoot>
    <main class="director-ui">
    <div class="drawer drawer-mobile">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
            <div class="navbar bg-base-100">
                <Tags
                    allowPaste={true}
	                allowDrop={true}
	                onlyUnique={true}
                    splitWith={","}
                    placeholder="Tag"

                    on:tags={onTags}
                    tags={globalTags}
                    colors={colors}
                    onTagClick={onTagClick}
	            />
            </div>

        {#if mode == "selection"}
            {#if selection.length > 1}
            <div class="navbar bg-base-100 space-4">
                <div class="flex-1 space-4 mr-1">
                    <a class="btn btn-ghost normal-case text-xl no-animation">Mutual tags</a>
                    <div class="w-full">
                        <Tags
                            allowPaste={true}
	                        allowDrop={true}
	                        onlyUnique={true}
                            splitWith={","}
                            placeholder="Tag"
                            autoComplete={globalTags}
                            minChars=1
                            on:tags={(e) => globalThis.debounce(onTagsSelected(e, -1), 100)}
                            tags={tagsMutual}
                            colors={colors}
                            onTagClick={onTagClick}
	                    />
	                </div>
	            </div>
                <div class="flex-none">
	                <button class="btn-square btn btn-primary" on:click={e => createAction(e, -1)}>
	                    <PlusIcon/>
	                </button>
	            </div>
	        </div>
            {/if}

        <div class="overflow-auto max-h-[600px]">
            <div class="flex flex-col p-3 space-y-3 justify-stretch">
                {#if selection.length == 0}
                    <div class="justify-self-center p-2">
                        <h3>Selection is empty</h3>
                    </div>
                {/if}
                {#each selection as tile, i}
                        <div class="card card-side bg-base-100 shadow-xl">
                          <figure><img class="h-[170px]" style="border: none;" src="{tile.data.img}" alt="Movie"></figure>
                          <div class="card-body">
                            <h2 class="card-title">
                                {#if !tile.data.name}
                                    Tile: {tile.id}
                                    {#if tile.data.flags['monks-active-tiles']?.actions?.length > 0}
                                        <span class="badge badge-primary">MATT</span>
                                    {/if}
                                {:else}
                                    Token: {tile.data.name}
                                {/if}
                            {#if true}
                                <span class="badge">{tile.data.width}x{tile.data.height}</span>
                            {/if}
                            <span class="badge"
                                class:badge-ghost={tile.data.hidden}
                                class:badge-success={!tile.data.hidden}
                                on:click={() => tile.document.update({hidden: !tile.data.hidden})}
                            >
                                {tile.data.hidden ? 'hidden' : 'visible'}
                            </span>
                            </h2>

                            <p>
                                <Tags
                                    allowPaste={true}
	                                allowDrop={true}
	                                onlyUnique={true}
                                    splitWith={","}
                                    placeholder="Tag"
                                    autoComplete={globalTags}
                                    minChars=1
                                    on:tags={(e) => onTagsSelected(e, i)}
                                    tags={tagsSelected[i]}
                                    colors={colors}
                                    onTagClick={onTagClick}
	                            />
	                        </p>
                            
                            <div class="card-actions justify-end flex-row">
	                            <button class="w-40 btn" on:click={e => editObject(e, tile)}>Edit</button>
	                            <button class="w-40 btn btn-outline btn-warning" on:click={e => tile.release()}>Deselect</button>
	                            <button class="w-40 btn btn-primary" on:click={e => createAction(e, i)}>Create action</button>
                            </div>
                          </div>
                        </div>
	            {/each}
	        </div>
	    </div>
        {/if}
        {#if mode == "actions"}
        <div class="flex flex-col p-1">
            <div>
                <button class="btn btn-outline btn-primary" on:click={e => addAction()}>Add action</button>
            </div>
            <div>
                <SortableList 
                    list={actions} 
                    key="id"
                    let:item
                    on:sort={sortActions}
                >
                    <ActionItem
                        {item}
                        {selectAction}
                        {handleSelect}
                        {handleClear}
                        {deleteAction}
                        {execAction}
                        {onTagClick}
                        {actionTags}
                        {colors}
                        autoComplete={globalTags}
                    />
                </SortableList>
            </div>
          </div> 
        {/if}
      
      </div> 
      <div class="drawer-side">
        <label for="my-drawer-2" class="drawer-overlay"></label> 
        <ul class="menu p-4 overflow-y-auto w-48 bg-base-100 text-base-content">
          <li><a class:active={mode == "actions"} on:click={() => mode = "actions"}>Actions</a></li>
          <li><a class:active={mode == "selection"} on:click={() => mode = "selection"}>Selection</a></li>
        </ul>
      </div>
    </div>
   </main>
</ApplicationShell>
