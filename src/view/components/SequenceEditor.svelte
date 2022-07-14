<script>
   export let seq;

   import { sequences } from "../../modules/stores";
   import { sectionSpecs, modifierSpecs, argSpecs } from "../../constants.js";
   import { Section, Modifier, DSequence, Variable } from "../../modules/Sequencer.js";
   // import { logger } from "../../modules/helpers.js";
   import { v4 as uuidv4 } from "uuid";
   import Select from "svelte-select";
   import Sortable from "./Sortable.svelte";
   import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
   import VariableComponent from "./Variable.svelte";
   import ArgInput from "./ArgInput.svelte";

   import FaArrowsAlt from "svelte-icons/fa/FaArrowsAlt.svelte";
   import FaPlay from "svelte-icons/fa/FaPlay.svelte";
   import FaExpandArrowsAlt from "svelte-icons/fa/FaExpandArrowsAlt.svelte";
   import FaCompressArrowsAlt from "svelte-icons/fa/FaCompressArrowsAlt.svelte";
   import FaRegCopy from "svelte-icons/fa/FaRegCopy.svelte";

   export let onTagClick;

   const groupBy = (i) => i.group;
   const groupByCat = (i) => i.cat;
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
      e.setType(modifierSpecs.filter((m) => m.group == section.type)[0].id, section.type);
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

   function setModArg(e, section, mod, i) {
      const m = seq.sections.find((s) => s.id == section.id).modifiers.find((m) => m.id == mod.id);
      const spec = m.spec.args[i];
      if (e.detail != undefined && e.detail != null && typeof e.detail === "object" && !Array.isArray(e.detail)) {
         if (e.detail.value) {
            if (m.args[i] == e.detail.value) return;
            m.args[i] = e.detail.value;
         } else {
            if (JSON.stringify(m.args[i]) == JSON.stringify(e.detail)) return;
            m.args[i] = e.detail;
         }
      } else {
         if (JSON.stringify(m.args[i]) == JSON.stringify(e.detail)) return;
         m.args[i] = e.detail;
      }
      if (m.args[i] != null && e.detail != undefined) {
         updateSequences();
      }
   }

   function setModType(e, section, mod) {
      seq.sections
         .find((s) => s.id == section.id)
         .modifiers.find((m) => m.id == mod.id)
         .setType(e.detail.id, section.type);
      updateSequences();
   }
   function setSectionType(e, section) {
      seq.sections.find((s) => s.id == section.id).setType(e.detail.id);
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
   if (!globalThis.TokenMagic) {
      specs = sectionSpecs.filter((s) => s.require != "TokenMagic");
   }
</script>

{#if seq}
   {#each seq.variables as variable (variable.id)}
      <VariableComponent {variable} {onTagClick} on:remove={deleteVariable} on:change={updateVariable} />
   {/each}
   <div />

   <div class="ui-overflow-auto ui-max-h-[800px]" id="sequencer-content">
      <Sortable items={seq.sections} let:item let:index on:change={sortSections} options={{ handle: ".handle" }}>
         <div class="ui-flex ui-flex-col ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-gap-2 ui-my-1">
            <div class="ui-flex ui-flex-row ui-justify-start ui-space-x-2">
               <div class="ui-flex-1 ui-flex ui-flex-row ui-justify-start ui-space-x-2">
                  <button
                     class="ui-btn ui-btn-square ui-btn-ghost handle ui-justify-self-start ui-cursor-move"
                     style="color: #46525d; padding: 8px"
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
                  {#if item.spec?.args}
                     {#each item.spec.args as arg, i}
                        <ArgInput
                           vars={seq.variables.filter((v) =>
                              argSpecs.find((s) => s.id == arg.type).var_types.includes(v.type)
                           )}
                           label={arg.label}
                           variables={true}
                           type={arg.type}
                           bind:value={seq.sections[index].args[i]}
                           on:change={(e) => setSectionArg(e, item, i)}
                           {onTagClick}
                        />
                     {/each}
                  {/if}
               </div>
               <div class="ui-flex-none ui-btn-group">
                  <button
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

                  <button class="ui-btn ui-btn-square ui-p-2 ui-btn-outline ui-m-0" on:click={(e) => copySection(item)}>
                     <FaRegCopy />
                  </button>
                  <button
                     style="padding: 8px"
                     class="ui-btn ui-btn-outline ui-btn-square ui-justify-self-end"
                     on:click={(e) => playSection(item)}
                  >
                     <FaPlay />
                  </button>
                  <button
                     class="ui-btn ui-btn-outline ui-btn-error ui-btn-square ui-justify-self-end"
                     on:click={(e) => deleteSection(item)}
                  >
                     <XIcon class="ui-h-8 ui-w-8" />
                  </button>
               </div>
            </div>

            {#if !item.collapsed}
               {#if item.modifiers.length > 0}
                  <div class="ui-divider">Modifiers</div>
               {/if}
               {#each item.modifiers as mod (mod.id)}
                  <div
                     class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-my-1"
                  >
                     <Select
                        items={modifierSpecs.filter((m) => item.type == m.group)}
                        groupBy={groupByCat}
                        optionIdentifier="id"
                        labelIdentifier="id"
                        on:select={(e) => setModType(e, item, mod)}
                        value={mod.type}
                        listAutoWidth={false}
                     />
                     {#if mod.spec?.args}
                        {#each mod.spec.args as arg, i}
                           <ArgInput
                              vars={seq.variables.filter((v) =>
                                 argSpecs.find((s) => s.id == arg.type).var_types.includes(v.type)
                              )}
                              label={arg.label}
                              variables={true}
                              type={arg.type}
                              value={mod.args[i]}
                              on:change={(e) => setModArg(e, seq.sections[index], mod, i)}
                              {onTagClick}
                           />
                        {/each}
                     {/if}

                     <button
                        class="ui-btn ui-btn-outline ui-btn-error ui-btn-square ui-justify-self-end"
                        on:click={(e) => deleteModifier(item, mod)}
                     >
                        <XIcon class="ui-h-8 ui-w-8" />
                     </button>
                  </div>
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
