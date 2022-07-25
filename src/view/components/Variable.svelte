<script>
   import ArgInput from "./ArgInput.svelte";
   import Select from "svelte-select";
   import FaTimes from "svelte-icons/fa/FaTimes.svelte";
   import { argSpecs } from "../../modules/Specs.js";
   import { createEventDispatcher } from "svelte";

   const dispatch = createEventDispatcher();

   export let variable;
   export let onTagClick;
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

<div class="ui-flex ui-flex-row ui-bg-white ui-rounded-xl ui-shadow-lg ui-p-2 ui-gap-2 ui-my-1 ui-items-center">
   <label class="ui-input-group ui-mx-1">
      <span style="min-width: 3rem !important;">
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
      </span>
      <input type="text" class="ui-input ui-input-lg ui-text-base" bind:value={variable.name} isClearable={false} />
   </label>

   <Select items={argSpecs} optionIdentifier="id" labelIdentifier="id" value={variable.type} on:select={updateType} />
   <ArgInput {onTagClick} type={variable.type} bind:value={variable.value} on:change={emitChange} />
   <button class="ui-btn ui-btn-outline ui-btn-error ui-btn-square ui-justify-self-end !ui-p-[8px]" on:click={remove}>
      <FaTimes />
   </button>
</div>
