<script>
   import { tilesStore, tokensStore, globalTags, tagColors } from "../../modules/stores.js";
   import { onDestroy } from "svelte";
   import Tags from "./Tags.svelte";

   import { PlusIcon } from "@rgossiaux/svelte-heroicons/solid";
   import { setting } from "../../modules/settings.js";
   import { moduleId, SETTINGS } from "../../constants.js";

   export let onTagClick;

   function editObject(_, object) {
      object.document.sheet.render(true);
   }

   export let createAction;

   let tagsSelected;
   let tagsMutual;
   let tagsMutualOld;
   let selection;
   let tiles = [];
   let tokens = [];
   let thumbs = {};

   function onTagsSelected(event, i) {
      const tags = event.detail.tags.filter((t) => t.trim() != "");
      if (i != -1) {
         Tagger.setTags(selection[i], tags);
      } else {
         const add = tags.filter((t) => !tagsMutualOld.includes(t));
         const remove = tagsMutualOld.filter((t) => !tags.includes(t));
         if (add.length > 0) selection.forEach((tile) => Tagger.addTags(tile, add));
         if (remove.length > 0) selection.forEach((tile) => Tagger.removeTags(tile, remove));
         tagsMutualOld = [...tagsMutual];
      }
   }

   async function updateThumbs() {
      for (const obj of selection) {
         if (!(obj.data.img in thumbs)) {
            const thumb = await ImageHelper.createThumbnail(obj.data.img, {
               width: setting(SETTINGS.RESOLUTION),
               height: setting(SETTINGS.RESOLUTION),
            });
            thumbs[obj.data.img] = thumb.thumb;
         }
      }
   }

   function updateMutual() {
      tagsSelected = selection.map((t) => Tagger.getTags(t).filter((t) => t.trim() != ""));
      tagsMutual = [];
      for (let a of tagsSelected) {
         for (let t of a) {
            if (!tagsMutual.includes(t) && tagsSelected.every((tags) => tags.includes(t))) tagsMutual.push(t);
         }
      }
      tagsMutualOld = [...tagsMutual];
   }

   const unsubscribe = tilesStore.subscribe(async (value) => {
      tiles = value;
      selection = [...tiles, ...tokens];
      updateMutual();
      await updateThumbs();
   });
   onDestroy(unsubscribe);

   const unsubscribe2 = tokensStore.subscribe(async (value) => {
      tokens = value;
      selection = [...tiles, ...tokens];
      updateMutual();
      await updateThumbs();
   });
   onDestroy(unsubscribe2);
</script>

{#if selection.length > 1}
   <div class="ui-navbar bg-base-100 ui-space-4">
      <div class="ui-flex-1 ui-space-4 ui-mr-1">
         <a class="ui-btn ui-btn-ghost ui-normal-case ui-text-xl ui-no-animation">Mutual tags</a>
         <div class="ui-w-full">
            <Tags
               allowPaste={true}
               allowDrop={true}
               onlyUnique={true}
               splitWith={","}
               placeholder="Tag"
               autoComplete={$globalTags}
               minChars="1"
               on:tags={(e) => globalThis.debounce(onTagsSelected(e, -1), 100)}
               tags={tagsMutual}
               colors={$tagColors}
               {onTagClick}
            />
         </div>
      </div>
      <div class="ui-flex-none">
         <button class="ui-btn-square ui-btn ui-btn-primary" on:click={(e) => createAction(e, tagsMutual)}>
            <PlusIcon />
         </button>
      </div>
   </div>
{/if}

<div class="ui-overflow-auto ui-max-h-[600px]">
   <div class="ui-flex ui-flex-col ui-p-3 ui-space-y-3 ui-justify-stretch">
      {#if selection.length == 0}
         <div class="ui-justify-self-center ui-p-2">
            <h3>Selection is empty</h3>
         </div>
      {/if}
      {#each selection as tile, i}
         <div class="ui-card ui-card-side ui-bg-base-100 ui-shadow-xl">
            <figure>
               <img class="ui-h-[170px]" style="border: none;" src={thumbs[tile.data.img]} alt="Selected image" />
            </figure>
            <div class="ui-card-body">
               <h2 class="ui-card-title">
                  {#if !tile.data.name}
                     Tile: {tile.id}
                     {#if tile.data.flags["monks-active-tiles"]?.actions?.length > 0}
                        <span class="ui-badge ui-badge-primary">MATT</span>
                     {/if}
                  {:else}
                     Token: {tile.data.name}
                  {/if}
                  {#if true}
                     <span class="ui-badge">{tile.data.width}x{tile.data.height}</span>
                  {/if}
                  <span
                     class="ui-badge"
                     class:ui-badge-ghost={tile.data.hidden}
                     class:ui-badge-success={!tile.data.hidden}
                     on:click={() => tile.document.update({ hidden: !tile.data.hidden })}
                  >
                     {tile.data.hidden ? "hidden" : "visible"}
                  </span>
               </h2>

               <p>
                  <Tags
                     allowPaste={true}
                     allowDrop={true}
                     onlyUnique={true}
                     splitWith={","}
                     placeholder="Tag"
                     autoComplete={$globalTags}
                     minChars="1"
                     on:tags={(e) => onTagsSelected(e, i)}
                     tags={tagsSelected[i]}
                     colors={$tagColors}
                     {onTagClick}
                  />
               </p>

               <div class="ui-card-actions ui-justify-end ui-flex-row">
                  <button class="ui-w-32 ui-btn" on:click={(e) => editObject(e, tile)}>Edit</button>
                  <button class="ui-w-32 ui-btn ui-btn-outline ui-btn-warning" on:click={(e) => tile.release()}
                     >Deselect</button
                  >
                  <button class="ui-w-32 ui-btn ui-btn-primary" on:click={(e) => createAction(e, tagsSelected[i])}
                     >Create action</button
                  >
               </div>
            </div>
         </div>
      {/each}
   </div>
</div>
