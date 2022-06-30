<script>
   export let seq;

   import { sequences } from "../../modules/stores";
   import { stepSpecs, modifierSpecs, argSpecs } from "../../constants.js";
   import { Step, Modifier, DSequence, Variable } from "./SequencerTab.js";
   // import { logger } from "../../modules/helpers.js";
   import { v4 as uuidv4 } from "uuid";
   import Select from "svelte-select";
   import Sortable from "./Sortable.svelte";
   import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
   import VariableComponent from "./Variable.svelte";
   import ArgInput from "./ArgInput.svelte";
   import FaArrowsAlt from "svelte-icons/fa/FaArrowsAlt.svelte";

   const groupBy = (i) => i.group;
   const groupByCat = (i) => i.cat;
   /*const e2 = new Step(uuidv4(), 'effect');
    e2.modifiers = [
        new Modifier(uuidv4(), 'file', ['jb2a.magic_signs.circle.02.abjuration.intro.green']),
        new Modifier(uuidv4(), 'atLocation', ['@manual']),
        new Modifier(uuidv4(), 'scale', [0.25]),
        new Modifier(uuidv4(), 'belowTokens', []),
    ];
    seq.steps.push(e2)
    seq.steps.push(new Step(uuidv4(), 'wait', [1000]))

    const e = new Step(uuidv4(), 'effect');
    e.modifiers = [
        new Modifier(uuidv4(), 'atLocation', ['@controlled']),
        new Modifier(uuidv4(), 'stretchTo', ['@manual-last']),
        new Modifier(uuidv4(), 'file', ['jb2a.magic_missile']),
        //new Modifier(uuidv4(), 'file', ['jb2a.arrow']),
        new Modifier(uuidv4(), 'repeats', [3, 200, 300]),
        new Modifier(uuidv4(), 'randomizeMirrorY', []),
    ];
    seq.steps.push(e)*/

   async function play() {
      updateSequences();
      seq.play();
   }

   async function addStep() {
      const e = new Step(uuidv4(), "wait");
      seq.steps.push(e);
      await updateSequences();
      var objDiv = document.getElementById("sequencer-content");
      objDiv.scrollTop = objDiv.scrollHeight;
   }

   function addVariable() {
      const e = new Variable(uuidv4(), `var${seq.variables.length}`, "position");
      seq.variables.push(e);
      updateSequences();
   }

   async function updateSequences() {
      sequences.update((seqs) => {
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

   function addModifier(step) {
      const e = new Modifier(uuidv4(), modifierSpecs[0].id);
      seq.steps.find((s) => s.id == step.id).modifiers.push(e);
      updateSequences();
   }

   const sortSteps = (ev) => {
      updateSequences();
   };

   function deleteModifier(step, mod) {
      step.modifiers = step.modifiers.filter((m) => m.id != mod.id);
      updateSequences();
   }

   function deleteStep(step) {
      seq.steps = seq.steps.filter((s) => s.id != step.id);
      updateSequences();
   }

   function deleteVariable(v) {
      seq.variables = seq.variables.filter((s) => s.id != v.detail.id);
      updateSequences();
   }

   function setStepArg(e, step, i) {
      seq.steps.find((s) => s.id == step.id).args[i] = e.detail || "";
      updateSequences();
   }

   function setModArg(e, step, mod, i) {
      const m = seq.steps.find((s) => s.id == step.id).modifiers.find((m) => m.id == mod.id);
      if (e.detail && typeof e.detail === "object") {
         m.args[i] = e.detail.value;
      } else {
         m.args[i] = e.detail;
      }
      if (m.args[i] != null) {
         updateSequences();
      }
   }

   function setModType(e, step, mod) {
      seq.steps
         .find((s) => s.id == step.id)
         .modifiers.find((m) => m.id == mod.id)
         .setType(e.detail.id);
      updateSequences();
   }
   function setStepType(e, step) {
      seq.steps.find((s) => s.id == step.id).setType(e.detail.id);
      updateSequences();
   }

   function updateVariable(v) {
      updateSequences();
   }
</script>

{#if seq}
   {#each seq.variables as variable (variable.id)}
      <VariableComponent {variable} on:remove={deleteVariable} on:change={updateVariable} />
   {/each}
   <div>
      <button class="ui-my-2 ui-btn ui-btn-outline ui-btn-primary" on:click={(e) => addVariable()}>Add variable</button>
   </div>

   <div class="ui-overflow-auto ui-max-h-[600px]" id="sequencer-content">
      <Sortable items={seq.steps} let:item let:index on:change={sortSteps} options={{ handle: ".handle" }}>
         <div class="ui-flex ui-flex-col ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-space-x-4 ui-my-1">
            <div class="ui-flex ui-flex-row ui-justify-start ui-space-x-2">
               <div class="ui-flex-1 ui-flex ui-flex-row ui-justify-start ui-space-x-2">
                  <button
                     class="ui-btn ui-btn-square ui-btn-ghost handle ui-justify-self-start ui-cursor-move"
                     style="color: #46525d; padding: 6px"
                  >
                     <FaArrowsAlt />
                  </button>
                  <Select
                     items={stepSpecs}
                     {groupBy}
                     optionIdentifier="id"
                     on:select={(e) => setStepType(e, item)}
                     value={item.type}
                  />
                  {#if item.spec?.args}
                     {#each item.spec.args as arg, i}
                        <ArgInput
                           vars={seq.variables}
                           label={arg.label}
                           variables={true}
                           type={arg.type}
                           bind:value={seq.steps[index].args[i]}
                           on:change={(e) => setStepArg(e, item, i)}
                        />
                     {/each}
                  {/if}
               </div>
               <div class="ui-flex-none">
                  <button
                     class="ui-btn ui-btn-outline ui-btn-error ui-btn-square ui-justify-self-end"
                     on:click={(e) => deleteStep(item)}
                  >
                     <XIcon class="ui-h-8 ui-w-8" />
                  </button>
               </div>
            </div>

            {#each item.modifiers as mod (mod.id)}
               <div class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-my-1">
                  <Select
                     items={modifierSpecs.filter((m) => item.type == m.group)}
                     {groupByCat}
                     optionIdentifier="id"
                     labelIdentifier="id"
                     on:select={(e) => setModType(e, item, mod)}
                     value={mod.type}
                  />
                  {#if mod.spec?.args}
                     {#each mod.spec.args as arg, i}
                        <ArgInput
                           vars={seq.variables}
                           label={arg.label}
                           variables={true}
                           type={arg.type}
                           value={mod.args[i]}
                           on:change={(e) => setModArg(e, seq.steps[index], mod, i)}
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
         </div>
      </Sortable>
   </div>

   <div>
      <button class="ui-my-2 ui-btn ui-btn-outline ui-btn-primary" on:click={(e) => addStep()}>Add section</button>
   </div>

   <button class="ui-btn" on:click={play}>play</button>
{/if}
