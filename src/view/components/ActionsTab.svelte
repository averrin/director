<script>
   import ActionItem from "./ActionItem.svelte";
   import SortableList from "svelte-sortable-list";
   import { currentScene, globalTags, tagColors } from "../../modules/stores.js";
   import { onDestroy } from "svelte";
   import { v4 as uuidv4 } from "uuid";
   import { Variable } from "./SequencerTab";

   export let onTagClick;
   export let onSelect;
   let actions;
   let savedActions;
   const unsubscribe3 = currentScene.subscribe((scene) => {
      savedActions =
         "director-actions" in scene.data.flags ? scene.data.flags["director-actions"].filter((a) => a) : [];
      actions = savedActions ? savedActions : [{ id: uuidv4(), tags: [], type: "" }];
   });
   onDestroy(unsubscribe3);

   function addAction(tags) {
      actions = [{ id: uuidv4(), tags: tags || [], type: "" }, ...actions];
   }

   const sortActions = (ev) => {
      let sorted = ev.detail.filter((a) => a);
      if (sorted.length == actions.length) {
         actions = sorted;
         canvas.scene.update({ "flags.director-actions": actions });
      }
   };

   async function deleteAction(_, id) {
      actions = actions.filter((a) => a.id !== id);
      await canvas.scene.update({ "flags.director-actions": actions });
   }

   function selectByTags(tags) {
      canvas.tokens.releaseAll();
      canvas.background.releaseAll();
      const objects = Tagger.getByTag(tags);
      for (const doc of objects) {
         canvas.tokens.ownedTokens.find((t) => t.document.id == doc.id)?.control({ releaseOthers: false });
         canvas.background.placeables.find((t) => t.document.id == doc.id)?.control({ releaseOthers: false });
      }
      if (canvas.tokens.controlled.length > 0) {
         if (onSelect) onSelect();
      }
   }

   function selectAction(_, id) {
      const action = actions.find((a) => a.id === id);
      selectByTags(action.tags);
   }

   async function execAction(event, id) {
      const action = actions.find((a) => a.id === id);
      let objects;
      if (Array.isArray(action.tags)) {
         if (action.tags.length == 0) return;
         objects = globalThis.Tagger.getByTag(action.tags);
      } else {
         objects = await Variable.calculateValue(action.tags);
         if (!Array.isArray(objects)) objects = [objects];
         objects = objects.map((o) => o.document);
      }
      switch (action.type) {
         case "toggle":
            objects.forEach((o) => o.update({ hidden: !o.data.hidden }));
            break;
         case "hide":
            objects.forEach((o) => o.update({ hidden: true }));
            break;
         case "show":
            objects.forEach((o) => o.update({ hidden: false }));
            break;
         case "kill":
            objects.forEach((o) =>
               o.actor.update({
                  "data.attributes.hp.value": 0,
               })
            );
            break;
         case "revive":
            objects.forEach((o) =>
               o.actor.update({
                  "data.attributes.hp.value": o.actor.data.data.attributes.hp.max,
               })
            );
            break;
         case "execute":
            objects.forEach((o) => {
               if (o.data.flags["monks-active-tiles"]) {
                  globalThis.game.MonksActiveTiles.object = { document: o };
                  globalThis.game.MonksActiveTiles.manuallyTrigger(event);
               }
            });
            break;
         default:
            objects.map(async (o) => {
               const overrides = {};
               overrides[action.value.name] = o;
               globalThis.Director.playSequence(action.type.id, overrides);
            });
      }
   }
   async function actionTags(event, id) {
      if (event.detail.tags) {
         const tags = event.detail.tags.filter((t) => t.trim() != "");
         const action = actions.find((a) => a.id === id);
         action.tags = tags;
      } else if (event.detail.value) {
         const action = actions.find((a) => a.id === id);
         action.tags = event.detail.value;
      }
      await canvas.scene.update({ "flags.director-actions": actions });
   }

   function onChange(event) {
      const i = actions.findIndex((a) => a.id === event.detail.id);
      // if (JSON.stringify(actions[i]) != JSON.stringify(event.detail)) {
      actions[i] = event.detail;
      canvas.scene.update({ "flags.director-actions": actions });
      // }
   }
</script>

<div class="flex ui-flex-col ui-p-1">
   <div>
      <button class="ui-btn ui-btn-outline ui-btn-primary" on:click={(e) => addAction()}>Add action</button>
   </div>
   <div>
      <SortableList list={actions} key="id" let:item on:sort={sortActions}>
         <ActionItem
            {item}
            {selectAction}
            {deleteAction}
            {execAction}
            {onTagClick}
            {actionTags}
            {$tagColors}
            on:change={onChange}
         />
      </SortableList>
   </div>
</div>
