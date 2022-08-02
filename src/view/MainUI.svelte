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

   import { HsvPicker } from "svelte-color-picker";

   import { tagColors, actions } from "../modules/stores.js";

   import { getContext, onDestroy, setContext } from "svelte";
   import Action from "../modules/Actions";
   const { application } = getContext("external");
   const position = application.position;
   position.scale = game.settings.get(moduleId, SETTINGS.UI_SCALE);

   let pickerOpen = false;
   let startColor;

   let currentActions;
   const unsubscribe3 = actions.subscribe(async (actions) => {
      currentActions = actions;
   });
   onDestroy(unsubscribe3);

   let editTag;
   function onTagClick(e, tag) {
      editTag = tag;
      tagColors.update((tagColors) => {
         startColor = editTag && editTag in tagColors ? tagColors[editTag].slice(0, 7) : "#232323";
         pickerOpen = !pickerOpen;
         return tagColors;
      });
   }
   setContext("onTagClick", onTagClick);

   function createAction(_, tags) {
      actions.update((actions) => {
         actions = [Action.fromPlain({ id: uuidv4(), value: tags, type: "" }), ...actions];
         return actions;
      });
      mode = "actions";
   }

   function changeColor(e) {
      if (editTag) {
         const c = e.detail;
         tagColors.update((cols) => {
            cols[editTag] = rgb2hex(c).hex;
            return cols;
         });
      }
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
</script>

<input type="checkbox" id="color-modal" class="ui-modal-toggle" bind:checked={pickerOpen} />
<label for="color-modal" class="ui-modal ui-cursor-pointer">
   <label class="ui-modal-box ui-relative ui-w-fit" for="">
      {#if pickerOpen}
         <HsvPicker on:colorChange={changeColor} startColor={startColor.slice(0, 7)} />
      {/if}
   </label>
</label>

<ApplicationShell bind:elementRoot>
   <main class="director-ui">
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
