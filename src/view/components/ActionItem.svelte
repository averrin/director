<script>
   import Select from "svelte-select";
   import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
   import { actionTypes } from "../../constants.js";
   import ArgInput from "./ArgInput.svelte";
   import { sequences } from "../../modules/stores.js";

   import { createEventDispatcher } from "svelte";

   const dispatch = createEventDispatcher();

   export let item;

   export let selectAction;
   export let deleteAction;
   export let execAction;
   export let onTagClick;
   export let actionTags;

   const groupBy = (i) => i.group;

   let types = actionTypes;
   if (!globalThis.game.MonksActiveTiles) {
      types = actionTypes.filter((a) => a.require != "matt");
   }
   let vars = {};
   const unsubscribe = sequences.subscribe((seqs) => {
      vars = {};
      for (const seq of seqs) {
         if (!types.find((t) => t.id == seq.title)) {
            types.push({ id: seq.title, label: seq.title, group: "Sequence" });
         }
         vars[seq.title] = seq.variables.filter((v) => v.type == "position" || v.type == "token");
      }
   });
   unsubscribe();

   // if (!item.value && item.type.id in vars) item.value = vars[item.type.id][0];

   function setVar(e) {
      item.value = e.detail.name;
      dispatch("change", item);
   }
   function setType(e) {
      item.type = e.detail;
      if (item.type.id in vars) {
         item.value = vars[item.type.id][0];
      } else {
         item.value = undefined;
      }
      dispatch("change", item);
   }
</script>

<div
   class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-items-center ui-space-x-2 ui-cursor-move"
>
   <div class="ui-flex ui-flex-1 ui-flex-ui ui-flex-row ui-items-center ui-gap-1">
      <button class="ui-btn ui-btn-outline ui-btn-error ui-btn-square" on:click={(e) => deleteAction(e, item.id)}>
         <XIcon class="ui-h-8 ui-w-8" />
      </button>
      <div class="ui-min-w-[300px] ui-w-full">
         <ArgInput
            type="targets"
            bind:value={item.tags}
            on:change={(e) => actionTags(e, item.id)}
            selectFull={true}
            {onTagClick}
         />
      </div>
      <div class:ui-input-group={item.type.id in vars}>
         <Select
            items={types}
            optionIdentifier="id"
            labelIdentifier="label"
            {groupBy}
            value={item.type}
            on:select={setType}
            listAutoWidth={false}
         />
         {#if item.type.id in vars}
            <span style="min-width: 3rem !important;">
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ui-h-6 ui-w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
               >
                  <path
                     stroke-linecap="round"
                     stroke-linejoin="round"
                     d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
               </svg>
            </span>
            <Select
               optionIdentifier="name"
               labelIdentifier="name"
               items={vars[item.type.id]}
               value={item.value}
               on:select={setVar}
               listAutoWidth={false}
               isClearable={false}
            />
         {/if}
      </div>
   </div>
   <div class="ui-btn-group ui-justify-self-end ui-flex-none">
      <button class="ui-btn ui-btn-square ui-btn-outline" on:click={(e) => selectAction(e, item.id)}>
         <i class="fas fa-expand ui-text-base" />
      </button>
      <button class="ui-btn ui-btn-square" on:click={(e) => execAction(e, item.id)}>
         <i class="fas fa-play ui-text-base" />
      </button>
   </div>
</div>
