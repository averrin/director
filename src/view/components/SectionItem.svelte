<script>
   import { sectionSpecs, modifierSpecs } from "../../modules/Specs.js";
   import { Section, Modifier, DSequence, Variable } from "../../modules/Sequencer.js";
   import { v4 as uuidv4 } from "uuid";

   import { argSpecs } from "crew-components/specs";
   import Select from "svelte-select";
   import ArgInput from "crew-components/ArgInput";
   import IconButton from "crew-components/IconButton";
   import RemoveButton from "crew-components/RemoveButton";
   import CollapseButton from "crew-components/CollapseButton";
   import ModifierItem from "./ModifierItem.svelte";

   import { setContext, tick } from "svelte";

   export let item;
   export let variables = [];
   export let showCopy = true;
   export let showDelete = true;
   export let showPlay = true;
   export let showCollapse = true;
   export let hideSign = false;
   export let isRestricted = false;

   if (isRestricted) {
      setContext("isRestricted", true);
   }

   import { createEventDispatcher } from "svelte";
   const dispatch = createEventDispatcher();

   function updateSequences() {
      dispatch("update", item);
      item.id = uuidv4();
   }

   const groupBy = (i) => i.group;

   function addModifier() {
      const e = new Modifier(uuidv4(), "");
      e.setType(
         modifierSpecs
            .filter((m) => m.group == item.type)
            .filter((m) => m.multi || !item.modifiers.find((mod) => mod.type == m.id || mod._spec.exclude == m.id))[0]
            .id,
         item.type
      );
      item.modifiers.push(e);
      updateSequences();
   }

   function copySection() {
      dispatch("copy", item);
   }

   async function playSection() {
      dispatch("play", item);
   }

   function deleteModifier(mod) {
      item.modifiers = item.modifiers.filter((m) => m.id != mod.id);
      updateSequences();
   }

   function deleteSection() {
      dispatch("remove", item);
   }

   function setSectionArg(e, i) {
      item.args[i] = e.detail || "";
      dispatch("update", item);
      updateSequences();
   }

   function setModArg(e, m, i, value) {
      // updateSequences();
      // return;
      // m = item.modifiers.find((mod) => mod.id == m.id);
      if (m.args[i] == value) return;
      logger.info(m, m.args[i], "=>", value);
      if (value != undefined && value != null && typeof value === "object" && !Array.isArray(e.detail)) {
         if (value.value) {
            if (m.args[i] == value.value) return;
            m.args[i] = value.value;
            updateSequences();
         } else {
            // if (JSON.stringify(m.args[i]) == JSON.stringify(value)) {
            //    return;
            // }
            m.args[i] = value;
            updateSequences();
         }
      } else {
         // if (JSON.stringify(m.args[i]) == JSON.stringify(value)) {
         //    logger.info(JSON.stringify(m.args[i]), JSON.stringify(value));
         //    return;
         // }
         m.args[i] = value;
         updateSequences();
      }
   }

   function setModType(e, mod) {
      item.modifiers.find((m) => m.id == mod.id).setType(e.detail.id, item.type);
      updateSequences();
   }
   function setSectionType(e) {
      item.setType(e.detail.id);
      updateSequences();
   }

   function toggleCollapsed() {
      item.collapsed = !item.collapsed;
      updateSequences();
   }

   let specs = sectionSpecs;

   function doShowAddMod() {
      let m = modifierSpecs.filter((m) => item.type == m.group);
      m = m.filter((m) => m.multi || !item.modifiers.find((mod) => mod.type == m.id || mod._spec.exclude == m.id));
      return m.length > 0;
   }
</script>

<div
   id={`${item.id}-${item.type}`}
   class="ui-flex ui-flex-col ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-p-2 ui-gap-2 ui-mb-1"
>
   <div class="ui-flex ui-flex-row ui-justify-start ui-gap-2 ui-items-stretch">
      <div class="ui-flex-1 ui-flex ui-flex-row ui-justify-start ui-gap-2 ui-group ui-group-md">
         <IconButton
            title="move"
            style="color: #46525d"
            icon="fa-solid:arrows-alt"
            cls="handle"
            type="ghost ui-cursor-move"
         />
         <Select
            items={specs}
            {groupBy}
            optionIdentifier="id"
            on:select={(e) => setSectionType(e)}
            value={item.type}
            listAutoWidth={false}
         />
         {#if item._spec?.args}
            {#each item._spec.args as arg, i}
               <ArgInput
                  extra={item}
                  vars={variables.filter((v) => argSpecs.find((s) => s.id == arg.type).var_types.includes(v.type))}
                  label={arg.label}
                  variables={true}
                  type={arg.type}
                  bind:value={item.args[i]}
                  on:change={(e) => setSectionArg(e, i)}
                  {hideSign}
               />
            {/each}
         {/if}
      </div>
      <div class="ui-flex-none ui-btn-group ui-btn-group-md">
         {#if item._spec.collapsible && showCollapse}
            <CollapseButton on:click={(e) => toggleCollapsed()} collapsed={item.collapsed} />
         {/if}

         {#if showCopy}
            <IconButton title="duplicate" on:click={(e) => copySection()} icon="fa-solid:copy" />
         {/if}
         {#if !item._spec.nonPlayable && showPlay}
            <IconButton title="play section" icon="fa-solid:play" on:click={(e) => playSection()} type="primary" />
         {/if}
         {#if showDelete}
            <RemoveButton on:click={(e) => deleteSection()} />
         {/if}
      </div>
   </div>

   {#if !item.collapsed}
      {#if item.modifiers.length > 0}
         <div class="ui-divider ui-m-1 ui-text-base-content">Modifiers</div>
      {/if}
      {#each item.modifiers as modifier (modifier.id)}
         <ModifierItem
            {hideSign}
            {modifier}
            parent={item}
            on:changeType={(e) => setModType(e, modifier)}
            on:changeArg={(e) => setModArg(e, modifier, ...e.detail)}
            on:change={updateSequences}
            on:delete={(e) => deleteModifier(e.detail)}
            vars={variables}
            variables={true}
         />
      {/each}
      {#if doShowAddMod()}
         <div class="ui-p-1">
            <button class="ui-btn ui-btn-outline ui-btn-md ui-btn-primary" on:click={(e) => addModifier()}
               >Add modifier</button
            >
         </div>
      {/if}
   {/if}
</div>
