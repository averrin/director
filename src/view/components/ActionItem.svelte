<script>
    import Tags from '../components/Tags.svelte'
    import Select from 'svelte-select';
    import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
    import { moduleId, SETTINGS, actionTypes } from '../../constants.js';

    export let item;

    export let selectAction;
    export let handleSelect;
    export let handleClear;
    export let deleteAction;
    export let execAction;
    export let onTagClick;
    export let actionTags;
    export let autoComplete;
    export let colors;

    const groupBy = (i) => i.group;

    let types = actionTypes;
    if (!globalThis.game.MonksActiveTiles) {
        types = actionTypes.filter(a => a.require != 'matt');
    }
</script>

<div class="flex flex-row bg-white rounded-xl shadow-lg p-2 items-center space-x-2 cursor-move">
    <button class="ui-btn ui-btn-outline ui-btn-error ui-btn-square" on:click={e => deleteAction(e, item.id)}>
        <XIcon class="h-8 w-8"/>
    </button>
    <div class="min-w-[300px]">
        <Tags
            allowPaste={true}
	        allowDrop={true}
	        onlyUnique={true}
            splitWith={","}
            placeholder="Tag"
            {autoComplete}
            minChars=1
            colors={colors}
            onTagClick={onTagClick}
            on:tags={e => actionTags(e, item.id)}
            tags={item.tags}
	    />
	</div>
    <div class="min-w-fit">
	    <Select items={types} {groupBy}
	        value={item.type}
	        on:select={e => handleSelect(e, item.id)}
	        on:clear={e => handleClear(e, item.id)}/>
	</div>
	<button class="ui-btn ui-btn-square ui-btn-outline" on:click={e => selectAction(e, item.id)}>
        <i class="fas fa-expand text-base"></i>
	</button>
	<button class="ui-btn ui-btn-square" on:click={e => execAction(e, item.id)}>
        <i class="fas fa-play text-base"></i>
	</button>
</div>
