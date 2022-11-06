<script>
   export let seq;

   import { sequences } from "../../modules/stores";
   import { sectionSpecs, modifierSpecs } from "../../modules/Specs.js";
   import { Section, Modifier, DSequence, Variable } from "../../modules/Sequencer.js";
   import { v4 as uuidv4 } from "uuid";
   import Sortable from "./Sortable.svelte";
   import VariableComponent from "./Variable.svelte";
   import SectionItem from "./SectionItem.svelte";

   async function _updateSequences() {
      if (JSON.stringify(seq) == JSON.stringify($sequences.find((s) => s.id == seq.id))) {
         seq = $sequences.find((s) => s.id == seq.id);
         logger.info(seq);
         return;
      }
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
   const updateSequences = foundry.utils.debounce(_updateSequences, 200);

   function sortSections(ev) {
      seq.sections = ev.detail;
      updateSequences();
      seq = seq;
   }

   function updateVariable(v) {
      updateSequences();
   }

   function deleteVariable(v) {
      seq.variables = seq.variables.filter((s) => s.id != v.detail.id);
      updateSequences();
   }

   function copySection(section) {
      const ns = Section.fromPlain(section);
      ns.id = uuidv4();
      seq.sections.push(ns);
      updateSequences();
   }

   function deleteSection(section) {
      seq.sections = seq.sections.filter((s) => s.id != section.id);
   }
</script>

{#if seq}
   {#each seq.variables as variable (variable.id)}
      <VariableComponent {variable} on:remove={deleteVariable} on:change={updateVariable} />
   {/each}

   <div class="ui-h-full" id="sequencer-content">
      <Sortable items={seq.sections} let:item let:index on:change={sortSections} options={{ handle: ".handle" }}>
         <SectionItem
            {item}
            variables={seq.variables}
            on:update={updateSequences}
            on:copy={(e) => copySection(e.detail)}
            on:remove={(e) => deleteSection(e.detail)}
         />
      </Sortable>
   </div>
{/if}
