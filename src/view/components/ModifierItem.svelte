<script>
   import { v4 as uuidv4 } from "uuid";
   import { getContext } from "svelte";
   import Select from "svelte-select";
   import ArgInput from "crew-components/ArgInput";
   import { modifierSpecs } from "../../modules/Specs.js";
   import { argSpecs } from "crew-components/specs";
   import RemoveButton from "crew-components/RemoveButton";

   export let modifier;
   export let parent;
   export let vars = [];
   export let hideSign = false;
   const isRestricted = getContext("isRestricted");

   const groupByCat = (i) => i.cat;

   import { createEventDispatcher } from "svelte";
   import { isPremium } from "crew-components/premium";
   const dispatch = createEventDispatcher();
   let specs = modifierSpecs
      .filter((m) => parent.type == m.group)
      .filter((m) => m.multi || !parent.modifiers.find((mod) => mod.type == m.id));
   if (isRestricted) {
      specs = specs.filter((s) => !s.restricted);
      if (!isPremium()) {
         specs = [...specs];
         specs.filter((s) => s.premium && !s.id?.startsWith(" ")).forEach((s) => (s.id = " 👑 " + s.id));
      }
   }
   function changeType(e) {
      modifier.setType(e.detail, parent.type);
      dispatch("changeType", e.detail);
     modifier.id = uuidv4()
   }
</script>

<div
   class="ui-border-solid ui-border ui-border-base-300 ui-flex ui-flex-row ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-items-center"
   id={`${modifier.id}-${modifier.type}`}
>
   <div class="ui-flex ui-flex-1 ui-gap-2 ui-flex-row ui-flex-wrap ui-items-center ui-force-md ui-min-h-8">
      <div class="ui-input-group-xs">
         <Select
            isSearchable={true}
            items={specs}
            groupBy={groupByCat}
            optionIdentifier="id"
            labelIdentifier="id"
            on:select={changeType}
            value={modifier.type}
            listAutoWidth={false}
         />
      </div>
      {#if isRestricted && modifier._spec.premium && !isPremium()}
         <div class="ui-ml-6 ui-font-bold">This modifier is Patreon-only.</div>
      {:else if modifier._spec?.args}
         {#each modifier._spec.args as arg, i}
            <ArgInput
               {hideSign}
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

   <div class="ui-flex ui-flex-none ui-group-xs ui-gap-2">
      {#if modifier.type != "file"}
         {#if isRestricted && modifier._spec.premium && !isPremium()}
            <ArgInput type="bool" value={false} disabled={true} size="xs" />
         {:else}
            <ArgInput type="bool" bind:value={modifier.enabled} size="xs" on:change={(e) => dispatch("change")} />
         {/if}
         <RemoveButton on:click={(e) => dispatch("delete", modifier)} size="xs" />
      {/if}
   </div>
</div>
