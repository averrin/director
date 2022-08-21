<script>
   import { contrastColor } from "../../modules/helpers.js";
   import { createEventDispatcher } from "svelte";
   const dispatch = createEventDispatcher();

   export let tag;
   export let compact = false;
</script>

<span
   class="tag ui-gap-1 ui-cursor-pointer"
   draggable={true}
   on:dragstart
   on:pointerdown
   style:background-color={tag.color}
   style:color={contrastColor(tag.color)}
   title={tag.text}
   class:compact
>
   {#if tag.icon}
      <iconify-icon icon={tag.icon} style:color={contrastColor(tag.color)} class:compact />
   {/if}

   {#if !tag.icon || !compact}
      {tag.text}
   {/if}
   {#if !compact}
      <iconify-icon
         class="ui-h-4 ui-w-4 ui-cursor-pointer tag-remove"
         icon="gridicons:cross"
         style:color={contrastColor(tag.color)}
         on:click={() => dispatch("remove", tag)}
      />
   {/if}
</span>

<style>
   .tag {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans",
         "Droid Sans", "Helvetica Neue", sans-serif;
      display: flex;
      white-space: nowrap;
      list-style: none;
      background: hsl(var(--n) / var(--tw-bg-opacity));
      color: #fff;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: bold;
      padding: 0px 0.4rem;
      height: unset !important;
      align-items: center;
   }

   .tag.compact {
      font-size: 0.8rem;
   }

   .tag-remove {
      cursor: pointer;
      font-size: 16px;
   }
   iconify-icon {
      font-size: 1.2rem;
   }

   iconify-icon.compact {
      margin: 2px 0px !important;
      font-size: 1rem;
   }
</style>
