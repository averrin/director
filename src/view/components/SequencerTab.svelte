<script>
   import SequenceEditor from "./SequenceEditor.svelte";
   import { sequences } from "../../modules/stores";
   import { onDestroy } from "svelte";
   import Select from "svelte-select";
   import { DSequence, Variable } from "../../modules/Sequencer.js";
   import { v4 as uuidv4 } from "uuid";
   import CopyToClipboard from "svelte-copy-to-clipboard";
   import FaRegCopy from "svelte-icons/fa/FaRegCopy.svelte";
   import FaCode from "svelte-icons/fa/FaCode.svelte";
   import ArgInput from "./ArgInput.svelte";
   import exportFromJSON from "export-from-json";
   import { setting } from "../../modules/helpers.js";
   import { moduleId, SETTINGS } from "../../constants.js";

   export let onTagClick;
   let seq;
   let fullCode = "";
   let oneliner = "";
   const unsubscribe = sequences.subscribe((seqs) => {
      if (!seq) {
         seq =
            seqs.find((s) => s.id == setting(SETTINGS.SELECTED_SEQ)) ||
            seqs[0] ||
            new DSequence(uuidv4(), "New Sequence");
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
      seq = DSequence.fromPlain(seq);
      return seq.convertToCode();
   }

   function getOnelliner() {
      let vars = {};
      for (const v of seq.variables) {
         vars[v.name] = null;
      }
      vars = JSON.stringify(vars);
      return `await Director.playSequence("${seq.title}", ${vars});`;
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

   function updateSequences() {
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
</script>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="seq-modal" class="ui-modal-toggle" />
<div class="ui-modal">
   <div class="ui-modal-box">
      <h3 class="ui-py-4 ui-font-bold ui-text-lg">Edit sequence</h3>

      <div class="ui-form-control">
         <label class="ui-label" for="">
            <span class="ui-label-text">Title</span>
         </label>
         <input type="text" placeholder="Title" bind:value={seq.title} class="ui-input ui-input-bordered" />
      </div>

      <div class="ui-modal-action">
         <label for="seq-modal" class="ui-btn ui-btn-error" on:click={deleteSeq}>Delete</label>
         <label for="seq-modal" class="ui-btn ui-btn-accent" on:click={duplicateSeq}>Duplicate</label>
         {#if !setting(SETTINGS.HIDE_IMPORT)}
            <label for="seq-modal" class="ui-btn ui-btn-accent" on:click={exportSeq}>Export</label>
         {/if}
         <label for="seq-modal" class="ui-btn">Close</label>
         <label for="seq-modal" class="ui-btn ui-btn-primary" on:click={updateSequences}>Save</label>
      </div>
   </div>
</div>

<div class="ui-p-2">
   <div class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-my-1 ui-items-center ui-gap-1">
      <div class="ui-flex-1 ui-flex ui-flex-row">
         <label class="ui-input-group !ui-w-fit" for="">
            <Select
               items={$sequences}
               optionIdentifier="id"
               labelIdentifier="title"
               isClearable={false}
               bind:value={seq}
               listAutoWidth={false}
            />
            <CopyToClipboard
               text={oneliner}
               on:copy={(_) => globalThis.ui.notifications.info("Oneliner copied!")}
               let:copy
            >
               <button class="ui-btn ui-btn-square ui-p-2 ui-btn-outline ui-m-0" on:click|preventDefault={copy}>
                  <FaRegCopy />
               </button>
            </CopyToClipboard>
            <CopyToClipboard
               text={fullCode}
               on:copy={(_) => globalThis.ui.notifications.info("Full code copied!")}
               let:copy
            >
               <button class="ui-btn ui-btn-square ui-p-2 ui-btn-outline ui-m-0" on:click|preventDefault={copy}>
                  <FaCode />
               </button>
            </CopyToClipboard>
            <label for="seq-modal" class="ui-btn ui-modal-button">Edit</label>
         </label>
         <div class="ui-mx-3">
            <ArgInput
               label="In scene"
               type="bool"
               bind:value={seq.inScene}
               hideSign={true}
               on:change={updateSequences}
            />
         </div>
      </div>

      <div class="ui-btn-group ui-flex-none">
         <button class="ui-btn ui-btn-outline ui-w-32 ui-btn-accent" on:click={(e) => addVariable()}
            >Add variable</button
         >
         <button class="ui-btn ui-btn-outline ui-btn-primary ui-w-36" on:click={(_) => addSeq()}> Add Sequence </button>
      </div>
   </div>

   <SequenceEditor {seq} {onTagClick} />
</div>
