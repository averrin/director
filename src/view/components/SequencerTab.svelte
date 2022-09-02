<script>
   import SequenceEditor from "./SequenceEditor.svelte";
   import { sequences } from "../../modules/stores";
   import { onDestroy, getContext } from "svelte";
   import Select from "svelte-select";
   import { Section, DSequence, Variable } from "../../modules/Sequencer.js";
   import { v4 as uuidv4 } from "uuid";
   import ArgInput from "crew-components/ArgInput";
   import CopyButton from "crew-components/CopyButton";
   import exportFromJSON from "export-from-json";
   import { setting } from "crew-components/helpers";
   import { moduleId, SETTINGS } from "../../constants.js";

   const { application } = getContext("external");
   const position = application.position;
   const { height } = position.stores;
   let contentH = $height;
   onDestroy(height.subscribe((h) => (contentH = h - 124)));

   let seq = undefined;
   let fullCode = "";
   let oneliner = "";
   const unsubscribe = sequences.subscribe((seqs) => {
      if (!seq) {
         seq =
            seqs.find((s) => s.id == setting(SETTINGS.SELECTED_SEQ)) ||
            seqs[0] ||
            new DSequence(uuidv4(), "New Sequence");
      }
      if (Array.isArray(seq)) {
         seq = new DSequence(uuidv4(), "New Sequence");
      }
      fullCode = getCode();
      oneliner = getOnelliner();
      globalThis.game.settings.set(moduleId, SETTINGS.SELECTED_SEQ, seq.id);
   });
   $: debounce(() => {
      fullCode = getCode();
      oneliner = getOnelliner();
   }, 200);
   onDestroy(unsubscribe);

   function getCode() {
      if (!seq) return "";
      try {
         seq = DSequence.fromPlain(seq);
         return seq?.convertToCode();
      } catch (error) {
         logger.error(error);
         return ``;
      }
   }

   function getOnelliner() {
      if (!seq) return "";
      try {
         let vars = {};
         for (const v of seq.variables) {
            vars[v.name] = null;
         }
         vars = JSON.stringify(vars);
         return `await Director.playSequence("${seq.title}", ${vars});`;
      } catch (error) {
         logger.error(error);
         return ``;
      }
   }

   function addSeq() {
      sequences.update((seqs) => {
         seq = new DSequence(uuidv4(), `New Sequence ${seqs.length}`);
         return [seq, ...seqs];
      });
   }

   function deleteSeq() {
      sequences.update((seqs) => {
         seqs = seqs.filter((s) => s.id != seq.id);
         seq = seqs[0] || new DSequence(uuidv4(), "New Sequence");
         return seqs;
      });
   }
   function exportSeq() {
      const fileName = `director-seq-${seq.title.replaceAll(" ", "_")}`;
      const exportType = exportFromJSON.types.json;
      exportFromJSON({ data: seq, fileName, exportType });
   }

   function duplicateSeq() {
      // seq = new DSequence(uuidv4(), `New Sequence ${seqs.length}`);
      const copy = DSequence.fromPlain(seq);
      copy.id = uuidv4();
      copy.title = seq.title + " (Copy)";
      seq = copy;
      sequences.update((seqs) => {
         return [seq, ...seqs];
      });
   }

   function addVariable() {
      const e = new Variable(uuidv4(), `var${seq.variables.length}`, "position");
      seq.variables.push(e);
      updateSequences();
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
      openModal = false;
   }

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

   async function addSection() {
      const e = new Section(uuidv4(), "wait");
      seq.sections.push(e);
      await updateSequences();
      var objDiv = document.getElementById("seq-container");
      objDiv.scrollTop = objDiv.scrollHeight;
   }
   let openModal = false;
</script>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="seq-modal" class="ui-modal-toggle" on:click={(_) => (openModal = !openModal)} />
<label
   for="seq-modal"
   class="ui-modal ui-items-center"
   class:modal-open={openModal}
   style="pointer-events: all !important;"
>
   <div class="ui-modal-box ui-max-h-64 ui-bg-base-100 ui-w-11/12 ui-max-w-5xl">
      <h3 class="ui-font-bold ui-text-lg">Edit sequence</h3>

      <div class="ui-form-control">
         <label class="ui-label" for="">
            <span class="ui-label-text">Title</span>
         </label>
         <input type="text" placeholder="Title" bind:value={seq.title} class="ui-input ui-input-bordered ui-input-lg" />
      </div>

      <div class="ui-modal-action ui-group ui-group-md ui-flex ui-flex-row ui-gap-1">
         <label for="seq-modal" class="ui-btn ui-btn-error" on:click={deleteSeq}>Delete</label>
         <label for="seq-modal" class="ui-btn ui-btn-accent" on:click={duplicateSeq}>Duplicate</label>
         {#if !setting(SETTINGS.HIDE_IMPORT)}
            <label for="seq-modal" class="ui-btn ui-btn-accent" on:click={exportSeq}>Export</label>
         {/if}
         <label for="seq-modal" class="ui-btn">Close</label>
         <div class="ui-btn ui-btn-primary" on:click={updateSequences}>Save</div>
      </div>
   </div>
</label>

<div style="height: {contentH}px;">
   <div
      class="ui-flex ui-m-2 ui-flex-row ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-p-2 ui-my-1 ui-items-center ui-gap-1"
   >
      <div class="ui-flex-1 ui-flex ui-flex-row">
         <label class="ui-input-group ui-input-group-md !ui-w-fit" for="">
            <Select
               items={$sequences}
               optionIdentifier="id"
               labelIdentifier="title"
               isClearable={false}
               bind:value={seq}
               listAutoWidth={false}
            />
            <CopyButton text={oneliner} notification="Oneliner copied!" title="Copy oneliner" icon="fa-solid:copy" />
            <CopyButton text={fullCode} notification="Full code copied!" title="Copy full code" icon="fa-solid:code" />
            <div class="ui-btn ui-modal-button !ui-px-2" on:click={(_) => (openModal = !openModal)}>Edit</div>
         </label>
         <div class="ui-mx-3">
            <ArgInput
               label="In&nbsp;Scene"
               type="bool"
               bind:value={seq.inScene}
               hideSign={true}
               on:change={updateSequences}
            />
         </div>
      </div>

      <div class="ui-btn-group ui-btn-group-md ui-flex-none">
         <button class="ui-btn ui-w-32 ui-btn-accent" on:click={(e) => addVariable()}>Add variable</button>
         <button class="ui-btn ui-btn-primary ui-w-36" on:click={(_) => addSeq()}> Add Sequence </button>
      </div>
   </div>

   {#if seq}
      <div id="seq-container" class="ui-overflow-auto ui-px-2" style="height: {contentH - 180}px;">
         <SequenceEditor {seq} />
      </div>

      <div class="ui-bg-base-100 ui-p-2 ui-gap-2 ui-flex ui-flex-col">
         <button class="ui-btn ui-btn-outline ui-btn-md ui-w-full" on:click={(e) => addSection()}>Add section</button>

         <div class="ui-btn-group ui-btn-group-md ui-w-full ui-justify-center ui-items-start">
            <button class="ui-btn ui-btn-outline ui-w-[33%]" class:ui-loading={preloading} on:click={preload}
               >preload</button
            >
            <button class="ui-btn ui-btn-error ui-btn-outline ui-w-1/3" on:click={stop}>stop persists</button>
            <button class="ui-btn ui-w-1/3" on:click={play}>play</button>
         </div>
      </div>
   {/if}
</div>
