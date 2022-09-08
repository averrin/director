<script>
   import { actionTypes } from "../../modules/Specs.js";
   import ArgInput from "crew-components/ArgInput";
   import IconButton from "crew-components/IconButton";
   import CopyButton from "crew-components/CopyButton";
   import CollapseButton from "crew-components/CollapseButton";
   import RemoveButton from "crew-components/RemoveButton";
   import { hooks } from "../../modules/stores.js";
   import { contrastColor } from "crew-components/helpers";
   import { loadIcon } from "iconify-icon";
   import { createEventDispatcher } from "svelte";
   const dispatch = createEventDispatcher();

   export let item;
   if (item.icon) loadIcon(item.icon);

   export let selectAction;
   export let deleteAction;
   export let actionTags;
   export let itemClick;

   let types = actionTypes;
   let spec = actionTypes.find((t) => t.id == item?.type?.id);

   function setType(e) {
      if (typeof e.detail !== "string" || item?.type?.id == e.detail) return;
      item.type = { ...actionTypes.find((t) => t.id == e.detail) };
      delete item.type.execute;
      item.args = [];
      spec = actionTypes.find((t) => t.id == item?.type?.id);
      dispatch("change", item);
   }

   let currentHooks;
   const unsubscribe1 = hooks.subscribe((hooks) => {
      currentHooks = [];
      for (const hook of hooks) {
         currentHooks.push({ value: hook.id, label: `Hook: ${hook.name}`, group: "Hooks", enabled: hook.enabled });
      }
   });
   unsubscribe1();

   let hook = currentHooks.find((h) => h.value == item.value);

   if (!item.type) {
      item.type = types[0];
   }

   function toggleCollapsed(item) {
      item.collapsed = !item.collapsed;
      dispatch("change", item);
   }

   function changeTargets(e) {
      actionTags(e, item.id);
      hook = currentHooks.find((h) => h.value == item.value);
      dispatch("change", item);
   }

   function onChange() {
      dispatch("change", item);
   }

   const oneliner = `Director.runAction("${item.name || item.id}");`;
</script>

{#if item}
<div
   id={item.id}
   class="ui-border-2 ui-border-solid ui-flex ui-flex-col ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-p-2 ui-items-center ui-gap-2 ui-mb-1"
   style:border-color={item.color || "hsl(var(--b3))"}
>
   <div class="ui-flex ui-flex-row ui-items-center ui-gap-3 ui-w-full ui-justify-start">
      <div class="ui-flex ui-flex-1 ui-gap-3 ui-group ui-group-md">
         <IconButton
            title="move"
            style="color: #46525d"
            icon="fa-solid:arrows-alt"
            cls="handle"
            type="ghost ui-cursor-move"
         />
         <ArgInput hideSign={true} type="string" bind:value={item.name} widthAuto={true} label="Name">
            <svelte:fragment slot="right">
               {#if item.valueType == "hook" && hook}
                  {#if !hook?.enabled}
                     <IconButton
                        style="color: indianred"
                        icon="fa-solid:exclamation-triangle"
                        type="ghost"
                        title="hook is disabled"
                        cls="ui-border"
                     />
                  {:else}
                     <IconButton
                        style="color: #232323"
                        icon="openmoji:hook"
                        type="ghost"
                        title="hook is enabled"
                        cls="ui-border"
                     />
                  {/if}
               {/if}
            </svelte:fragment>
         </ArgInput>

         <ArgInput
            hideSign={true}
            type="action-type"
            value={item.type}
            widthAuto={true}
            label="Type"
            on:change={setType}
         >
            <svelte:fragment slot="right">
               {#if spec?.ignoreTarget}
                  <IconButton
                     style="color: #232323"
                     icon="tabler:target-off"
                     type="ghost"
                     title="targets are ignored"
                     cls="ui-border"
                  />
               {/if}
            </svelte:fragment>
         </ArgInput>
      </div>
      <div class="ui-btn-group ui-btn-group-md ui-justify-self-end ui-flex-none">
         <CollapseButton on:click={(e) => toggleCollapsed(item)} collapsed={item.collapsed} />
         <button
            title="execute action"
            class="ui-btn ui-btn-md ui-btn-square"
            on:click={(e) => item.run(e)}
            style:background-color={item.color}
            style:color={contrastColor(item.color)}
         >
            {#if item.icon}
               <iconify-icon style:font-size="2rem" icon={item.icon} style:color={contrastColor(item.color)} />
            {:else}
               <iconify-icon class="ui-text-lg" icon="fa-solid:play" />
            {/if}
         </button>
      </div>
   </div>
   {#if !item.collapsed}
      <div class="ui-flex ui-flex-row ui-items-center ui-gap-3 ui-w-full ui-justify-start">
         <div class="ui-flex ui-flex-1 ui-gap-3">
            <ArgInput
               hideSign={true}
               label="Target"
               type="targets"
               bind:value={item.value}
               on:change={changeTargets}
               selectFull={true}
               widthAuto={true}
               additionalItems={currentHooks}
               size="xs"
            />

            {#if item?.type?.args}
               {#each item?.type?.args as arg, i}
                  <ArgInput
                     extra={item}
                     hideSign={true}
                     type={arg.type}
                     bind:value={item.args[i]}
                     widthAuto={true}
                     label={arg.label}
                     on:change={onChange}
                     size="xs"
                  />
               {/each}
            {/if}
         </div>

         <div class="ui-btn-group ui-btn-group-xs ui-justify-self-end ui-flex-none">
            <IconButton title="edit" on:click={(_) => itemClick(item)} icon="fa-solid:edit" />
            <CopyButton
               type="outline"
               title="Copy oneliner"
               text={oneliner}
               notification="Oneliner copied!"
               icon="fa6-solid:copy"
            />

            {#if Array.isArray(item.value) || item.value?.startsWith("#")}
               <IconButton title="select target" on:click={(e) => selectAction(e, item.id)} icon="fa-solid:expand" />
            {/if}

            <RemoveButton on:click={(e) => deleteAction(item?.id)} />
         </div>
      </div>
   {/if}
</div>
{/if}
