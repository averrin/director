<script>
   import Tags from "../components/Tags.svelte";
   import Select from "svelte-select";
   import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
   import { actionTypes } from "../../constants.js";
   import { tagColors } from "../../modules/stores.js";

   export let item;

   export let selectAction;
   export let handleSelect;
   export let handleClear;
   export let deleteAction;
   export let execAction;
   export let onTagClick;
   export let actionTags;
   export let autoComplete;

   const groupBy = (i) => i.group;

   let types = actionTypes;
   if (!globalThis.game.MonksActiveTiles) {
      types = actionTypes.filter((a) => a.require != "matt");
   }
</script>

<div
   class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-items-center ui-space-x-2 ui-cursor-move"
>
   <button class="ui-btn ui-btn-outline ui-btn-error ui-btn-square" on:click={(e) => deleteAction(e, item.id)}>
      <XIcon class="ui-h-8 ui-w-8" />
   </button>
   <div class="ui-min-w-[300px]">
      <Tags
         allowPaste={true}
         allowDrop={true}
         onlyUnique={true}
         splitWith={","}
         placeholder="Tag"
         {autoComplete}
         minChars="1"
         colors={$tagColors}
         {onTagClick}
         on:tags={(e) => actionTags(e, item.id)}
         tags={item.tags}
      />
   </div>
   <div class="ui-min-w-fit">
      <Select
         items={types}
         {groupBy}
         value={item.type}
         on:select={(e) => handleSelect(e, item.id)}
         on:clear={(e) => handleClear(e, item.id)}
      />
   </div>
   <button class="ui-btn ui-btn-square ui-btn-outline" on:click={(e) => selectAction(e, item.id)}>
      <i class="fas fa-expand ui-text-base" />
   </button>
   <button class="ui-btn ui-btn-square" on:click={(e) => execAction(e, item.id)}>
      <i class="fas fa-play ui-text-base" />
   </button>
</div>
