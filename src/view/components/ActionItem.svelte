<script>
   import Select from "svelte-select";
   import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
   import { actionTypes, argSpecs } from "../../modules/Specs.js";
   import ArgInput from "./ArgInput.svelte";
   import { sequences, hooks } from "../../modules/stores.js";
   import FaBan from "svelte-icons/fa/FaBan.svelte";
   import { contrastColor } from "../../modules/helpers.js";
   import FaExpandArrowsAlt from "svelte-icons/fa/FaExpandArrowsAlt.svelte";
   import FaCompressArrowsAlt from "svelte-icons/fa/FaCompressArrowsAlt.svelte";
   import FaExpand from "svelte-icons/fa/FaExpand.svelte";
   import FaPlay from "svelte-icons/fa/FaPlay.svelte";
   import GiFishingHook from "svelte-icons/gi/GiFishingHook.svelte";
   import FaExclamationTriangle from "svelte-icons/fa/FaExclamationTriangle.svelte";
   import FaArrowsAlt from "svelte-icons/fa/FaArrowsAlt.svelte";
   import FaTimes from "svelte-icons/fa/FaTimes.svelte";

   import { createEventDispatcher } from "svelte";

   const dispatch = createEventDispatcher();

   export let item;

   export let selectAction;
   export let deleteAction;
   export let onTagClick;
   export let actionTags;
   export let itemClick;

   let types = actionTypes;

   function setType(e) {
      if (typeof e.detail !== "string" || item?.type?.id == e.detail) return;
      item.type = { ...actionTypes.find((t) => t.id == e.detail) };
      delete item.type.execute;
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

   function onItemClickHandler(event, item) {
      if (event.which == 3) {
         itemClick(item);
      }
   }
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
</script>

<div
   class="ui-border-2 ui-border-solid ui-flex ui-flex-col ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-items-center ui-my-1 ui-gap-3"
   style:border-color={item.color || "#ffffff"}
   on:pointerdown={(e) => onItemClickHandler(e, item)}
>
   <div class="ui-flex ui-flex-row ui-items-center ui-gap-3 ui-w-full ui-justify-start">
      <div class="ui-flex ui-flex-1 ui-gap-3">
         <button
            class="ui-btn ui-btn-square ui-btn-ghost handle ui-justify-self-start ui-cursor-move"
            style="color: #46525d; padding: 8px"
            title="move"
         >
            <FaArrowsAlt />
         </button>
         <ArgInput hideSign={true} type="string" bind:value={item.name} widthAuto={true} label="Name">
            <svelte:fragment slot="right">
               {#if item.valueType == "hook" && hook}
                  {#if !hook?.enabled}
                     <span style:color="indianred" title="hook is disabled" class="ui-h-12 ui-w-16">
                        <FaExclamationTriangle />
                     </span>
                  {:else}
                     <span style:color="#232323" title="hook is enabled" class="ui-h-12 ui-w-16">
                        <GiFishingHook />
                     </span>
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
         />
      </div>
      <div class="ui-btn-group ui-justify-self-end ui-flex-none">
         <button
            title="toggle collapsed"
            class="ui-btn ui-btn-square ui-justify-self-end !ui-p-[8px]"
            class:ui-btn-outline={!item.collapsed}
            on:click={(e) => toggleCollapsed(item)}
         >
            {#if item.collapsed}
               <FaExpandArrowsAlt />
            {:else}
               <FaCompressArrowsAlt />
            {/if}
         </button>
         <button
            title="execute action"
            class="ui-btn ui-btn-square !ui-p-[8px]"
            on:click={(e) => item.run(e)}
            style:background-color={item.color}
            style:color={contrastColor(item.color)}
         >
            <FaPlay />
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
               {onTagClick}
               widthAuto={true}
               additionalItems={currentHooks}
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
                  />
               {/each}
            {/if}
         </div>

         <div class="ui-btn-group ui-justify-self-end ui-flex-none">
            {#if Array.isArray(item.value) || item.value?.startsWith("#")}
               <button
                  title="select target"
                  class="ui-btn ui-btn-square ui-btn-outline !ui-p-[8px]"
                  on:click={(e) => selectAction(e, item.id)}
               >
                  <FaExpand />
               </button>
            {/if}

            <button
               class="ui-btn ui-btn-outline ui-btn-error ui-btn-square !ui-p-[8px]"
               on:click={(e) => deleteAction(e, item.id)}
            >
               <FaTimes />
            </button>
         </div>
      </div>
   {/if}
</div>
