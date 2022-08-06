<svelte:options accessors={true} />

<script>
   export let elementRoot;
   import "../styles/main.scss";
   import { v4 as uuidv4 } from "uuid";

   import { setting, rgb2hex, contrastColor } from "../modules/helpers.js";
   import { moduleId, SETTINGS, tabs } from "../constants.js";
   import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
   import ActionsTab from "./components/ActionsTab.svelte";
   import TagsBar from "./components/TagsBar.svelte";
   import SelectionTab from "./components/SelectionTab.svelte";
   import SequencerTab from "./components/SequencerTab.svelte";
   import HooksTab from "./components/HooksTab.svelte";
   import ImportTab from "./components/ImportTab.svelte";
   import FaPlay from "svelte-icons/fa/FaPlay.svelte";
   import FaExpandArrowsAlt from "svelte-icons/fa/FaExpandArrowsAlt.svelte";
   import FaCompressArrowsAlt from "svelte-icons/fa/FaCompressArrowsAlt.svelte";
   import ArgInput from "./components/ArgInput.svelte";

   import { tagsStore, actions } from "../modules/stores.js";
   import Tag from "../modules/Tags.js";

   import { getContext, onDestroy, setContext } from "svelte";
   import Action from "../modules/Actions";
   import { actionTypes } from "../modules/Specs";
   const { application } = getContext("external");
   const position = application.position;
   position.scale = game.settings.get(moduleId, SETTINGS.UI_SCALE);

   let pickerOpen = false;

   let currentActions;
   const unsubscribe3 = actions.subscribe(async (actions) => {
      currentActions = actions;
   });
   onDestroy(unsubscribe3);

   let editTag;
   function onTagClick(e, tag) {
      tagsStore.update((tags) => {
         editTag = tags.find((t) => t.text == tag);
         if (!editTag) {
            editTag = new Tag(tag);
            tags.push(editTag);
         }
         return tags;
      });
      pickerOpen = !pickerOpen;
   }
   setContext("onTagClick", onTagClick);

   function createAction(_, tags) {
      actions.update((actions) => {
         actions = [Action.fromPlain({ id: uuidv4(), value: tags, type: actionTypes[0] }), ...actions];
         return actions;
      });
      mode = "actions";
   }

   let mode = setting(SETTINGS.SELECTED_TAB) || tabs[0].mode;
   function selectMode(t) {
      mode = t.mode;
      globalThis.game.settings.set(moduleId, SETTINGS.SELECTED_TAB, mode);
   }
   let availableTabs = tabs;
   if (setting(SETTINGS.HIDE_IMPORT)) {
      availableTabs = availableTabs.filter((t) => t.mode != "import");
   }

   let collapsed = setting(SETTINGS.COLLAPSED);
   function toggleCollapsed(e) {
      collapsed = e.detail;
      globalThis.game.settings.set(moduleId, SETTINGS.COLLAPSED, collapsed);
   }

   const h = Hooks.on("DirectorToggleCollapse", () => {
      collapsed = !collapsed;
      globalThis.game.settings.set(moduleId, SETTINGS.COLLAPSED, collapsed);
   });
   onDestroy(() => Hooks.off("DirectorToggleCollapse", h));

   function run(e, action) {
      Director.runAction(action.id);
   }

   function apply() {
      tagsStore.update((tags) => {
         const t = tags.find((t) => t.text == editTag.text);
         t.color = editTag.color;
         t.icon = editTag.icon;
         t.global = editTag.global;
         return tags;
      });
      pickerOpen = false;
   }
</script>

