<script>
   import Tags from "./Tags.svelte";
   import { globalTags, tagColors } from "../../modules/stores.js";

   export let onTagClick;

   function onTags(event) {
      const tags = event.detail.tags.filter((t) => t.trim() != "");
      globalTags.set(tags);
   }
</script>

<div class="ui-navbar ui-bg-base-100">
   <Tags
      allowPaste={true}
      allowDrop={true}
      onlyUnique={true}
      splitWith={","}
      placeholder="Tag"
      on:tags={onTags}
      tags={$globalTags}
      colors={$tagColors}
      {onTagClick}
   />
</div>
