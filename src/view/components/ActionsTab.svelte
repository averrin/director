<script>
   import ActionItem from "./ActionItem.svelte";
   import Sortable from "./Sortable.svelte";
   import { actions, tagColors } from "../../modules/stores.js";
   import { v4 as uuidv4 } from "uuid";
   import Action from "../../modules/Actions.js";
   import { calculateValue } from "../../modules/helpers.js";
   import exportFromJSON from "export-from-json";
   import { SETTINGS } from "../../constants.js";
   import ArgInput from "crew-components/ArgInput";
   import IconButton from "crew-components/IconButton";
   import FaPlay from "svelte-icons/fa/FaPlay.svelte";
   import { setting, contrastColor, getIconNames } from "crew-components/helpers";
   import { onDestroy, getContext, tick } from "svelte";

   const { application } = getContext("external");
   const position = application.position;
   const { height } = position.stores;
   let contentH = $height;
   onDestroy(height.subscribe((h) => (contentH = h - 128)));

   getIconNames("mdi");

   export let onSelect;
   let currentActions;
   const unsubscribe3 = actions.subscribe(async (actions) => {
      currentActions = actions;
      tick().then(() => {
         height.set(document.getElementById("actions-content").clientHeight + 210);
      });
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

   async function deleteAction(id) {
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
      editItem = false;
   }
</script>

{#if editItem}
   <input type="checkbox" id="modal-actions" class="ui-modal-toggle" bind:checked={pickerOpen} />
   <label for="modal-actions" class="ui-modal modal-open ui-items-center">
      <div class="ui-modal-box ui-w-11/12 ui-max-w-5xl ui-max-h-64">
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
                  size="md"
               />
               <ArgInput
                  type="icon"
                  label="icon"
                  bind:value={editItem.icon}
                  hideSign={true}
                  widthAuto={true}
                  size="md"
               />
               <ArgInput
                  type="bool"
                  label="hide in bar"
                  bind:value={editItem.hidden}
                  hideSign={true}
                  widthAuto={true}
                  size="md"
               />
               <ArgInput
                  type="bool"
                  label="global"
                  bind:value={editItem.global}
                  hideSign={true}
                  widthAuto={true}
                  size="md"
               />
            </div>
            <div class="ui-flex ui-flex-none">
               <button
                  title="execute action"
                  class="ui-btn ui-btn-square ui-btn-md"
                  style:background-color={editItem.color}
                  style:color={contrastColor(editItem.color)}
                  class:!ui-p-[8px]={!editItem.icon}
               >
                  <iconify-icon
                     style:font-size="2rem"
                     icon={editItem.icon || "fa-solid:play"}
                     style:color={contrastColor(editItem.color)}
                  />
               </button>
            </div>
         </div>
         <div class="ui-flex ui-justify-end">
            <div class="ui-btn ui-btn-md ui-btn-primary" on:click={(_) => apply()}>Save</div>
         </div>
      </div>
   </label>
{/if}

<div class="ui-flex ui-flex-col ui-p-2 ui-gap-2 ui-overflow-x-auto" style="height: {contentH}px;">
   <div class="ui-flex ui-flex-row ui-items-center ui-gap-2 ui-group ui-group-md">
      <button class="ui-btn ui-btn-outline ui-flex-1" on:click={(e) => addAction()}>Add action</button>
      {#if !setting(SETTINGS.HIDE_IMPORT)}
         <IconButton icon="fa6-solid:file-export" title="Export" on:click={exportActions} />
      {/if}
   </div>

   <div id="actions-content">
      <Sortable items={currentActions} let:item let:index on:change={sortActions} options={{ handle: ".handle" }}>
         <ActionItem {item} {selectAction} {deleteAction} {actionTags} {$tagColors} on:change={onChange} {itemClick} />
      </Sortable>
   </div>
</div>
