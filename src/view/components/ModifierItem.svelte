<script>
   import Select from "svelte-select";
   import ArgInput from "crew-components/ArgInput";
   import FaTimes from "svelte-icons/fa/FaTimes.svelte";
   import { modifierSpecs } from "../../modules/Specs.js";
   import { argSpecs } from "crew-components/specs";
   import RemoveButton from "crew-components/RemoveButton";

   export let modifier;
   export let parent;
   export let vars = [];

   const groupByCat = (i) => i.cat;

   import { createEventDispatcher } from "svelte";
   const dispatch = createEventDispatcher();
   let specs = modifierSpecs
      .filter((m) => parent.type == m.group)
      .filter((m) => m.multi || !parent.modifiers.find((mod) => mod.type == m.id));
</script>

<div
   class="ui-border-solid ui-border ui-border-base-300 ui-flex ui-flex-row ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-items-center"
   id={modifier.id}
>
   <div class="ui-flex ui-flex-1 ui-gap-2 ui-flex-row ui-flex-wrap ui-items-center ui-force-md ui-min-h-8">
      <div class="ui-input-group-xs">
         <Select
            isSearchable={true}
            items={specs}
            groupBy={groupByCat}
            optionIdentifier="id"
            labelIdentifier="id"
            on:select={(e) => dispatch("changeType", e.detail)}
            value={modifier.type}
            listAutoWidth={false}
         />
      </div>
      {#if modifier._spec?.args}
         {#each modifier._spec.args as arg, i}
            <ArgInput
               hideSign={false}
               extra={modifier}
               vars={vars.filter((v) => argSpecs.find((s) => s.id == arg.type).var_types?.includes(v.type))}
               label={arg.label}
               variables={true}
               type={arg.type}
               value={modifier.args[i]}
               on:change={(e) => dispatch("changeArg", [i, e.detail])}
               widthAuto={true}
               optional={arg.optional}
               defaultValue={arg.default}
               size="xs"
            />
         {/each}
      {/if}
   </div>

   <div class="ui-flex ui-flex-none ui-btn-group-xs">
      <RemoveButton on:click={(e) => dispatch("delete", modifier)} size="xs" />
   </div>
</div>
