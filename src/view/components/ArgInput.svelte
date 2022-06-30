<script>
   import Select from "svelte-select";
   import { argSpecs } from "../../constants.js";
   import { logger } from "../../modules/helpers.js";

   export let value;
   export let type;
   export let variables = false;
   export let label = "";
   export let vars = [];

   function selectFile() {
      const fp = new FilePicker();
      fp.callback = (path) => (value = path);
      fp.browse(value);
   }

   let effect_files;
   function getEffectFiles() {
      let files = [];
      try {
         if (value && value.startsWith("jb2a")) {
            files = globalThis.Sequencer.Database.getPathsUnder(value).map((o) => value + "." + o);
         } else {
            if (!value || (value && value.indexOf("/") == -1)) {
               files = globalThis.Sequencer.Database.getPathsUnder("jb2a").map((o) => "jb2a." + o);
            }
         }
      } catch (e) {
         //filepath
      }
      return files;
   }

   import { createEventDispatcher } from "svelte";

   const dispatch = createEventDispatcher();

   $: {
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
</script>

<label class="ui-input-group" for="">
   {#if label != ""}
      <span class="">{label}</span>
   {/if}
   {#if mode == "direct"}
      {#if variables && vars.length > 0}
         <button
            class="ui-btn ui-btn-square ui-m-0"
            style="background-color: darkcyan;"
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
         <input
            on:pointerdown|stopPropagation={() => null}
            type="number"
            bind:value
            class="ui-input ui-input-lg ui-text-base"
         />
      {:else if type == "float"}
         <input
            on:pointerdown|stopPropagation={() => null}
            type="number"
            bind:value
            step="0.01"
            class="ui-input ui-input-lg ui-text-base"
         />
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
               on:pointerdown|stopPropagation={() => null}
               type="text"
               bind:value
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
      {:else if type == "position" || type == "token"}
         <Select
            items={argSpecs.find((s) => s.id == type).options}
            {value}
            on:select={(e) => (value = e.detail.value)}
            on:clear={(_) => (value = "")}
            isCreatable={true}
            listAutoWidth={false}
            isClearable={false}
         />
      {:else if type == "bool"}
         <div class="ui-flex ui-flex-row ui-items-center">
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
      {:else}
         <input
            on:pointerdown|stopPropagation={() => null}
            type="text"
            bind:value
            class="ui-input ui-input-lg ui-text-base"
         />
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
         value={value != "" ? value.slice(1) : vars[0]}
         on:select={selectVar}
         listAutoWidth={false}
         isClearable={false}
      />
   {/if}
</label>
