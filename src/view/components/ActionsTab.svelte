<script>
   import ActionItem from "./ActionItem.svelte";
   import Sortable from "./Sortable.svelte";
   import { actions, tagColors } from "../../modules/stores.js";
   import { onDestroy } from "svelte";
   import { v4 as uuidv4 } from "uuid";
   import Action from "../../modules/Actions.js";
   import { calculateValue, getIconNames } from "../../modules/helpers.js";
   import exportFromJSON from "export-from-json";
   import FaFileExport from "svelte-icons/fa/FaFileExport.svelte";
   import { setting } from "../../modules/helpers.js";
   import { SETTINGS } from "../../constants.js";
   import { logger, rgb2hex } from "../../modules/helpers.js";
   import ArgInput from "./ArgInput.svelte";
   import { contrastColor } from "../../modules/helpers.js";
   import FaPlay from "svelte-icons/fa/FaPlay.svelte";

   getIconNames("mdi");

   export let onSelect;
   let currentActions;
   const unsubscribe3 = actions.subscribe(async (actions) => {
      currentActions = actions;
   });
   onDestroy(unsubscribe3);

   let pickerOpen = false;
   let editItem;
   function itemClick(item) {
      editItem = item;
      pickerOpen = !pickerOpen;
   }

   function addAction(tags) {
      currentActions = [new Action(uuidv4()), ...currentActions];
      actions.set(currentActions);
   }

   function exportActions() {
      const fileName = `director-actions`;
      const exportType = exportFromJSON.types.json;
      exportFromJSON({ data: currentActions, fileName, exportType });
   }

   const sortActions = (ev) => {
      let sorted = ev.detail.filter((a) => a);
      if (sorted.length == currentActions.length) {
         currentActions = sorted;
         actions.set(currentActions);
      }
   };

   async function deleteAction(_, id) {
      currentActions = currentActions.filter((a) => a.id !== id);
      actions.set(currentActions);
   }

   function selectByTags(objects) {
      canvas.tokens.releaseAll();
      canvas.background.releaseAll();
      if (!Array.isArray(objects)) objects = [objects];
      for (const doc of objects) {
         canvas.tokens.ownedTokens.find((t) => t.document.id == doc.id)?.control({ releaseOthers: false });
         canvas.background.placeables.find((t) => t.document.id == doc.id)?.control({ releaseOthers: false });
      }
      if (canvas.tokens.controlled.length > 0) {
         if (onSelect) onSelect();
      }
   }

   async function selectAction(_, id) {
      const action = currentActions.find((a) => a.id === id);
      selectByTags(await calculateValue(action.value, "selection"));
   }

   async function actionTags(event, id) {
      const action = currentActions.find((a) => a.id === id);
      if (event.detail?.tags) {
         const tags = event.detail.tags.filter((t) => t.trim() != "");
         action.value = tags;
         action.valueType = "Tagger";
      } else if (Array.isArray(event.detail)) {
         action.value = event.detail;
         action.valueType = "Tagger";
      } else if (event.detail?.value) {
         action.value = event.detail.value;
         action.valueType = "common";
      } else {
         action.value = event.detail;
         action.valueType = "hook";
      }
      actions.set(currentActions);
   }

   function onChange(event) {
      const i = currentActions.findIndex((a) => a.id === event.detail.id);
      // if (JSON.stringify(actions[i]) != JSON.stringify(event.detail)) {
      currentActions[i] = event.detail;
      actions.set(currentActions);
      // }
   }

   function apply() {
      actions.set(currentActions);
      pickerOpen = false;
   }
</script>

{#if editItem}
   <input type="checkbox" id="color-modal-actions" class="ui-modal-toggle" bind:checked={pickerOpen} />
   <label for="color-modal-actions" class="ui-modal ui-cursor-pointer">
      <div class="ui-modal-box ui-w-11/12 ui-max-w-5xl">
         <h3 class="ui-py-4 ui-font-bold ui-text-lg">Edit action</h3>
         <div class="ui-flex ui-flex-row ui-items-center ui-gap-2">
            <div class="ui-flex ui-flex-row ui-flex-1 ui-items-center ui-gap-2 ui-flex-wrap">
               <ArgInput
                  type="color"
                  label="color"
                  bind:value={editItem.color}
                  hideSign={true}
                  widthAuto={true}
                  defaultValue="#46525D"
               />
               <ArgInput type="icon" label="icon" bind:value={editItem.icon} hideSign={true} widthAuto={true} />
               <ArgInput
                  type="bool"
                  label="hide in bar"
                  bind:value={editItem.hidden}
                  hideSign={true}
                  widthAuto={true}
               />
               <ArgInput type="bool" label="global" bind:value={editItem.global} hideSign={true} widthAuto={true} />
            </div>
            <div class="ui-flex ui-flex-none">
               <button
                  title="execute action"
                  class="ui-btn ui-btn-square"
                  style:background-color={editItem.color}
                  style:color={contrastColor(editItem.color)}
                  class:!ui-p-[8px]={!editItem.icon}
               >
                  {#if editItem.icon}
                     <iconify-icon
                        style:font-size="2rem"
                        icon={editItem.icon}
                        style:color={contrastColor(editItem.color)}
                     />
                  {:else}
                     <FaPlay />
                  {/if}
               </button>
            </div>
         </div>
         <div class="ui-modal-action">
            <label for="seq-modal" class="ui-btn ui-btn-primary" on:click={(_) => apply()}>Save</label>
         </div>
      </div>
   </label>
{/if}

<div class="flex ui-flex-col ui-p-2">
   <div class="ui-flex ui-flex-row ui-items-center ui-gap-2">
      <button class="ui-btn ui-btn-outline ui-btn-primary ui-my-2 ui-flex-1" on:click={(e) => addAction()}
         >Add action</button
      >
      {#if !setting(SETTINGS.HIDE_IMPORT)}
         <button
            class="ui-btn ui-btn-square !ui-p-2 ui-flex-none ui-btn-outline"
            title="Export"
            on:click={exportActions}
         >
            <FaFileExport />
         </button>
      {/if}
   </div>
   <div>
      <Sortable items={currentActions} let:item let:index on:change={sortActions} options={{ handle: ".handle" }}>
         <ActionItem {item} {selectAction} {deleteAction} {actionTags} {$tagColors} on:change={onChange} {itemClick} />
      </Sortable>
   </div>
</div>
