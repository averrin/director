<script>
   import SequenceEditor from "./SequenceEditor.svelte";
   import { sequences } from "../../modules/stores";
   import { onDestroy } from "svelte";
   import Select from "svelte-select";
   import { DSequence, Variable } from "./SequencerTab.js";
   import { v4 as uuidv4 } from "uuid";
   import CopyToClipboard from "svelte-copy-to-clipboard";
   import FaRegCopy from "svelte-icons/fa/FaRegCopy.svelte";

   export let onTagClick;
   let seq;
   const unsubscribe = sequences.subscribe((seqs) => {
      if (!seq) {
         seq = seqs[0] || new DSequence(uuidv4(), "New Sequence");
      }
   });
   onDestroy(unsubscribe);

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

   function duplicateSeq() {
      // seq = new DSequence(uuidv4(), `New Sequence ${seqs.length}`);
      const copy = DSequence.fromPlain(seq.toJSON());
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
         <label for="seq-modal" class="ui-btn ui-btn-primary" on:click={updateSequences}>Save</label>
         <label for="seq-modal" class="ui-btn ui-btn-accent" on:click={duplicateSeq}>Duplicate</label>
         <label for="seq-modal" class="ui-btn">Close</label>
      </div>
   </div>
</div>

<div class="ui-p-2">
   <div class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-my-1 ui-items-center ui-gap-1">
      <label class="ui-input-group ui-flex-1" for="">
         <Select
            items={$sequences}
            optionIdentifier="id"
            labelIdentifier="title"
            isClearable={false}
            bind:value={seq}
            listAutoWidth={false}
         />
         <CopyToClipboard
            text={`await Director.playSequence("${seq.title}")`}
            on:copy={(_) => globalThis.ui.notifications.info("Macro call copied!")}
            let:copy
         >
            <button class="ui-btn ui-btn-outline ui-btn-square ui-p-2" on:click={copy}>
               <FaRegCopy />
            </button>
         </CopyToClipboard>
         <label for="seq-modal" class="ui-btn ui-modal-button">Edit</label>
      </label>

      <div class="ui-btn-group ui-flex-none">
         <button class="ui-btn ui-btn-outline ui-w-32 ui-btn-accent" on:click={(e) => addVariable()}
            >Add variable</button
         >
         <button class="ui-btn ui-btn-outline ui-btn-primary ui-w-36" on:click={(_) => addSeq()}> Add Sequence </button>
      </div>
   </div>

   <SequenceEditor {seq} {onTagClick} />
</div>
