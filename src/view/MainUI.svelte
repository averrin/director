<svelte:options accessors={true} />

<script>
   export let elementRoot;
   import "../styles/main.scss";
   import { v4 as uuidv4 } from "uuid";

   import { setting } from "../modules/helpers.js";
   import { moduleId, SETTINGS, tabs } from "../constants.js";
   import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
   import ActionsTab from "./components/ActionsTab.svelte";
   import TagsBar from "./components/TagsBar.svelte";
   import SelectionTab from "./components/SelectionTab.svelte";
   import SequencerTab from "./components/SequencerTab.svelte";

   import { HsvPicker } from "svelte-color-picker";

   import { tagColors, currentScene } from "../modules/stores.js";

   import { getContext } from "svelte";
   const { application } = getContext("external");
   const position = application.position;
   position.scale = game.settings.get(moduleId, SETTINGS.UI_SCALE);

   let pickerOpen = false;

   let editTag;
   function onTagClick(e, tag) {
      editTag = tag;
      pickerOpen = !pickerOpen;
   }

   function createAction(_, tags) {
      currentScene.update((scene) => {
         let actions =
            "director-actions" in scene.data.flags ? scene.data.flags["director-actions"].filter((a) => a) : [];
         actions = [{ id: uuidv4(), tags: tags, type: "" }, ...actions];
         scene.data.flags["director-actions"] = actions;
         scene.update({ "flags.director-actions": actions });
         return scene;
      });
      mode = "actions";
   }

   function rgb2hex({ r, g, b, a = 1 }) {
      return {
         hex:
            "#" + [r, g, b, Math.round(a * 255) | 0].reduce((acc, v) => `${acc}${v.toString(16).padStart(2, "0")}`, ""),
      };
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

   let mode = setting(SETTINGS.DEFAULT_TAB);

   let startColor = editTag && editTag in tagColors ? tagColors[editTag] : "#232323";
</script>

<input type="checkbox" id="color-modal" class="ui-modal-toggle" bind:checked={pickerOpen} />
<label for="color-modal" class="ui-modal ui-cursor-pointer">
   <label class="ui-modal-box ui-relative ui-w-fit" for="">
      <HsvPicker on:colorChange={changeColor} {startColor} />
   </label>
</label>

<ApplicationShell bind:elementRoot>
   <main class="director-ui">
      <TagsBar {onTagClick} />
      <div class="ui-tabs ui-tabs-boxed">
         {#each tabs as t (t.title)}
            <a class="ui-tab ui-tab-lg" on:click={() => (mode = t.mode)} class:ui-tab-active={t.mode == mode}>
               {t.title}
               {#if t.badge}
                  {@html t.badge}
               {/if}
            </a>
         {/each}
      </div>

      {#if mode == "selection"}
         <SelectionTab {onTagClick} {createAction} />
      {/if}
      {#if mode == "actions"}
         <ActionsTab {onTagClick} onSelect={() => (mode = "selection")} />
      {/if}
      {#if mode == "sequencer"}
         <SequencerTab {onTagClick} />
      {/if}
   </main>
</ApplicationShell>
