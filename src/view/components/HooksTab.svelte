<script>
   import ArgInput from "./ArgInput.svelte";
   import { hooks } from "../../modules/stores.js";
   import { onDestroy } from "svelte";
   import { v4 as uuidv4 } from "uuid";
   import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
   import Hook from "../../modules/Hooks.js";
   import FaExpandArrowsAlt from "svelte-icons/fa/FaExpandArrowsAlt.svelte";
   import FaCompressArrowsAlt from "svelte-icons/fa/FaCompressArrowsAlt.svelte";

   export let onTagClick;

   let currentHooks;
   const unsubscribe3 = hooks.subscribe((hooks) => {
      currentHooks = hooks;
   });
   onDestroy(unsubscribe3);

   function addHook() {
      currentHooks = [new Hook(uuidv4(), "New Hook"), ...currentHooks];
      hooks.set(currentHooks);
   }
   function deleteHook(id) {
      currentHooks = currentHooks.filter((h) => h.id != id);
      hooks.set(currentHooks);
   }
   function saveHooks() {
      hooks.set(currentHooks);
   }

   function toggleCollapsed(item) {
      item.collapsed = !item.collapsed;
      hooks.set(currentHooks);
   }
</script>

<div>
   <button class="ui-my-2 ui-btn ui-btn-outline ui-btn-primary ui-w-full" on:click={(e) => addHook()}>Add Hook</button>
</div>
<div class="ui-p-2">
   {#each currentHooks as hook (hook.id)}
      <div
         class="ui-flex ui-flex-col ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-my-1 ui-items-start ui-gap-3 ui-justify-start"
      >
         <div class="ui-flex ui-flex-row ui-items-center ui-gap-3 ui-w-full">
            <ArgInput
               hideSign={true}
               widthAuto={true}
               bind:value={hook.enabled}
               type="bool"
               label=""
               on:change={saveHooks}
            />
            <ArgInput hideSign={true} bind:value={hook.name} type="string" label="Name" on:change={saveHooks} />

            <div class="ui-flex-none ui-btn-group">
               <button
                  style="padding: 8px"
                  class="ui-btn ui-btn-square ui-justify-self-end"
                  class:ui-btn-outline={!hook.collapsed}
                  on:click={(e) => toggleCollapsed(hook)}
               >
                  {#if hook.collapsed}
                     <FaExpandArrowsAlt />
                  {:else}
                     <FaCompressArrowsAlt />
                  {/if}
               </button>
               <button class="ui-btn ui-btn-outline ui-btn-error ui-btn-square" on:click={(e) => deleteHook(hook.id)}>
                  <XIcon class="ui-h-8 ui-w-8" />
               </button>
            </div>
         </div>
         {#if !hook.collapsed}
            <div class="ui-flex ui-flex-row ui-items-center ui-gap-3 ui-w-full ui-px-3 ui-justify-center">
               <ArgInput
                  hideSign={true}
                  bind:value={hook.target}
                  type="targets"
                  label="Target"
                  on:change={saveHooks}
                  {onTagClick}
               />
               <ArgInput hideSign={true} bind:value={hook.event} type="hook" label="Event" on:change={saveHooks} />
            </div>
         {/if}
      </div>
   {/each}
</div>
