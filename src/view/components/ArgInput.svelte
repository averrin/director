<script>
   import Select from "svelte-select";
   import { argSpecs } from "../../constants.js";
   import { logger, rgb2hex } from "../../modules/helpers.js";
   import Tags from "./Tags.svelte";
   import { tagColors, globalTags } from "../../modules/stores.js";
   import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
   import { HsvPicker } from "svelte-color-picker";
   import { v4 as uuidv4 } from "uuid";
   const dispatch = createEventDispatcher();

   export let id = uuidv4();
   export let value;
   export let type;
   export let variables = false;
   export let label = "";
   export let vars = [];
   export let additionalItems = [];
   export let selectFull = false;
   export let hideSign = false;
   export let widthAuto = false;
   export let onTagClick;
   export let justify = "start";
   let spec = argSpecs.find((s) => s.id == type);
   if (value === undefined || value === null || (value === "" && "default" in spec && value !== spec.default)) {
      resetValue();
      debounce(dispatch("change", value), 200);
   }

   function selectFile() {
      const fp = new FilePicker();
      fp.callback = (path) => (value = path);
      fp.browse(value);
   }

   function colorChange(e) {
      value = rgb2hex(e.detail).hex;
   }

   let effect_files;
   function getEffectFiles() {
      let files = [];
      try {
         if (value && value.startsWith("jb2a")) {
            files = globalThis.Sequencer.Database.getPathsUnder(value).map((o) => value + "." + o);
         } else {
            if (!value || (value && value.indexOf("/") == -1)) {
               try {
                  files = globalThis.Sequencer.Database.getPathsUnder("jb2a").map((o) => "jb2a." + o);
               } catch (error) {
                  files = [];
               }
            }
         }
      } catch (e) {
         //filepath
      }
      return files;
   }

   import { createEventDispatcher } from "svelte";

   let options = additionalItems;
   if (spec && "options" in spec) {
      options = [...spec.options, ...additionalItems].flat();
   }

   $: {
      spec = argSpecs.find((s) => s.id == type);
      if (spec && "options" in spec) {
         options = [...spec.options, ...additionalItems].flat();
      }
      if (value === undefined || value === null || (value === "" && "default" in spec && value !== spec.default)) {
         resetValue();
      }
      debounce(dispatch("change", value), 200);
      effect_files = getEffectFiles();
   }
   let mode = "direct";
   if ((typeof value === "string" || value instanceof String) && value.startsWith("@")) {
      mode = "variable";
   }
   function setMode(e, m) {
      if (e.detail == 0) return;
      mode = m;
      if (mode == "variable") {
         value = "@" + vars[0].name;
      } else {
         value = "";
      }
   }

   function selectVar(e) {
      value = "@" + e.detail.name;
   }
   // function changeFixed(e) {}
   function changeId(e) {
      value = "#id:" + e.target.value;
   }
   function resetValue() {
      if (spec.options) {
         value = spec.options[0].value;
      } else if ("default" in spec) {
         value = spec.default;
      } else {
         value = "";
      }
   }
   const groupBy = (a) => a.group;

   function convertFixed(e) {
      value = { x: Number.parseFloat(value.x), y: Number.parseFloat(value.y) };
   }
</script>

