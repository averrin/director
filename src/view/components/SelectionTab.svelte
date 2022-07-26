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
         const img = obj.document.texture.src;
         logger.info(img);
         if (!(img in thumbs)) {
            const thumb = await ImageHelper.createThumbnail(img, {
               width: setting(SETTINGS.RESOLUTION),
               height: setting(SETTINGS.RESOLUTION),
            });
            logger.info(thumb);
            thumbs[img] = thumb.thumb;
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
   <div class="ui-p-2">
      <div
         class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-items-center ui-space-x-2 ui-cursor-move ui-my-1"
      >
         <div class="ui-input-group">
            <span class="!ui-w-32">Mutual tags</span>
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
               <img
                  class="ui-h-[170px]"
                  style="border: none;"
                  src={thumbs[tile.document.texture.src]}
                  alt="Selected image"
               />
            </figure>
            <div class="ui-card-body">
               <h2 class="ui-card-title">
                  {#if !tile.name}
                     Tile: {tile.id}
                     {#if tile.document.flags["monks-active-tiles"]?.actions?.length > 0}
                        <span class="ui-badge ui-badge-primary">MATT</span>
                     {/if}
                  {:else}
                     Token: {tile.name}
                  {/if}
                  {#if true}
                     <span class="ui-badge">{tile.width}x{tile.height}</span>
                  {/if}
                  <span
                     class="ui-badge"
                     class:ui-badge-ghost={tile.hidden}
                     class:ui-badge-success={!tile.hidden}
                     on:click={() => tile.document.update({ hidden: !tile.hidden })}
                  >
                     {tile.hidden ? "hidden" : "visible"}
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
