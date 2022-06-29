<script>
   import SequenceEditor from "./SequenceEditor.svelte";
   import { sequences } from "../../modules/stores";
   import { onDestroy } from "svelte";
   import Select from "svelte-select";
   import { DSequence } from "./SequencerTab.js";
   import { v4 as uuidv4 } from "uuid";

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

   function updateSequences() {
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
</script>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="seq-modal" class="ui-modal-toggle" />
<div class="ui-modal">
   <div class="ui-modal-box">
      <h3 class="py-4 font-bold text-lg">Edit sequence</h3>

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

<div class="p-2">
   <div class="flex flex-row bg-white rounded-xl shadow-lg p-2 space-x-4 my-1 items-center">
      <Select items={$sequences} optionIdentifier="id" labelIdentifier="title" isClearable={false} bind:value={seq} />
      <label for="seq-modal" class="ui-btn ui-modal-button">Edit</label>
      <button class="m-2 ui-btn ui-btn-outline ui-btn-primary w-36" on:click={(_) => addSeq()}>Add Sequence</button>
   </div>

   <SequenceEditor {seq} />
</div>