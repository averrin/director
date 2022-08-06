<script>
   import Tags from "./Tags.svelte";
   import { globalTags, tagsStore } from "../../modules/stores.js";
   import FaFeatherAlt from "svelte-icons/fa/FaFeatherAlt.svelte";
   import FaDatabase from "svelte-icons/fa/FaDatabase.svelte";
   import FaFilm from "svelte-icons/fa/FaFilm.svelte";
   import FaExpandArrowsAlt from "svelte-icons/fa/FaExpandArrowsAlt.svelte";
   import FaCompressArrowsAlt from "svelte-icons/fa/FaCompressArrowsAlt.svelte";
   import { SETTINGS } from "../../constants.js";
   import { createEventDispatcher } from "svelte";
   const dispatch = createEventDispatcher();

   function onTags(event) {
      const tags = event.detail.tags.filter((t) => t.trim() != "");
      globalTags.set(tags);
   }

   import { getContext } from "svelte";
   import { setting } from "../../modules/helpers";
   const onTagClick = getContext("onTagClick");

   let collapsed = setting(SETTINGS.COLLAPSED);
   function toggleCollapsed() {
      collapsed = !collapsed;
      dispatch("collapsed", collapsed);
   }
</script>

<div class="ui-navbar ui-bg-base-100 ui-gap-3">
   <div class="ui-flex ui-flex-1">
      <div class="ui-w-full">
         <Tags
            allowPaste={true}
            allowDrop={true}
            onlyUnique={true}
            splitWith={","}
            placeholder="Tag"
            on:tags={onTags}
            tags={$globalTags}
            borderRadius="0.5rem"
            autoComplete={$tagsStore.map((t) => t.text)}
            {onTagClick}
         />
      </div>
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

      <button
         title="toggle collapsed"
         class="ui-btn ui-btn-square ui-justify-self-end !ui-p-[8px]"
         class:ui-btn-outline={!collapsed}
         on:click={(e) => toggleCollapsed()}
      >
         {#if collapsed}
            <FaExpandArrowsAlt />
         {:else}
            <FaCompressArrowsAlt />
         {/if}
      </button>
   </div>
</div>
