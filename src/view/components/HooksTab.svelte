<script>
   import ArgInput from "crew-components/ArgInput";
   import IconButton from "crew-components/IconButton";
   import RemoveButton from "crew-components/RemoveButton";
   import CollapseButton from "crew-components/CollapseButton";
   import { hooks } from "../../modules/stores.js";
   import { onDestroy, getContext } from "svelte";
   import { v4 as uuidv4 } from "uuid";
   import Hook from "../../modules/Hooks.js";
   import { hookSpecs } from "../../modules/Specs.js";
   import exportFromJSON from "export-from-json";
   import { setting } from "crew-components/helpers";
   import { SETTINGS } from "../../constants.js";

   const { application } = getContext("external");
   const position = application.position;
   const { height } = position.stores;
   let contentH = $height;
   onDestroy(height.subscribe((h) => (contentH = h - 128)));

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

<div class="ui-p-2 ui-overflow-x-auto" style="height: {contentH}px;">
   <div class="ui-flex ui-flex-row ui-items-center ui-gap-2 ui-group ui-group-md">
      <button class="ui-my-2 ui-btn  ui-btn-outline ui-flex-1" on:click={(e) => addHook()}>Add Hook</button>
      {#if !setting(SETTINGS.HIDE_IMPORT)}
         <IconButton icon="fa6-solid:file-export" title="Export" on:click={exportHooks} />
      {/if}
   </div>
   {#each currentHooks as hook (hook.id)}
      <div
         class="ui-flex ui-flex-col ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-p-2 ui-my-1 ui-items-start ui-gap-2 ui-justify-start"
         id={hook.id}
      >
         <div class="ui-flex ui-flex-row ui-items-start ui-gap-3 ui-w-full ui-group">
            <div class="ui-flex ui-flex-row ui-items-start ui-gap-3 ui-w-full">
               <ArgInput
                  hideSign={true}
                  widthAuto={true}
                  bind:value={hook.enabled}
                  type="bool"
                  label=""
                  on:change={saveHooks}
                  size="xs"
               />
               <ArgInput
                  hideSign={true}
                  bind:value={hook.name}
                  type="string"
                  label="Name"
                  on:change={saveHooks}
                  size="xs"
               />

               <ArgInput
                  hideSign={true}
                  bind:value={hook.event}
                  type="hook"
                  justify="end"
                  label="Event"
                  on:change={saveHooks}
                  size="xs"
               />
            </div>
            <div class="ui-flex-none ui-btn-group ui-btn-group-xs">
               <CollapseButton on:click={(e) => toggleCollapsed(hook)} collapsed={hook.collapsed} />
               <RemoveButton on:click={(e) => deleteHook(hook.id)} />
            </div>
         </div>
         {#if !hook.collapsed}
            <div class="ui-flex ui-flex-row ui-items-center ui-gap-3 ui-w-full ui-justify-start">
               <div class="ui-flex ui-flex-row ui-items-center ui-gap-3 ui-flex-1 ui-flex-wrap">
                  <ArgInput
                     hideSign={true}
                     bind:value={hook.target}
                     type="targets"
                     label="Target"
                     on:change={saveHooks}
                     widthAuto={true}
                     size="xs"
                  />
                  {#if hookSpecs.find((s) => s.id == hook.event)?.args}
                     {#each hookSpecs.find((s) => s.id == hook.event)?.args as arg, i}
                        <ArgInput
                           hideSign={true}
                           bind:value={hook.args[i]}
                           type={arg.type}
                           label={arg.label}
                           on:change={saveHooks}
                           size="xs"
                        />
                     {/each}
                  {/if}
               </div>
               <div class="ui-flex ui-flex-none">
                  <ArgInput
                     type="bool"
                     label="global"
                     bind:value={hook.global}
                     hideSign={true}
                     widthAuto={true}
                     on:change={saveHooks}
                     size="xs"
                  />
               </div>
            </div>
         {/if}
      </div>
   {/each}
</div>
