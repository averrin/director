<script>
   import ArgInput from "./ArgInput.svelte";
   import { XIcon } from "@rgossiaux/svelte-heroicons/solid";
   import Select from "svelte-select";
   import { argSpecs } from "../../constants.js";
   import { createEventDispatcher } from "svelte";

   const dispatch = createEventDispatcher();

   export let variable;
   function remove() {
      dispatch("remove", variable);
   }

   function updateType(e) {
      variable.type = e.detail.id;
      variable = variable;
   }

   function emitChange(e) {
      dispatch("change", variable);
   }
</script>

<div class="flex flex-row bg-white rounded-xl shadow-lg p-2 gap-2 my-1 items-center">
   <label class="ui-input-group mx-1">
      <span class="">@</span>
      <input type="text" class="ui-input ui-input-lg text-base" bind:value={variable.name} isClearable={false} />
   </label>

   <Select items={argSpecs} optionIdentifier="id" labelIdentifier="id" value={variable.type} on:select={updateType} />
   <ArgInput type={variable.type} bind:value={variable.value} on:change={emitChange} />
   <button class="ui-btn ui-btn-outline ui-btn-error ui-btn-square justify-self-end" on:click={remove}>
      <XIcon class="h-8 w-8" />
   </button>
</div>
