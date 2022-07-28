<script>
   import Select from "svelte-select";
   import ArgInput from "./ArgInput.svelte";
   import FaTimes from "svelte-icons/fa/FaTimes.svelte";
   import { modifierSpecs, argSpecs } from "../../modules/Specs.js";

   export let modifier;
   export let parent;
   export let vars = [];

   const groupByCat = (i) => i.cat;

   import { createEventDispatcher } from "svelte";
   const dispatch = createEventDispatcher();
</script>

<div class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-my-1">
   <div class="ui-flex ui-flex-1 ui-gap-2 ui-flex-row ui-flex-wrap">
      <Select
         items={modifierSpecs.filter((m) => parent.type == m.group)}
         groupBy={groupByCat}
         optionIdentifier="id"
         labelIdentifier="id"
         on:select={(e) => dispatch("changeType", e.detail)}
         value={modifier.type}
         listAutoWidth={false}
      />
      {#if modifier._spec?.args}
         {#each modifier._spec.args as arg, i}
            <ArgInput
               extra={modifier}
               vars={vars.filter((v) => argSpecs.find((s) => s.id == arg.type).var_types.includes(v.type))}
               label={arg.label}
               variables={true}
               type={arg.type}
               value={modifier.args[i]}
               on:change={(e) => dispatch("changeArg", [i, e.detail])}
               widthAuto={true}
            />
         {/each}
      {/if}
   </div>

   <div class="ui-flex ui-flex-none">
      <button
         class="ui-btn ui-btn-outline ui-btn-error ui-btn-square ui-justify-self-end !ui-p-[8px]"
         on:click={(e) => dispatch("delete", modifier)}
      >
         <FaTimes />
      </button>
   </div>
</div>