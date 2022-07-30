<script>
   export let seq;

   import { sequences } from "../../modules/stores";
   import { sectionSpecs, modifierSpecs, argSpecs } from "../../modules/Specs.js";
   import { Section, Modifier, DSequence, Variable } from "../../modules/Sequencer.js";
   // import { logger } from "../../modules/helpers.js";
   import { v4 as uuidv4 } from "uuid";
   import Select from "svelte-select";
   import Sortable from "./Sortable.svelte";
   import VariableComponent from "./Variable.svelte";
   import ArgInput from "./ArgInput.svelte";
   import ModifierItem from "./ModifierItem.svelte";

   import FaArrowsAlt from "svelte-icons/fa/FaArrowsAlt.svelte";
   import FaPlay from "svelte-icons/fa/FaPlay.svelte";
   import FaExpandArrowsAlt from "svelte-icons/fa/FaExpandArrowsAlt.svelte";
   import FaCompressArrowsAlt from "svelte-icons/fa/FaCompressArrowsAlt.svelte";
   import FaRegCopy from "svelte-icons/fa/FaRegCopy.svelte";
   import FaTimes from "svelte-icons/fa/FaTimes.svelte";

   const groupBy = (i) => i.group;
   async function stop() {
      seq.stop();
   }
   let preloading = false;
   async function preload() {
      preloading = true;
      await seq.preload();
      preloading = false;
   }

   async function play() {
      updateSequences();
      seq.play();
   }

   function copySection(section) {
      const ns = Section.fromPlain(section);
      ns.id = uuidv4();
      seq.sections.push(ns);
      updateSequences();
   }

   async function playSection(section) {
      updateSequences();
      seq.playSection(section.id);
   }

   async function addSection() {
      const e = new Section(uuidv4(), "wait");
      seq.sections.push(e);
      await updateSequences();
      var objDiv = document.getElementById("sequencer-content");
      objDiv.scrollTop = objDiv.scrollHeight;
   }

   async function updateSequences() {
      sequences.update((seqs) => {
         seq = DSequence.fromPlain(seq);
         const i = seqs.indexOf(seqs.find((s) => s.id == seq.id));
         if (i >= 0) {
            seqs[i] = seq;
         } else {
            seqs.push(seq);
         }
         seq = seqs.find((s) => s.id == seq.id);
         return seqs;
      });
   }

   function addModifier(section) {
      const e = new Modifier(uuidv4(), "");
      e.setType(
         modifierSpecs
            .filter((m) => m.group == section.type)
            .filter((m) => m.multi || !section.modifiers.find((mod) => mod.type == m.id))[0].id,
         section.type
      );
      seq.sections.find((s) => s.id == section.id).modifiers.push(e);
      updateSequences();
   }

   function sortSections(ev) {
      seq.sections = ev.detail;
      updateSequences();
      seq = seq;
   }

   function deleteModifier(section, mod) {
      section.modifiers = section.modifiers.filter((m) => m.id != mod.id);
      updateSequences();
   }

   function deleteSection(section) {
      seq.sections = seq.sections.filter((s) => s.id != section.id);
      updateSequences();
   }

   function deleteVariable(v) {
      seq.variables = seq.variables.filter((s) => s.id != v.detail.id);
      updateSequences();
   }

   function setSectionArg(e, section, i) {
      seq.sections.find((s) => s.id == section.id).args[i] = e.detail || "";
      updateSequences();
   }

   function setModArg(e, m, i, value) {
      if (value != undefined && value != null && typeof value === "object" && !Array.isArray(e.detail)) {
         if (value.value) {
            if (m.args[i] == value.value) return;
            m.args[i] = value.value;
            updateSequences();
         } else {
            if (JSON.stringify(m.args[i]) == JSON.stringify(value)) return;
            m.args[i] = value;
            updateSequences();
         }
      } else {
         if (JSON.stringify(m.args[i]) == JSON.stringify(value)) return;
         m.args[i] = value;
         updateSequences();
      }
      // if (m.args[i] != null && value != undefined) {
      // }
   }

   function setModType(e, section, mod) {
      mod.setType(e.detail.id, section.type);
      updateSequences();
   }
   function setSectionType(e, section) {
      section.setType(e.detail.id);
      updateSequences();
   }

   function updateVariable(v) {
      updateSequences();
   }

   function toggleCollapsed(item) {
      item.collapsed = !item.collapsed;
      updateSequences();
   }

   let specs = sectionSpecs;
</script>

