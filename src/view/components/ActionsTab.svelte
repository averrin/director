<script>
   import ActionItem from "./ActionItem.svelte";
   import Sortable from "./Sortable.svelte";
   import { actions, tagColors } from "../../modules/stores.js";
   import { onDestroy } from "svelte";
   import { v4 as uuidv4 } from "uuid";
   import Action from "../../modules/Actions.js";
   import { calculateValue } from "../../modules/helpers.js";

   export let onTagClick;
   export let onSelect;
   let currentActions;
   const unsubscribe3 = actions.subscribe(async (actions) => {
      currentActions = actions;
   });
   onDestroy(unsubscribe3);

   function addAction(tags) {
      currentActions = [new Action(uuidv4()), ...currentActions];
      actions.set(currentActions);
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
      selectByTags(await calculateValue(action.value));
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
</script>

<div class="flex ui-flex-col ui-p-1">
   <div>
      <button class="ui-btn ui-btn-outline ui-btn-primary ui-my-2 ui-w-full" on:click={(e) => addAction()}
         >Add action</button
      >
   </div>
   <div>
      <Sortable items={currentActions} let:item let:index on:change={sortActions}>
         <ActionItem {item} {selectAction} {deleteAction} {onTagClick} {actionTags} {$tagColors} on:change={onChange} />
      </Sortable>
   </div>
</div>
