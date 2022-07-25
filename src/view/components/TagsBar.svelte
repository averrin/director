<script>
   import Tags from "./Tags.svelte";
   import { globalTags, tagColors } from "../../modules/stores.js";
   import FaFeatherAlt from "svelte-icons/fa/FaFeatherAlt.svelte";
   import FaDatabase from "svelte-icons/fa/FaDatabase.svelte";
   import FaFilm from "svelte-icons/fa/FaFilm.svelte";

   export let onTagClick;

   function onTags(event) {
      const tags = event.detail.tags.filter((t) => t.trim() != "");
      globalTags.set(tags);
   }
</script>

<div class="ui-navbar ui-bg-base-100 ui-gap-3">
   <div class="ui-flex ui-flex-1">
      <Tags
         allowPaste={true}
         allowDrop={true}
         onlyUnique={true}
         splitWith={","}
         placeholder="Tag"
         on:tags={onTags}
         tags={$globalTags}
         colors={$tagColors}
         {onTagClick}
         borderRadius="0.5rem"
      />
   </div>
   <div class="ui-flex ui-flex-row ui-gap-2 ui-flex-none">
      {#if globalThis.tokenAttacher}
         <button class="ui-btn ui-btn-square !ui-p-[8px]" on:click={globalThis.tokenAttacher.toggleQuickEditMode}>
            <FaFeatherAlt />
         </button>
      {/if}
      <div class="ui-btn-group">
         <button
            class="ui-btn ui-btn-square !ui-p-[8px]"
            on:click={() => new globalThis.Sequencer.DatabaseViewer().render(true)}
         >
            <FaDatabase />
         </button>
         <button class="ui-btn ui-btn-square !ui-p-[8px]" on:click={globalThis.Sequencer.EffectManager.show}>
            <FaFilm />
         </button>
      </div>
   </div>
</div>