{#if seq}
   {#each seq.variables as variable (variable.id)}
      <VariableComponent {variable} on:remove={deleteVariable} on:change={updateVariable} />
   {/each}

   <div class="ui-overflow-auto ui-max-h-[900px]" id="sequencer-content">
      <Sortable items={seq.sections} let:item let:index on:change={sortSections} options={{ handle: ".handle" }}>
         <div class="ui-flex ui-flex-col ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-gap-2 ui-my-1">
            <div class="ui-flex ui-flex-row ui-justify-start ui-space-x-2">
               <div class="ui-flex-1 ui-flex ui-flex-row ui-justify-start ui-space-x-2">
                  <button
                     class="ui-btn ui-btn-square ui-btn-ghost handle ui-justify-self-start ui-cursor-move"
                     style="color: #46525d; padding: 8px"
                     title="move"
                  >
                     <FaArrowsAlt />
                  </button>
                  <Select
                     items={specs}
                     {groupBy}
                     optionIdentifier="id"
                     on:select={(e) => setSectionType(e, item)}
                     value={item.type}
                     listAutoWidth={false}
                  />
                  {#if item._spec?.args}
                     {#each item._spec.args as arg, i}
                        <ArgInput
                           extra={item}
                           vars={seq.variables.filter((v) =>
                              argSpecs.find((s) => s.id == arg.type).var_types.includes(v.type)
                           )}
                           label={arg.label}
                           variables={true}
                           type={arg.type}
                           bind:value={seq.sections[index].args[i]}
                           on:change={(e) => setSectionArg(e, item, i)}
                        />
                     {/each}
                  {/if}
               </div>
               <div class="ui-flex-none ui-btn-group">
                  {#if item._spec.collapsible}
                     <button
                        title="toggle collapsed"
                        style="padding: 8px"
                        class="ui-btn ui-btn-square ui-justify-self-end"
                        class:ui-btn-outline={!item.collapsed}
                        on:click={(e) => toggleCollapsed(item)}
                     >
                        {#if item.collapsed}
                           <FaExpandArrowsAlt />
                        {:else}
                           <FaCompressArrowsAlt />
                        {/if}
                     </button>
                  {/if}

                  <button
                     title="duplicate"
                     class="ui-btn ui-btn-square ui-p-2 ui-btn-outline ui-m-0"
                     on:click={(e) => copySection(item)}
                  >
                     <FaRegCopy />
                  </button>
                  {#if !item._spec.nonPlayable}
                     <button
                        title="play section"
                        style="padding: 8px"
                        class="ui-btn ui-btn-outline ui-btn-square ui-justify-self-end"
                        on:click={(e) => playSection(item)}
                     >
                        <FaPlay />
                     </button>
                  {/if}
                  <button
                     title="delete section"
                     class="ui-btn ui-btn-outline ui-btn-error ui-btn-square ui-justify-self-end !ui-p-[8px]"
                     on:click={(e) => deleteSection(item)}
                  >
                     <FaTimes />
                  </button>
               </div>
            </div>

            {#if !item.collapsed}
               {#if item.modifiers.length > 0}
                  <div class="ui-divider">Modifiers</div>
               {/if}
               {#each item.modifiers as modifier (modifier.id)}
                  <ModifierItem
                     {modifier}
                     parent={item}
                     on:changeType={(e) => setModType(e, item, modifier)}
                     on:changeArg={(e) => setModArg(e, modifier, ...e.detail)}
                     on:delete={(e) => deleteModifier(item, e.detail)}
                     vars={seq.variables}
                  />
               {/each}
               {#if modifierSpecs.filter((m) => item.type == m.group).length > 0}
                  <div class="ui-p-1">
                     <button class="ui-btn ui-btn-outline ui-btn-primary" on:click={(e) => addModifier(item)}
                        >Add modifier</button
                     >
                  </div>
               {/if}
            {/if}
         </div>
      </Sortable>
   </div>

   <div>
      <button class="ui-my-2 ui-btn ui-btn-outline ui-btn-primary ui-w-full" on:click={(e) => addSection()}
         >Add section</button
      >
   </div>

   <div class="ui-btn-group ui-w-full ui-justify-center">
      <button class="ui-btn ui-btn-outline ui-w-[33%]" class:ui-loading={preloading} on:click={preload}>preload</button>
      <button class="ui-btn ui-btn-error ui-btn-outline ui-w-[33%]" on:click={stop}>stop persists</button>
      <button class="ui-btn ui-w-[33%]" on:click={play}>play</button>
   </div>
{/if}
