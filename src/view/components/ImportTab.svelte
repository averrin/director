<script>
   import Dropzone from "svelte-file-dropzone";
   import { sequences, actions, hooks } from "../../modules/stores.js";

   import { DSequence } from "../../modules/Sequencer.js";
   import Action from "../../modules/Actions.js";
   import Hook from "../../modules/Hooks.js";

   let files = {
      accepted: [],
      rejected: [],
   };

   function handleFilesSelect(e) {
      const { acceptedFiles, fileRejections } = e.detail;
      files.accepted = [...files.accepted, ...acceptedFiles];
      files.rejected = [...files.rejected, ...fileRejections];
      for (const file of files.accepted) {
         let reader = new FileReader();

         reader.readAsText(file);

         reader.onload = function () {
            let data = JSON.parse(reader.result);
            file.data = data;
            if ("sections" in data) {
               file.dirType = "sequence";
               file.count = 1;
            } else if (Array.isArray(data) && data.length > 0) {
               if ("event" in data[0]) {
                  file.dirType = "hooks";
                  file.count = data.length;
               } else if ("value" in data[0]) {
                  file.dirType = "actions";
                  file.count = data.length;
               }
            }
            files = files;
         };
      }
   }
   function importFile(file) {
      logger.info(file);
      if (file.dirType == "sequence") {
         sequences.update((seqs) => {
            return [DSequence.fromPlain(file.data), ...seqs];
         });
         globalThis.ui.notifications.info(`${file.count} sequences imported SUCCESSFULLY`);
      } else if (file.dirType == "actions") {
         actions.update((actions) => {
            return [...file.data.map((a) => Action.fromPlain(a)), ...actions].flat();
         });
         globalThis.ui.notifications.info(`${file.count} actions imported SUCCESSFULLY`);
      } else if (file.dirType == "hooks") {
         hooks.update((hooks) => {
            return [...file.data.map((a) => Hook.fromPlain(a)), ...hooks].flat();
         });
         globalThis.ui.notifications.info(`${file.count} hooks imported SUCCESSFULLY`);
      }
      files.accepted = files.accepted.filter((f) => f.path != file.path);
      files = files;
   }
</script>

<div class="ui-h-full">
   <Dropzone on:drop={handleFilesSelect} />
   {#if files.accepted.length > 0}
      <div class="ui-flex ui-flex-col ui-gap-1 ui-p-2 ui-text-base-content">
         {#each files.accepted as item}
            <div
               class="ui-flex ui-flex-row ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-p-2 ui-gap-2 ui-my-1 ui-items-center"
            >
               <div class="ui-flex ui-flex-1 ui-px-4 ui-text-xl">
                  {item.name}
               </div>
               <div class="ui-flex-none">
                  <div class="ui-flex ui-flex-row ui-gap-2 ui-items-center ui-p-2">
                     {#if item.dirType == "actions"}
                        <span style:color={"#777"}> import&nbsp;as </span>
                        <button class="ui-btn ui-btn-md ui-w-auto" on:click={(e) => importFile(item)}
                           >{item.count} Actions</button
                        >
                     {:else if item.dirType == "hooks"}
                        <span style:color={"#777"}> import&nbsp;as </span>
                        <button class="ui-btn ui-btn-md ui-w-auto" on:click={(e) => importFile(item)}
                           >{item.count} Hooks</button
                        >
                     {:else if item.dirType == "sequence"}
                        <span style:color={"#777"}> import&nbsp;as </span>
                        <button class="ui-btn ui-btn-md ui-w-auto" on:click={(e) => importFile(item)}>Sequence</button>
                     {:else}
                        <span style:color={"darkred"}> file wasn't recognized </span>
                     {/if}
                  </div>
               </div>
            </div>
         {/each}
      </div>
   {/if}
</div>
