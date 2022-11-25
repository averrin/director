<svelte:options accessors />

<script>
   import { v4 as uuidv4 } from "uuid";
   import AlphaShell from "crew-components/AlphaShell";
   import { editingEffect, savedEffects } from "../modules/stores.js";
   import { onDestroy, tick } from "svelte";
   import InlineButton from "crew-components/InlineButton";
   import RangeSlider from "svelte-range-slider-pips";

   import SectionItem from "./components/SectionItem.svelte";
   import { Section, Modifier, playSection, createLight, effect2Section } from "../modules/Sequencer.js";
   import { isPremium } from "crew-components/premium";
   import { SETTINGS, setting, onHook } from "crew-components/helpers";
   import RemoveButton from "crew-components/RemoveButton";
   import IconButton from "crew-components/IconButton";

   async function resetPosition() {
      section.lightConfig.offsetX = 0;
      section.lightConfig.offsetY = 0;
      updateSection(section);
   }

   async function pickPosition() {
      const controlled = [canvas.tiles.controlled, ...globalThis.canvas.tokens.controlled].flat();
      let t = await globalThis.warpgate.crosshairs.show({
         drawIcon: true,
         icon: "modules/director/icons/crosshair.png",
         label: `Pick position`,
         interval: 0,
         // interval: setting(SETTINGS.MANUAL_MODE),
      });
      controlled.forEach((c) => c.control());
      section.lightConfig.offsetX = t.x - effect.position.x;
      section.lightConfig.offsetY = t.y - effect.position.y;
      updateSection(section);
   }

   export let elementRoot;
   export let id = "effect-editor";
   let showPreviewText = true;
   let instant = false; // TODO: donot open editor
   if (instant && !isPremium()) {
      instant = false;
   }
   let temp = false; // think about using it

   let effect;

   const _m = (t, v) => {
      const m = new Modifier(uuidv4(), "");
      m.setType(t, "effect");
      m.args = v;
      return m;
   };

   let section;
   async function _setEffect(e) {
      if (!e) return;

      effect = e;
      if (effect.temp !== undefined) {
         temp = effect.temp;
      }
      if (effect.instant !== undefined) {
         instant = effect.instant;
      }
      let r = false;
      if (!section) r = true;
      if (effect?.section) {
         section = Section.fromPlain(effect.section);
         const lm = section.modifiers.find((m) => m.type == "atLocation");
         if (lm && effect && effect.position) {
            lm.args[0] = { x: effect?.position?.x, y: effect?.position?.y };
            section = section;
         }
      } else {
         section = effect2Section(effect);
      }
      if (r && section) {
         applySection();
      }
   }
   const setEffect = foundry.utils.debounce(_setEffect, 200);
   onDestroy(editingEffect.subscribe(setEffect));
   onHook("updateSequencerEffect", (_) => {
      setEffect(effect);
   });

   onHook("updateAmbientLight", (light) => {
      if (light.id == section.light) {
         const light = canvas.lighting.get(section.light);
         if (light) {
            const oc = section.lightConfig;
            section.lightConfig = light.document.toObject();
            section.lightConfig.offsetX = oc.offsetX;
            section.lightConfig.offsetY = oc.offsetY;
         }
         section = section;
      }
   });

   async function togglePreviewText(v) {
      showPreviewText = v;
      await effect.update({ text: showPreviewText ? previewText : null });
   }

   let validationError;

   async function applySection(showToPlayers = false) {
      let locally = !showToPlayers;
      if (instant) {
         locally = false;
      }
      const result = await playSection(section, !locally);

      if (result.result) {
         effect = result.effect;
         validationError = undefined;

         if (instant && isPremium()) {
            editingEffect.set(null);
            Director.closeEffectEditor();
         }
      } else {
         logger.error(result.error);
         validationError = result.error;
      }
      section = section;
   }

   async function createEffect() {
      applySection(true);
      editingEffect.set(null);
      Director.closeEffectEditor();
   }

   function cancel() {
      Director.closeEffectEditor();
      if (effect && effect.data.origin) {
         Sequencer.EffectManager.endEffects({ origin: effect.data.origin });
      }
      editingEffect.set(null);
   }

   function _updateSection(s, apply = true) {
      section = s;
      savedEffects.update((effects) => {
         const se = effects.find((e) => e.section.id == section.id);
         if (se) {
            logger.info("updating savevd section", se, section.id, section.savedId);
            se.section = section;
         }
         return effects;
      });
      if (apply) {
         applySection();
      }
   }
   const updateSection = foundry.utils.debounce(_updateSection, 200);

   function getRotate() {
      const sm = section.modifiers.find((m) => m.type == "rotate");
      if (sm) {
         return sm.args[0];
      }
      return 0;
   }

   function setRotate(v) {
      const sm = section.modifiers.find((m) => m.type == "rotate");
      if (!sm) {
         section.modifiers.push(_m("rotate", [v]));
      } else {
         sm.args = [v];
      }
      updateSection(section);
      // effect.update({ angle: v });
   }

   function getScale() {
      const sm = section.modifiers.find((m) => m.type == "scale");
      if (sm) {
         return sm.args[0].x;
      }
      return 1;
   }

   function setScale(v) {
      const sm = section.modifiers.find((m) => m.type == "scale");
      if (!sm) {
         section.modifiers.push(_m("scale", [{ x: v, y: v }]));
      } else {
         sm.args = [{ x: v, y: v }];
      }
      updateSection(section);
      // effect.update({ scale: { x: v, y: v } });
   }

   async function addLight() {
      const light = await createLight(section, null, effect);
      light.sheet.render(true);
      section.light = light.id;
      section.lightConfig.offsetX = 0;
      section.lightConfig.offsetY = 0;
   }
   async function editLight() {
      const light = canvas.lighting.get(section.light);
      light.sheet.render(true);
   }
   async function removeLight() {
      canvas.scene.deleteEmbeddedDocuments("AmbientLight", [section.light]);
      section.lightConfig = null;
      section.light = null;
      updateSection(section);
   }
   const availableTabs = [
      { title: "General", mode: "effect" },
      { title: "Light configuration", mode: "light" },
   ];
   let mode = "effect";
   function selectMode(t) {
      mode = t.mode;
   }
