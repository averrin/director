<script>
   import { tilesStore, tokensStore, globalTags, tagColors, wallsStore, lightsStore } from "../../modules/stores.js";
   import { onDestroy, tick } from "svelte";
   import Tags from "crew-components/Tags";
   import IconButton from "crew-components/IconButton";

   import { setting } from "../../modules/settings.js";
   import { moduleId, SETTINGS } from "../../constants.js";
   import { getContext } from "svelte";
   import { getFlag, tintImage } from "crew-components/helpers";

   const { application } = getContext("external");
   const position = application.position;
   const { height } = position.stores;
   let contentH = $height;

   let selection;
   onDestroy(
      height.subscribe((h) => {
         if (!selection || selection.length == 0) return;
         contentH = h - 210;
      })
   );

   function editObject(_, object) {
      object.document.sheet.render(true);
   }

   export let createAction;

   let tagsSelected;
   let tagsMutual;
   let tagsMutualOld;
   let tiles = [];
   let tokens = [];
   let walls = [];
   let lights = [];
   let thumbs = {};

   const onTagClick = getContext("onTagClick");

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
         const img = obj.document.texture?.src || obj.data.img;
         if (!(img in thumbs)) {
            const thumb = await ImageHelper.createThumbnail(img, {
               width: setting(SETTINGS.RESOLUTION),
               height: setting(SETTINGS.RESOLUTION),
            });
            if (obj.data.tint) {
               const tint = await tintImage(thumb.thumb, obj.data.tint);
               thumbs[img] = tint.url;
            } else {
               thumbs[img] = thumb?.thumb;
            }
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

   async function update() {
      selection = [...tiles, ...tokens, ...walls, ...lights];
      updateMutual();
      tick().then(() => {
         height.set(document.getElementById("selection-content").clientHeight + 210);
      });
      await updateThumbs();
   }

   const unsubscribe = tilesStore.subscribe(async (value) => {
      tiles = value;
      update();
   });
   onDestroy(unsubscribe);

   const unsubscribe2 = tokensStore.subscribe(async (value) => {
      tokens = value;
      update();
   });
   onDestroy(unsubscribe2);

   const unsubscribe3 = wallsStore.subscribe(async (value) => {
      walls = value;
      update();
   });
   onDestroy(unsubscribe3);

   const unsubscribe4 = lightsStore.subscribe(async (value) => {
      lights = value;
      update();
   });
   onDestroy(unsubscribe4);
</script>

{#if selection.length > 1}
   <div class="ui-p-2">
      <div
         class="ui-flex ui-flex-row ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-p-2 ui-items-center ui-space-x-2 ui-cursor-move ui-my-1"
      >
         <div class="ui-input-group ui-input-group-md">
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
            <IconButton type="primary" on:click={(e) => createAction(e, tagsMutual)} size="md" icon="fa-solid:plus" />
         </div>
      </div>
   </div>
{/if}

<div class="ui-overflow-x-auto" style="height: {contentH}px;">
   <div class="ui-text-base-content ui-flex ui-flex-col ui-p-3 ui-gap-2 ui-justify-stretch" id="selection-content">
      {#if selection.length == 0}
         <div class="ui-alert ui-shadow-lg">
            <div class="ui-flex ui-flex-row ui-items-center ui-gap-2">
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="ui-stroke-info ui-flex-shrink-0 ui-w-6 ui-h-6"
                  ><path
                     stroke-linecap="round"
                     stroke-linejoin="round"
                     stroke-width="2"
                     d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  /></svg
               >
               <span class="ui-text-xl ui-text-base-content">Selection is empty</span>
            </div>
         </div>
      {/if}
      {#each selection as tile, i}
         <div class="ui-card ui-card-side ui-bg-base-100 ui-shadow-xl" id={tile.id}>
            {#if thumbs[tile.document.texture?.src || tile.data.img]}
               <figure>
                  <img
                     class="ui-h-[170px]"
                     style="border: none;"
                     src={thumbs[tile.document.texture?.src || tile.data.img]}
                     alt="Selected image"
                  />
               </figure>
            {/if}
            <div class="ui-card-body ui-p-4">
               <div class="ui-text-lg">
                  {#if tile instanceof Tile}
                     Tile: {tile.id}
                     {#if getFlag(tile, "monks-active-tiles")?.actions?.length > 0}
                        <span class="ui-badge ui-badge-primary">MATT</span>
                     {/if}
                  {:else if tile instanceof Token}
                     Token: {tile.name}
                  {:else if tile instanceof Wall}
                     {tile.document?.door > 0 || tile?.data?.door > 0 ? "Door" : "Wall"}: {tile.id}
                  {:else if tile instanceof AmbientLight}
                     Light: {tile.id}
                  {/if}
                  {#if true}
                     <span class="ui-badge">{Math.round(tile.width)}x{Math.round(tile.height)}</span>
                  {/if}
                  <span
                     class="ui-badge"
                     class:ui-badge-ghost={tile.hidden || tile.data.hidden}
                     class:ui-badge-success={!tile.hidden || tile.data.hidden}
                     on:click={() => tile.document.update({ hidden: !(tile.hidden || tile.data.hidden) })}
                  >
                     {tile.hidden || tile.data.hidden ? "hidden" : "visible"}
                  </span>
               </div>

               <div class="ui-group ui-group-md">
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
                     borderRadius=".5rem"
                  />
               </div>

               <div class="ui-card-actions ui-justify-end ui-flex-row ui-group ui-group-md">
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
