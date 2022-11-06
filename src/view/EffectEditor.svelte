<svelte:options accessors />

<script>
   import { v4 as uuidv4 } from "uuid";
   import AlphaShell from "crew-components/AlphaShell";
   import { editingEffect, savedEffects } from "../modules/stores.js";
   import { onDestroy, tick } from "svelte";
   import InlineButton from "crew-components/InlineButton";
   import RangeSlider from "svelte-range-slider-pips";

   import SectionItem from "./components/SectionItem.svelte";
   import { Section, Modifier, DSequence, Variable } from "../modules/Sequencer.js";
   import { isPremium } from "crew-components/premium";
   import { SETTINGS, setting } from "crew-components/helpers";

   const previewText = { text: "PREVIEW", fill: "#FF0000", stroke: "white", strokeThickness: 5 };

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

   function effect2Section(effect) {
      if (!effect) return null;
      let section = new Section(uuidv4(), "effect", [
         effect.data.name ?? effect.data.file.split("/")[effect.data.file.split("/").length - 1],
      ]);
      if (!effect) return null;
      logger.info(effect);
      section.modifiers.push(_m("file", [effect.data.file]));
      const ox = effect.data.offset?.source.x ?? 0;
      const oy = effect.data.offset?.source.y ?? 0;
      if (effect.token) {
         section.modifiers.push(_m("attachTo", ["#token:" + effect.token.document.id]));
      } else {
         section.modifiers.push(
            _m("atLocation", [
               {
                  x: effect.position.x - ox,
                  y: effect.position.y - oy,
               },
               { x: ox, y: oy },
            ])
         );
      }
      if (effect.data.scale && (effect.data.scale?.x != 1 || effect.data.scale?.y != 1)) {
         section.modifiers.push(_m("scale", [{ x: effect.data.scale.x, y: effect.data.scale.y }]));
      }
      if (effect.data.tint) {
         section.modifiers.push(_m("tint", [effect.data.tint]));
      }
      if (effect.data.opacity != 1) {
         section.modifiers.push(_m("opacity", [effect.data.opacity]));
      }
      if (effect.data.angle && effect.data.angle != 0) {
         section.modifiers.push(_m("rotate", [effect.data.angle]));
      }
      if (effect.data.flipX) {
         section.modifiers.push(_m("flipX", [true]));
      }

      if (effect.data.flipY) {
         section.modifiers.push(_m("flipY", [true]));
      }

      if (effect.data.zIndex) {
         section.modifiers.push(_m("zIndex", [effect.data.zIndex]));
      }
      if (effect.data.elevation) {
         section.modifiers.push(_m("elevation", [effect.data.elevation]));
      }
      if (effect.data.persist) {
         section.modifiers.push(_m("persist", [true, effect.data.persistOptions?.persistTokenPrototype ?? false]));
      }

      return section;
   }
   let section;
   function _setEffect(e) {
      // debugger;
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
      } else {
         section = effect2Section(effect);
      }
      if (r && section) {
         logger.info("Auto create effect");
         applySection();
      }
   }
   const setEffect = foundry.utils.debounce(_setEffect, 200);
   onDestroy(editingEffect.subscribe(setEffect));
   let sub = Hooks.on("updateSequencerEffect", (_) => setEffect(effect));
   onDestroy((_) => Hooks.off("updateSequencerEffect", sub));

   async function togglePreviewText(v) {
      showPreviewText = v;
      await effect.update({ text: showPreviewText ? previewText : null });
   }

   let validationError;

   async function applySection(showToPlayers = false) {
      logger.info("Applying section");
      const sid = uuidv4();
      let seq = new DSequence(sid, "");
      let section_clone = Section.fromPlain(section);
      let locally = !showToPlayers;
      if (instant) {
         locally = false;
      }
      section_clone.modifiers.push(_m("locally", [locally]));
      seq.sections = [section_clone];
      const result = await seq.validate();
      if (result.result) {
         validationError = undefined;
         if (effect && effect.data.origin) {
            logger.info("removeing effect", effect, effect.data.origin);
            Sequencer.EffectManager.endEffects({ origin: effect.data.origin });
         }
         seq.play();

         if (instant && isPremium()) {
            editingEffect.set(null);
            Director.closeEffectEditor();
         } else {
            detectEffect(sid);
         }
      } else {
         logger.error(result.error);
         validationError = result.error;
      }
   }

   function detectEffect(sid, delay = 15) {
      setTimeout((_) => {
         effect = Sequencer.EffectManager.getEffects({ origin: sid })[0];
         if (effect) {
            effect.section = section;
            logger.info(effect);
         } else {
            if (delay >= 1000) {
               detectEffect(sid, delay * 2);
            } else {
               ui.notifications.error("Something went wrong.");
            }
         }
      }, delay);
   }

   async function createEffect() {
      applySection(true);
      editingEffect.set(null);
      Director.closeEffectEditor();
   }

   function cancel() {
      Director.closeEffectEditor();
      if (effect && effect.data.origin) {
         logger.info("removeing effect", effect, effect.data.origin);
         Sequencer.EffectManager.endEffects({ origin: effect.data.origin });
      }
      editingEffect.set(null);
   }

   function _updateSection(s, apply = true) {
      logger.info("update section", s);
      section = s;
      if (section.savedId) {
         savedEffects.update((effects) => {
            const se = effects.find((e) => e.section.id == section.savedId);
            if (se) se.section = section;
            return effects;
         });
      }
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
</script>

<AlphaShell bind:elementRoot {id} fullHeight={true}>
   <div class="ui-p-3 ui-flex ui-flex-col ui-gap-2 ui-h-full ui-h-full">
      <div class="ui-p-3 ui-flex ui-flex-col ui-gap-2 ui-flex-1 ui-overflow-auto ui-h-full">
         {#if effect && section}
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