<ApplicationShell bind:elementRoot>
   <main class="director-ui">
      {#if editTag}
         <input type="checkbox" id="color-modal-actions" class="ui-modal-toggle" bind:checked={pickerOpen} />
         <label for="color-modal-actions" class="ui-modal ui-cursor-pointer">
            <div class="ui-modal-box ui-w-11/12 ui-max-w-5xl">
               <h3 class="ui-py-4 ui-font-bold ui-text-lg">Edit action</h3>
               <div class="ui-flex ui-flex-row ui-items-center ui-gap-2">
                  <div class="ui-flex ui-flex-row ui-flex-1 ui-items-center ui-gap-2 ui-flex-wrap">
                     <ArgInput
                        type="color"
                        label="color"
                        bind:value={editTag.color}
                        hideSign={true}
                        widthAuto={true}
                        defaultValue="#46525D"
                     />
                     <ArgInput type="icon" label="icon" bind:value={editTag.icon} hideSign={true} widthAuto={true} />
                     <ArgInput
                        type="bool"
                        label="global"
                        bind:value={editTag.global}
                        hideSign={true}
                        widthAuto={true}
                     />
                     <!-- <ArgInput type="string" label="text" bind:value={editTag.text} hideSign={true} widthAuto={true}> -->
                     <!--    <span slot="right">Text changing will create new tag</span> -->
                     <!-- </ArgInput> -->
                  </div>
                  <div class="ui-flex ui-flex-none">
                     <span
                        class="ui-badge ui-badge-lg ui-p-4 !ui-text-2xl"
                        style:background-color={editTag.color}
                        style:color={contrastColor(editTag.color)}
                     >
                        {#if editTag.icon}
                           <iconify-icon
                              style:font-size="1.5rem"
                              style:margin-right="0.5rem"
                              icon={editTag.icon}
                              style:color={contrastColor(editTag.color)}
                           />
                        {/if}

                        {editTag.text}
                     </span>
                  </div>
               </div>
               <div class="ui-modal-action">
                  <label for="seq-modal" class="ui-btn ui-btn-primary" on:click={(_) => apply()}>Save</label>
               </div>
            </div>
         </label>
      {/if}

      {#if !collapsed}
         <TagsBar {onTagClick} on:collapsed={toggleCollapsed} />
         <div class="ui-tabs ui-tabs-boxed">
            {#each availableTabs as t (t.title)}
               <!-- <div class="ui-indicator"> -->
               <a class="ui-tab ui-tab-lg" on:click={() => selectMode(t)} class:ui-tab-active={t.mode == mode}>
                  {t.title}
                  {#if t.badge}
                     {@html t.badge}
                  {/if}
               </a>
               <!-- </div> -->
            {/each}
         </div>

         {#if mode == "selection"}
            <SelectionTab {createAction} />
         {/if}
         {#if mode == "actions"}
            <ActionsTab onSelect={() => (mode = "selection")} />
         {/if}
         {#if mode == "sequencer"}
            <SequencerTab />
         {/if}
         {#if mode == "hooks"}
            <HooksTab />
         {/if}
         {#if mode == "import"}
            <ImportTab />
         {/if}
      {:else}
         <div class="ui-flex ui-flex row ui-gap-2 ui-p-2 ui-bg-base-100">
            <div class="ui-flex ui-flex row flex-1 ui-items-center ui-justify-center ui-w-full">
               {#each currentActions as item (item.id)}
                  {#if !item.hidden}
                     <div
                        class="ui-tooltip ui-tooltip-left ui-tooltip-primary"
                        data-tip={item.name || item.id}
                        style="--tooltip-color: {item.color || '#46525D'}; --tooltip-text-color: {contrastColor(
                           item.color
                        )};"
                     >
                        <button
                           class="ui-btn ui-btn-square"
                           on:pointerdown|preventDefault|stopPropagation={() => null}
                           on:click={(e) => run(e, item)}
                           style:background-color={item.color}
                           style:color={contrastColor(item.color)}
                           class:!ui-p-[8px]={!item.icon}
                        >
                           {#if item.icon}
                              <iconify-icon
                                 style:font-size="2rem"
                                 icon={item.icon}
                                 style:color={contrastColor(item.color)}
                              />
                           {:else}
                              <FaPlay />
                           {/if}
                        </button>
                     </div>
                  {/if}
               {/each}
            </div>
            <div class="ui-flex ui-flex-none">
               <button
                  title="toggle collapsed"
                  class="ui-btn ui-btn-square ui-justify-self-end !ui-p-[8px]"
                  class:ui-btn-outline={!collapsed}
                  on:click={(e) => toggleCollapsed({ detail: !collapsed })}
               >
                  {#if collapsed}
                     <FaExpandArrowsAlt />
                  {:else}
                     <FaCompressArrowsAlt />
                  {/if}
               </button>
            </div>
         </div>
      {/if}
   </main>
</ApplicationShell>
