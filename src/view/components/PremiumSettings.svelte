<script>
   // import { SETTINGS } from "../../modules/constants.js";
   // import SettingsInput from "./SettingsInput.svelte";
   import { isPremium } from "crew-components/premium";
</script>

<div class="ui-bg-base ui-p-2 browser-settings ui-flex ui-flex-row ui-gap-2">
   <!-- <div class="ui-input-group ui-input-group-md ui-w-auto"> -->
   <!--    <span>Unlocked</span> -->
   <!--    <div -->
   <!--       class="ui-px-2 ui-border ui-text-base-content ui-flex ui-flex-row ui-items-center ui-gap-1 ui-p-1" -->
   <!--       style="border-color: hsl(var(--b3)); border-style: solid;" -->
   <!--    > -->
   <!--       {#if isPremium()} -->
   <!--          <iconify-icon icon="fa:check" style="color: hsl(var(--s))" /> -->
   <!--       {:else} -->
   <!--          <iconify-icon icon="fluent-emoji-high-contrast:cross-mark" style="color: hsl(var(--e))" /> -->
   <!--       {/if} -->
   <!--    </div> -->
   <!-- </div> -->

   <div class="ui-flex ui-items-center ui-justify-center ui-mt-6 ui-w-1/2">
      <a href="https://www.patreon.com/averrin" target="_blank">
         <img
            style="border: unset; border-radius: 1rem"
            class="ui-rounded-md"
            width="260px"
            height="66px"
            alt="Become a Patron"
            src="modules/alpha-suit/assets/patreon.svg"
         />
      </a>
   </div>

   <div class="ui-w-1/2">
      <h1 class="ui-mt-2">Premium features</h1>
      <ul>
         <li>Ability to edit/focus/preload effects</li>
         <li>All effect modifiers</li>
         <li>More than 3 saved effects</li>
         <li>Flexible settings</li>
      </ul>
   </div>
</div>