</script>

<AlphaShell bind:elementRoot {id} fullHeight={true}>
   <div class="ui-flex ui-flex-col ui-gap-2 ui-h-full ui-h-full">
      <div class="ui-tabs ui-tabs-boxed ui-rounded-none">
         {#each availableTabs as t (t.title)}
            <a
               class="ui-tab ui-tab-md ui-flex ui-flex-row ui-items-center ui-gap-1"
               on:click={() => selectMode(t)}
               class:ui-tab-active={t.mode == mode}
            >
               {t.title}
            </a>
         {/each}
      </div>

      <div class="ui-p-3 ui-flex ui-flex-col ui-gap-2 ui-flex-1 ui-overflow-auto ui-h-full">
         {#if effect && section}
            {#if mode == "effect"}
               {#if !setting(SETTINGS.HIDE_GIZMOS)}
                  <div
                     class="ui-border-solid ui-flex ui-flex-col ui-border ui-border-base-300 ui-flex ui-flex-row ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-1"
                  >
                     <div class="ui-flex ui-flex-row ui-gap-2">
                        <div class="ui-w-1/2 ui-text-center ui-font-bold">Rotation</div>
                        <div class="ui-w-1/2 ui-text-center ui-font-bold">Scale</div>
                     </div>
                     <div class="ui-flex ui-flex-row ui-gap-2">
                        <div class="ui-w-1/2">
                           <RangeSlider
                              pips
                              float
                              pipstep={45}
                              max={180}
                              min={-180}
                              all="label"
                              range="min"
                              values={[getRotate()]}
                              on:change={(e) => setRotate(e.detail.value)}
                              springValues={{ stiffness: 0.1, damping: 0.8 }}
                              suffix="°"
                           />
                        </div>
                        <div class="ui-w-1/2">
                           <RangeSlider
                              springValues={{ stiffness: 0.1, damping: 0.8 }}
                              pips
                              all="label"
                              max={300}
                              float={true}
                              pipstep={25}
                              range="min"
                              values={[getScale() * 100]}
                              on:change={(e) => setScale(e.detail.value / 100)}
                              formatter={(v) => v / 100}
                           />
                        </div>
                     </div>
                  </div>
               {/if}

               <SectionItem
                  isRestricted={true}
                  hideSign={true}
                  on:update={(e) => updateSection(e.detail)}
                  item={section}
                  showCollapse={false}
                  showCopy={false}
                  showPlay={false}
                  showDelete={false}
               />
            {:else if !section.light}
               <p>
                  <b>CAUTION:</b> lights are visible for players even if the effect is local.
               </p>
               <p>
                  Lights support position syncing on effect's moving (even if it attached to token). But not modifiers
                  like "loopProperty", "animateProperty", etc.
               </p>

               <button class="ui-btn ui-btn-md" on:click={addLight}>Add light</button>
            {:else}
               <div
                  class="ui-border-solid ui-border ui-border-base-300 ui-flex ui-flex-row ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-items-center ui-font-bold"
                  id={section.light}
               >
                  <div class="ui-flex ui-flex-1 ui-w-full ui-flex-col ui-items-center ui-gap-2">
                     <div class="ui-flex ui-w-full ui-flex-row ui-items-center ui-gap-2">
                        <div class="ui-flex ui-w-full ui-flex-row ui-items-center ui-gap-2">
                           <div
                              class="ui-h-8 ui-w-8"
                              style:border-radius="0.5rem"
                              style:background-color={section.lightConfig?.config.color}
                           />
                           {section.light} [{section.lightConfig?.config.dim}, {section.lightConfig?.config.bright}]
                           {#if section.lightConfig?.config?.animation.type}
                              {section.lightConfig?.config?.animation.type}
                           {/if}
                        </div>
                        <div class="ui-flex ui-flex-none ui-flex-row ui-gap-1">
                           <button class="ui-btn ui-btn-md ui-w-24" on:click={editLight}>Edit</button>
                           <RemoveButton size="md" on:click={removeLight} />
                        </div>
                     </div>
                     <div class="ui-w-full">
                        <div class="ui-input-group ui-input-group-md ui-w-96">
                           <span>Offset</span>
                           <input type="number" step={1} bind:value={section.lightConfig.offsetX} class="ui-input" />
                           <input type="number" step={1} bind:value={section.lightConfig.offsetY} class="ui-input" />
                           <IconButton icon="mdi:target" title="Pick offset" on:click={pickPosition} />
                           <RemoveButton title="Pick offset" on:click={resetPosition} />
                        </div>
                        <!-- {JSON.stringify(section.lightConfig)} -->
                     </div>
                  </div>
               </div>
            {/if}
         {:else}
            No effect selected
         {/if}
      </div>
      <div class="ui-p-3 ui-flex ui-flex-col ui-gap-2 ui-flex-none">
         {#if validationError}
            {#if validationError == "premium"}
               <div class="ui-flex ui-flex-col ui-items-center">
                  <a href="https://www.patreon.com/averrin" target="_blank">
                     <img
                        style="border: unset; border-radius: 1rem;"
                        width="200px"
                        height="50px"
                        alt="Become a Patron"
                        src="modules/alpha-suit/assets/patreon.svg"
                     />
                  </a>
               </div>
            {:else}
               <div
                  class="ui-border-solid ui-border ui-border-base-300 ui-flex ui-flex-row ui-bg-error ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-items-center ui-justify-center ui-font-bold"
               >
                  {@html validationError}
                  <InlineButton icon="dashicons:update" size="xs" on:click={(_) => applySection()} />
               </div>
            {/if}
         {/if}
         {#if effect && effect.data.users?.length == 1}
            This effect is a local preview. Press "Apply" to create a normal one.
         {/if}
         <div class="ui-flex ui-flex-row ui-gap-2">
            <button style="max-width: 50%" class="ui-btn ui-btn-md" on:click={cancel}>End effect</button>
            <button
               disabled={validationError || !section}
               class:ui-btn-disabled={validationError || !section}
               style="max-width: 50%"
               class="ui-btn ui-btn-md ui-btn-primary"
               on:click={createEffect}>Apply</button
            >
         </div>
      </div>
   </div>
</AlphaShell>
