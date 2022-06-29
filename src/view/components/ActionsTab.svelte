<script>
   import ActionItem from "./ActionItem.svelte";
   import SortableList from "svelte-sortable-list";
   import { currentScene, globalTags, tagColors } from "../../modules/stores.js";
   import { onDestroy } from "svelte";
   import { v4 as uuidv4 } from "uuid";

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

   function execAction(event, id) {
      const action = actions.find((a) => a.id === id);
      const objects = Tagger.getByTag(action.tags);
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
      }
   }
   async function actionTags(event, id) {
      const tags = event.detail.tags.filter((t) => t.trim() != "");
      const action = actions.find((a) => a.id === id);
      action.tags = tags;
      await canvas.scene.update({ "flags.director-actions": actions });
   }

   function handleSelect(event, id) {
      const type = event.detail.value;
      const action = actions.find((a) => a.id === id);
      action.type = type;
      canvas.scene.update({ "flags.director-actions": actions });
   }
   function handleClear(event, id) {
      const action = actions.find((a) => a.id === id);
      action.type = "";
      canvas.scene.update({ "flags.director-actions": actions });
   }
</script>

<div class="flex flex-col p-1">
   <div>
      <button class="ui-btn ui-btn-outline ui-btn-primary" on:click={(e) => addAction()}>Add action</button>
   </div>
   <div>
      <SortableList list={actions} key="id" let:item on:sort={sortActions}>
         <ActionItem
            {item}
            {selectAction}
            {handleSelect}
            {handleClear}
            {deleteAction}
            {execAction}
            {onTagClick}
            {actionTags}
            {$tagColors}
            autoComplete={$globalTags}
         />
      </SortableList>
   </div>
</div>
