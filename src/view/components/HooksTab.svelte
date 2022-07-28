<script>
   import ArgInput from "./ArgInput.svelte";
   import { hooks } from "../../modules/stores.js";
   import { onDestroy } from "svelte";
   import { v4 as uuidv4 } from "uuid";
   import Hook from "../../modules/Hooks.js";
   import FaExpandArrowsAlt from "svelte-icons/fa/FaExpandArrowsAlt.svelte";
   import FaCompressArrowsAlt from "svelte-icons/fa/FaCompressArrowsAlt.svelte";
   import { hookSpecs } from "../../modules/Specs.js";
   import exportFromJSON from "export-from-json";
   import FaFileExport from "svelte-icons/fa/FaFileExport.svelte";
   import { setting } from "../../modules/helpers.js";
   import { SETTINGS } from "../../constants.js";
   import FaTimes from "svelte-icons/fa/FaTimes.svelte";

   let currentHooks;
   const unsubscribe3 = hooks.subscribe((hooks) => {
      currentHooks = hooks;
   });
   onDestroy(unsubscribe3);

   function exportHooks() {
      const fileName = `director-hooks`;
      const exportType = exportFromJSON.types.json;
      exportFromJSON({ data: currentHooks, fileName, exportType });
   }

   function addHook() {
      currentHooks = [new Hook(uuidv4(), "New Hook"), ...currentHooks];
      hooks.set(currentHooks);
   }
   function deleteHook(id) {
      currentHooks = currentHooks.filter((h) => h.id != id);
      hooks.set(currentHooks);
   }
   function saveHooks() {
      // debounce(() => hooks.set(currentHooks), 50);
      hooks.set(currentHooks);
   }

   function toggleCollapsed(item) {
      item.collapsed = !item.collapsed;
      hooks.set(currentHooks);
   }
</script>

<div class="ui-p-2">
   <div class="ui-flex ui-flex-row ui-items-center ui-gap-2">
      <button class="ui-my-2 ui-btn ui-btn-outline ui-btn-primary ui-flex-1" on:click={(e) => addHook()}
         >Add Hook</button
      >
      {#if !setting(SETTINGS.HIDE_IMPORT)}
         <button class="ui-btn ui-btn-square !ui-p-2 ui-flex-none ui-btn-outline" title="Export" on:click={exportHooks}>
            <FaFileExport />
         </button>
      {/if}
   </div>
   {#each currentHooks as hook (hook.id)}
      <div
         class="ui-flex ui-flex-col ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-my-1 ui-items-start ui-gap-3 ui-justify-start"
      >
         <div class="ui-flex ui-flex-row ui-items-start ui-gap-3 ui-w-full">
            <ArgInput
               hideSign={true}
               widthAuto={true}
               bind:value={hook.enabled}
               type="bool"
               label=""
               on:change={saveHooks}
            />
            <ArgInput hideSign={true} bind:value={hook.name} type="string" label="Name" on:change={saveHooks} />

            <ArgInput
               hideSign={true}
               bind:value={hook.event}
               type="hook"
               justify="end"
               label="Event"
               on:change={saveHooks}
            />
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
               <button
                  class="ui-btn ui-btn-outline ui-btn-error ui-btn-square !ui-p-[8px]"
                  on:click={(e) => deleteHook(hook.id)}
               >
                  <FaTimes />
               </button>
            </div>
         </div>
         {#if !hook.collapsed}
            <div class="ui-flex ui-flex-row ui-items-center ui-gap-3 ui-w-full ui-justify-start">
               <ArgInput
                  hideSign={true}
                  bind:value={hook.target}
                  type="targets"
                  label="Target"
                  on:change={saveHooks}
                  widthAuto={true}
               />
               {#if hookSpecs.find((s) => s.id == hook.event)?.args}
                  {#each hookSpecs.find((s) => s.id == hook.event)?.args as arg, i}
                     <ArgInput
                        hideSign={true}
                        bind:value={hook.args[i]}
                        type={arg.type}
                        label={arg.label}
                        on:change={saveHooks}
                     />
                  {/each}
               {/if}
            </div>
         {/if}
      </div>
   {/each}
</div>