{#if type == "color"}
   <input type="checkbox" id="color-modal-{id}" class="ui-modal-toggle" />
   <label for="color-modal-{id}" class="ui-modal ui-cursor-pointer">
      <label class="ui-modal-box ui-relative ui-w-fit" for="">
         <HsvPicker on:colorChange={colorChange} startColor={value} />
      </label>
   </label>
{/if}

<label
   class="arg-input ui-input-group ui-h-full ui-justify-{justify}"
   for=""
   class:!ui-w-auto={widthAuto}
   class:ui-mr-3={widthAuto}
>
   {#if label != ""}
      <span class="">{label}</span>
   {/if}
   {#if mode == "direct"}
      {#if !hideSign}
         <button
            class="ui-btn ui-btn-square ui-m-0"
            class:ui-btn-disabled={!(variables && vars.length > 0)}
            style:background-color={variables && vars.length > 0 ? "#316060" : "#c7e1e1"}
            style:color={variables && vars.length > 0 ? "white" : "#232323"}
            on:click={(e) => setMode(e, "variable")}
         >
            <svg
               xmlns="http://www.w3.org/2000/svg"
               class="ui-h-6 ui-w-6"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
               stroke-width="2"
            >
               <path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
         </button>
      {/if}

      {#if type == "int"}
         <input type="number" bind:value class="ui-input ui-input-lg ui-text-base" />
      {:else if type == "float"}
         <input type="number" bind:value step="0.01" class="ui-input ui-input-lg ui-text-base" />
      {:else if type == "effect_file"}
         <label class="ui-input-group">
            <Select
               items={effect_files}
               value={value && value.split("/")[value.split("/").length - 1]}
               on:select={(e) => (value = e.detail.value)}
               on:clear={(_) => (value = "")}
               isCreatable={true}
               listAutoWidth={false}
               containerStyles="border-radius: 0px !important"
            />
            <button class="ui-btn ui-btn-square" on:click={selectFile}>
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ui-h-6 ui-w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  ><path
                     stroke-linecap="round"
                     stroke-linejoin="round"
                     stroke-width="2"
                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  /></svg
               >
            </button>
         </label>
      {:else if type == "sound_file"}
         <label class="ui-input-group">
            <input
               type="text"
               value={value && value.split("/")[value.split("/").length - 1]}
               on:change={(e) => (value = e.detail)}
               class="ui-input ui-input-lg ui-text-base"
            />
            <button class="ui-btn ui-btn-square" on:click={selectFile}>
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ui-h-6 ui-w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  ><path
                     stroke-linecap="round"
                     stroke-linejoin="round"
                     stroke-width="2"
                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  /></svg
               >
            </button>
         </label>
      {:else if type == "position" || type == "token" || type == "ease" || type == "targets" || type == "hook"}
         {#if Array.isArray(value)}
            <div class:ui-w-full={selectFull}>
               <Tags
                  allowPaste={true}
                  allowDrop={true}
                  onlyUnique={true}
                  splitWith={","}
                  placeholder="Tag"
                  autoComplete={$globalTags}
                  {onTagClick}
                  minChars="1"
                  colors={$tagColors}
                  on:tags={(e) => (value = e.detail.tags)}
                  tags={value}
               />
            </div>
            <button class="ui-btn ui-btn-square" on:click={resetValue}>
               <XIcon class="ui-h-8 ui-w-8" />
            </button>
         {:else if value && typeof value === "string" && value.startsWith("#id:")}
            <input type="text" value={value.slice(4)} on:change={changeId} class="ui-input ui-input-lg ui-text-base" />
            <button class="ui-btn ui-btn-square" on:click={resetValue}>
               <XIcon class="ui-h-8 ui-w-8" />
            </button>
         {:else if (typeof value === "object" && "x" in value && "y" in value) || type == "offset" || type == "size"}
            <input
               type="number"
               step="0.01"
               bind:value={value.x}
               on:change={convertFixed}
               class="ui-input ui-input-lg ui-text-base"
            />
            <input
               type="number"
               step="0.01"
               bind:value={value.y}
               on:change={convertFixed}
               class="ui-input ui-input-lg ui-text-base"
            />
            <button class="ui-btn ui-btn-square" on:click={resetValue}>
               <XIcon class="ui-h-8 ui-w-8" />
            </button>
         {:else}
            <Select
               items={options}
               {value}
               {groupBy}
               on:select={(e) => (value = e.detail.value)}
               on:clear={(_) => (value = "")}
               isCreatable={true}
               listAutoWidth={false}
               isClearable={false}
            />
         {/if}
      {:else if type == "offset" || type == "size"}
         <input
            bind:value={value.x}
            type="number"
            step="0.01"
            on:change={convertFixed}
            class="ui-input ui-input-lg ui-text-base"
         />
         <input
            type="number"
            step="0.01"
            bind:value={value.y}
            on:change={convertFixed}
            class="ui-input ui-input-lg ui-text-base"
         />
         <button class="ui-btn ui-btn-square" on:click={resetValue}>
            <XIcon class="ui-h-8 ui-w-8" />
         </button>
      {:else if type == "token-magic" && globalThis.TokenMagic}
         <Select
            items={globalThis.TokenMagic.getPresets().map((p) => p.name)}
            {value}
            on:select={(e) => (value = e.detail.value)}
            on:clear={(_) => (value = "")}
            listAutoWidth={false}
         />
      {:else if type == "bool"}
         <div
            class="ui-flex ui-flex-row ui-items-center"
            style={!hideSign || label != "" ? "border: 1px solid #ccc;" : ""}
         >
            <input
               type="checkbox"
               class="ui-toggle ui-toggle-accent ui-toggle-lg"
               bind:checked={value}
               style="border: 1px solid #ccc; border-radius: 1rem; height: 2rem !important; width: 4rem !important; --handleoffset: 2rem !important; margin-left: 1rem;"
            />
         </div>
      {:else if type == "macro"}
         <Select
            items={globalThis.game.macros.map((m) => {
               //m.data.ref = m;
               return m.data;
            })}
            optionIdentifier="name"
            labelIdentifier="name"
            {value}
            on:select={(e) => {
               value = e.detail.name;
            }}
            on:clear={(_) => (value = "")}
            listAutoWidth={false}
         />
      {:else if type == "code" || type == "expression"}
         <input type="text" bind:value class="ui-input ui-input-lg ui-text-base" />
      {:else if type == "color"}
         <label for="color-modal-{id}" class="ui-btn ui-btn-square" style:background-color={value} />
         <input type="text" bind:value class="ui-input ui-input-lg ui-text-base" />
      {:else}
         <input type="text" bind:value class="ui-input ui-input-lg ui-text-base" />
      {/if}
   {:else}
      <button
         class="ui-btn ui-btn-square ui-m-0"
         style="background-color: #aa66cc;"
         on:click={(e) => setMode(e, "direct")}
      >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            class="ui-h-6 ui-w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
         >
            <path
               stroke-linecap="round"
               stroke-linejoin="round"
               d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            />
         </svg>
      </button>
      <Select
         optionIdentifier="name"
         labelIdentifier="name"
         items={vars}
         value={value && value != "" ? value.slice(1) : vars[0]}
         on:select={selectVar}
         listAutoWidth={false}
         isClearable={false}
      />
   {/if}
</label>
