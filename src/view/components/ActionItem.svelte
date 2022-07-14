<script>
   import Select from "svelte-select";
   import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
   import { actionTypes, argSpecs } from "../../constants.js";
   import ArgInput from "./ArgInput.svelte";
   import { sequences, hooks } from "../../modules/stores.js";
   import FaBan from "svelte-icons/fa/FaBan.svelte";

   import { createEventDispatcher } from "svelte";

   const dispatch = createEventDispatcher();

   export let item;

   export let selectAction;
   export let deleteAction;
   export let onTagClick;
   export let actionTags;

   const groupBy = (i) => i.group;

   let types = actionTypes;
   if (!globalThis.game.MonksActiveTiles) {
      types = actionTypes.filter((a) => a.require != "matt");
   }
   let vars = {};
   let seqItems = [];
   const unsubscribe = sequences.subscribe((seqs) => {
      vars = {};
      for (const seq of seqs) {
         if (!types.find((t) => t.id == seq.title)) {
            const si = { id: seq.title, label: `Play "${seq.title}"`, group: "Sequence" };
            types.push(si);
            seqItems.push({ id: seq.id, label: seq.title, group: "Sequence" });
         }
         vars[seq.title] = seq.variables.filter((v) => v.type == "position" || v.type == "token");
         vars[seq.title] = [{ name: "none" }, ...vars[seq.title]];
      }
   });
   unsubscribe();

   // if (!item.value && item.type.id in vars) item.value = vars[item.type.id][0];

   function setEffectSource(e) {
      item.args = [e.detail];
      item.valueType = "effectSource";
      dispatch("change", item);
   }
   function setEffectSourceArg(e) {
      if (e.detail) {
         item.args[1] = e.detail;
         if (item.args[0]?.value == "#origin") {
            item.args[1] = e.detail.id;
         }
         item.valueType = "effectSource";
      }
      dispatch("change", item);
   }
   function setVar(e) {
      item.args = [e.detail.name];
      item.valueType = "sequence";
      dispatch("change", item);
   }
   function setType(e) {
      item.type = e.detail;
      if (item.type.id in vars) {
         item.args = [vars[item.type.id][0]];
      } else {
         item.args = [];
      }
      dispatch("change", item);
   }

   let currentHooks;
   const unsubscribe1 = hooks.subscribe((hooks) => {
      currentHooks = [];
      for (const hook of hooks) {
         currentHooks.push({ value: hook.id, label: `Hook: ${hook.name}`, group: "Hooks", enabled: hook.enabled });
      }
   });
   unsubscribe1();

   const hook = currentHooks.find((h) => h.value == item.value);
</script>

<div
   class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-items-center ui-space-x-2 ui-cursor-move ui-my-1"
>
   <div class="ui-flex ui-flex-1 ui-flex-ui ui-flex-row ui-items-center ui-gap-1">
      <button class="ui-btn ui-btn-outline ui-btn-error ui-btn-square" on:click={(e) => deleteAction(e, item.id)}>
         <XIcon class="ui-h-8 ui-w-8" />
      </button>
      <div class="ui-min-w-fit ui-w-full ui-flex-row ui-flex">
         <ArgInput
            hideSign={true}
            type="targets"
            bind:value={item.value}
            on:change={(e) => actionTags(e, item.id)}
            selectFull={true}
            {onTagClick}
            widthAuto={true}
            additionalItems={currentHooks}
         />
         {#if item.valueType == "hook" && hook && !hook?.enabled}
            <div class="ui-flex ui-flex-row ui-items-center ui-text-base ui-h-10" style:color="grey">
               <div class="ui-p-2 ui-w-12"><FaBan /></div>
               <div>hook disabled</div>
            </div>
         {/if}
      </div>
      <div class:ui-input-group={item.type?.id in vars || item.type?.id == "endEffect"} class="ui-justify-end">
         <Select
            items={types}
            optionIdentifier="id"
            labelIdentifier="label"
            {groupBy}
            value={item.type}
            on:select={setType}
            listAutoWidth={false}
         />
         {#if item.type?.id in vars}
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
               value={item.args[0]}
               on:select={setVar}
               listAutoWidth={false}
               isClearable={false}
            />
         {:else if item.type?.id == "endEffect"}
            <Select
               items={argSpecs.find((s) => s.id == "effectSource").options}
               value={item.args[0]}
               on:select={setEffectSource}
               listAutoWidth={false}
               isClearable={false}
            />
            {#if item.args[0]?.value == "#origin"}
               <Select
                  optionIdentifier="id"
                  labelIdentifier="title"
                  on:select={setEffectSourceArg}
                  items={$sequences}
                  value={item.args[1]}
                  listAutoWidth={false}
                  isClearable={false}
               />
            {:else if item.args[0]?.value != "#sceneId"}
               <input
                  on:change={setEffectSourceArg}
                  type="text"
                  bind:value={item.args[1]}
                  class="ui-input ui-input-lg ui-text-base"
               />
            {/if}
         {/if}
      </div>
   </div>
   <div class="ui-btn-group ui-justify-self-end ui-flex-none">
      {#if item.valueType != "hook"}
         <button class="ui-btn ui-btn-square ui-btn-outline" on:click={(e) => selectAction(e, item.id)}>
            <i class="fas fa-expand ui-text-base" />
         </button>
      {/if}
      <button class="ui-btn ui-btn-square" on:click={(e) => item.run(e)}>
         <i class="fas fa-play ui-text-base" />
      </button>
   </div>
</div>
