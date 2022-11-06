<svelte:options accessors={true} />

<script>
   import AlphaShell from "crew-components/AlphaShell";
   export let id = "director";

   export let elementRoot;
   import "../main.scss";
   import { v4 as uuidv4 } from "uuid";

   import { isPremium } from "crew-components/premium";
   import { setting, contrastColor } from "crew-components/helpers";
   import { moduleId, SETTINGS, tabs } from "../constants.js";
   import ActionsTab from "./components/ActionsTab.svelte";
   import TagsBar from "./components/TagsBar.svelte";
   import SelectionTab from "./components/SelectionTab.svelte";
   import SequencerTab from "./components/SequencerTab.svelte";
   import HooksTab from "./components/HooksTab.svelte";
   import ImportTab from "./components/ImportTab.svelte";
   import TagSettings from "crew-components/TagSettings";
   import CollapseButton from "crew-components/CollapseButton";
   import PremiumSettings from "./components/PremiumSettings.svelte";
   import EffectsTab from "./components/EffectsTab.svelte";

   import { getContext, onDestroy, setContext, tick } from "svelte";
   import { tagsStore, actions } from "../modules/stores.js";
   setContext("tagsStore", tagsStore);

   import Tag from "crew-components/tags";

   import Action from "../modules/Actions";
   import { actionTypes } from "../modules/Specs";
   const { application } = getContext("external");
   const position = application.position;
   position.scale = game.settings.get(moduleId, SETTINGS.UI_SCALE);

   let currentActions;
   const unsubscribe3 = actions.subscribe(async (actions) => {
      currentActions = actions;
   });
   onDestroy(unsubscribe3);

   let editTag;
   function onTagRClick(e, tag) {
      editTag = $tagsStore.find((t) => t.text == tag);
      if (!editTag) {
         editTag = new Tag(tag);
      }
      logger.info(e, tag, editTag);
   }
   setContext("tagRClick", onTagRClick);

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
   if (!isPremium()) {
      // availableTabs = availableTabs.filter((t) => !t.premium);
   }

   const { height } = position.stores;

   let collapsed = setting(SETTINGS.COLLAPSED);
   function toggleCollapsed(e) {
      // tick().then((_) => {
      height.set(e.detail ? document.getElementById("action-bar").clientHeight + 32 : 800);
      collapsed = e.detail;
      globalThis.game.settings.set(moduleId, SETTINGS.COLLAPSED, collapsed);
      // });
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

<AlphaShell bind:elementRoot {id} fullHeight={true}>
   <TagSettings {editTag} showGlobalSetting={true} />
   {#if !collapsed}
      <TagsBar on:collapsed={toggleCollapsed} />
      <div class="ui-tabs ui-tabs-boxed ui-rounded-none">
         {#each availableTabs as t (t.title)}
            <!-- <div class="ui-indicator"> -->
            <a
               class="ui-tab ui-tab-md ui-flex ui-flex-row ui-items-center ui-gap-1"
               on:click={() => selectMode(t)}
               class:ui-tab-active={t.mode == mode}
            >
               {#if t.premium && !isPremium()}
                  <span title="This setting is Patreon-only">
                     <iconify-icon icon="fa6-solid:crown" />
                  </span>
               {/if}
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
      {#if mode == "effects"}
         <EffectsTab />
         {#if !isPremium()}
            <PremiumSettings />
         {/if}
      {/if}
   {:else}
      <div class="ui-flex ui-flex row ui-gap-2 ui-p-2 ui-bg-base-100" id="action-bar">
         <div
            class="ui-flex ui-flex ui-flex-row flex-1 ui-items-center ui-justify-center ui-w-full ui-gap-1 ui-group ui-group-md"
         >
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
                        title={item.name || item.id}
                     >
                        <iconify-icon
                           style:font-size="2rem"
                           icon={item.icon || "fa-solid:play"}
                           style:color={contrastColor(item.color)}
                        />
                     </button>
                  </div>
               {/if}
            {/each}
         </div>
         <div class="ui-flex ui-flex-none ui-group ui-group-md">
            <CollapseButton on:click={(e) => toggleCollapsed({ detail: !collapsed })} {collapsed} />
         </div>
      </div>
   {/if}
</AlphaShell>
