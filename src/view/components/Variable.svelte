<script>
   import ArgInput from "crew-components/ArgInput";
   import RemoveButton from "crew-components/RemoveButton";
   import Select from "svelte-select";
   import { argSpecs } from "crew-components/specs";
   import { createEventDispatcher } from "svelte";

   const dispatch = createEventDispatcher();

   export let variable;
   function remove() {
      dispatch("remove", variable);
   }

   function updateType(e) {
      variable.type = e.detail.id;
      variable = variable;
      emitChange();
   }

   function emitChange(e) {
      dispatch("change", variable);
   }
</script>

<div
   class="ui-flex ui-flex-row ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-p-2 ui-gap-2 ui-my-1 ui-items-center"
   id={variable.id}
>
   <div class="ui-flex ui-flex-row ui-gap-2 ui-flex-1">
      <label class="ui-input-group ui-input-group-md">
         <span style="width: 2.5rem !important; padding: 0 0.5rem">
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
         <input type="text" class="ui-input" bind:value={variable.name} isClearable={false} />
      </label>

      <Select
         isSearchable={true}
         items={argSpecs}
         optionIdentifier="id"
         labelIdentifier="id"
         value={variable.type}
         on:select={updateType}
      />
      <ArgInput type={variable.type} bind:value={variable.value} on:change={emitChange} />
   </div>
   <div class="ui-flex-none">
      <RemoveButton on:click={remove} size="md" />
   </div>
</div>
