<script>
   import Tags from "crew-components/Tags";
   import IconButton from "crew-components/IconButton";
   import { globalTags, tagsStore } from "../../modules/stores.js";
   import { SETTINGS } from "../../constants.js";
   import { setting } from "crew-components/helpers";
   import { createEventDispatcher } from "svelte";
   const dispatch = createEventDispatcher();

   function onTags(event) {
      const tags = event.detail.tags.filter((t) => t.trim() != "");
      globalTags.set(tags);
   }

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
         />
      </div>
   </div>
   <div class="ui-flex ui-flex-row ui-gap-2 ui-flex-none ui-group-md ui-group">
      {#if globalThis.tokenAttacher}
         <IconButton on:click={globalThis.tokenAttacher.toggleQuickEditMode} icon="fa-solid:feather-alt" />
      {/if}
      <div class="ui-btn-group">
         <IconButton
            type="primary"
            on:click={() => new globalThis.Sequencer.DatabaseViewer().render(true)}
            icon="fa-solid:database"
         />
         <IconButton type="primary" on:click={globalThis.Sequencer.EffectManager.show} icon="fa-solid:film" />
      </div>

      <button
         title="toggle collapsed"
         class="ui-btn ui-btn-square"
         class:ui-btn-outline={!collapsed}
         on:click={(e) => toggleCollapsed()}
      >
         {#if collapsed}
            <iconify-icon icon="fa-solid:expand-arrows-alt" class="ui-text-xl" />
         {:else}
            <iconify-icon icon="fa-solid:compress-arrows-alt" class="ui-text-xl" />
         {/if}
      </button>
   </div>
</div>
