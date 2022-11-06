<script>
   import { Section } from "../../modules/Sequencer.js";
   import { v4 as uuidv4 } from "uuid";
   import { onHook } from "crew-components/helpers";
   import Icon from "crew-components/Icon";
   import IconButton from "crew-components/IconButton";
   import RemoveButton from "crew-components/RemoveButton";
   import { onDestroy, tick } from "svelte";
   import { isPremium } from "crew-components/premium";
   import { editingEffect, savedEffects } from "../../modules/stores";
   import TokenThumb from "crew-components/TokenThumb";
   let effects = Sequencer.EffectManager.effects;

   async function setVideoThumb(effect) {
      const els = document.querySelectorAll(`img#et-${effect.id ?? effect.data.id}`);
      for (const el of els) {
         if (el) {
            try {
               let f = effect.data.file;
               const entry = Sequencer.Database.getEntry(effect.data.file);
               if (entry) {
                  f = entry.file;
                  if (typeof f === "object") {
                     f = f[Object.keys(f)[0]];
                  }
               }
               const thumb = await game.video.createThumbnail(f, {
                  height: 100,
                  width: 100,
               });
               el.setAttribute("src", thumb);
            } catch (error) {
               logger.error(error);
            }
         }
      }
   }

   function _updateEffects() {
      tick().then((_) => {
         effects = Sequencer.EffectManager.effects;

         tick().then((_) => {
            for (const effect of effects) {
               setVideoThumb(effect);
            }
            for (const effect of $savedEffects) {
               setVideoThumb(effect);
            }
         });
      });
   }
   const updateEffects = foundry.utils.debounce(_updateEffects, 100);

   onHook("createSequencerEffect", updateEffects);
   onHook("endedSequencerEffect", updateEffects);
   onHook("createSequencerSequence", updateEffects);
   onHook("createSequencerSequence", updateEffects);
   onHook("updateScene", updateEffects);
   onHook("sequencerEffectManagerReady", updateEffects);
   onDestroy(editingEffect.subscribe(updateEffects));
   onDestroy(savedEffects.subscribe(updateEffects));

   function removeEffect(effect) {
      Sequencer.EffectManager.endEffects({ effects: [effect.id] });
   }

   function selectEffect(e, effect) {
      globalThis.canvas.animatePan({ x: effect.position.x, y: effect.position.y, scale: 0.25 });
      canvas["sequencerEffects"].activate();
   }

   function editEffect(effect) {
      Director.openEffectEditor(effect);
   }

   function toggleLocalEffect(effect) {
      if (!effect.data.users || effect.data.users.length == 0) {
         effect.update({ users: [effect.data.creatorUserId] });
      } else {
         effect.update({ users: [] });
      }
      tick().then(updateEffects);
   }

   async function preloadEffect(effect) {
      ui.notifications.info("Preloading for clients started: " + effect.data.file);
      await Sequencer.Preloader.preloadForClients(effect.data.file);
      ui.notifications.info("Preloading finished");
   }

   function saveEffect(effect) {
      effect = { ...effect };
      effect.data = { ...effect.data };
      effect.data.id = uuidv4();
      effect.data.origin = uuidv4();
      let section;
      if (effect.section) {
         section = Section.fromPlain(effect.section);
         section.id = uuidv4();
         section.savedId = section.id;
      }
      savedEffects.update((e) => {
         e.push({ data: effect.data, section });
         return e;
      });
      updateEffects();
   }

   function removeSavedEffect(effect) {
      savedEffects.update((e) => {
         e = e.filter((eff) => eff.data.id != effect.data.id);
         return e;
      });
      updateEffects();
   }

   function onDragStart(event, effect) {
      let section = { ...effect.section };
      section.id = uuidv4();
      section.savedId = null;
      const dragData = {
         type: "Effect",
         effect: effect.data,
         section,
      };
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
   }

   function getEffectName(effect) {
      let name = effect.data.file.split("/")[effect.data.file.split("/").length - 1];
      if (effect.section?.args[0]) {
         name = effect.section?.args[0];
      } else if (effect.data.name) {
         if (effect.data.name != effect.data.file) {
            name = `${effect.data.name} (${name})`;
         }
      } else {
      }
      return name;
   }

   function getAttachedToken(effect) {
      if (effect.section) {
         const am = effect.section.modifiers.find((m) => m.type == "attachTo");
         if (am) {
            return canvas.tokens.get(am.args[0].slice(7));
         }
      }
      return null;
   }

   function getTiedDocument(effect) {
      if (effect.section) {
         const am = effect.section.modifiers.find((m) => m.type == "tieToDocuments");
         if (am) {
            try {
               return canvas.tokens.get(am.args[0].slice(7));
            } catch (e) {
               return null;
            }
         }
      }
      return null;
   }

   updateEffects();
</script>

<div class="ui-h-full ui-overflow-auto">
   <div class="ui-p-2 ui-flex ui-flex-col ui-gap-2">
      <div class="ui-w-full ui-text-center ui-text-lg">Saved effects</div>
      {#each $savedEffects as effect (effect.data.id)}
         <div
            class="ui-border-solid ui-border ui-border-base-300 ui-flex ui-flex-row ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-items-center"
            id={effect.data.id}
            draggable="true"
            on:dragstart={(e) => onDragStart(e, effect)}
         >
            <div class="ui-flex ui-flex-1 ui-flex-row ui-gap-2 ui-items-center">
               <!-- <video autoplay class="ui-rounded-md" disablePictureInPicture loop style:height="2rem"> -->
               <!--    <source src={Sequencer.Database.getEntry(effect.data.file).file} type="video/webm" /> -->
               <!-- </video> -->
               <img
                  id={`et-${effect.data.id}`}
                  src="icons/svg/video.svg"
                  alt=""
                  class="ui-rounded-md ui-h-6 ui-border-none"
               />
               {@html getEffectName(effect)}
            </div>
            <div class="ui-flex ui-flex-none ui-flex-row ui-gap-2 ui-items-center">
               <IconButton
                  disabled={!isPremium()}
                  on:click={(_) => preloadEffect(effect)}
                  icon="eva:cloud-download-outline"
                  title="Preload effect"
                  size="xs"
               />
               <IconButton
                  disabled={!isPremium() || !effect.section}
                  title="Edit"
                  on:click={(_) => editEffect(effect)}
                  icon="fa-solid:edit"
                  size="xs"
               />
               <RemoveButton size="xs" on:click={(_) => removeSavedEffect(effect)} />
            </div>
         </div>
      {/each}

      <div class="ui-divider ui-m-0" />
      <div class="ui-flex ui-flex-row ui-w-full ui-pl-16">
         <div class="ui-flex-1 ui-w-full ui-text-center ui-text-lg">Playing effects</div>
         <button
            on:click={(_) => Sequencer.EffectManager.endAllEffects()}
            class="ui-flex-none ui-btn ui-btn-xs ui-w-18 ui-btn-error">End all</button
         >
      </div>
      {#each effects as effect (effect.uuid)}
         <div
            class="ui-border-solid ui-border ui-border-base-300 ui-flex ui-flex-row ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-items-center"
            id={effect.id}
         >
            <div class="ui-flex ui-flex-1 ui-flex-row ui-gap-2 ui-items-center">
               <!-- <video autoplay class="ui-rounded-md" disablePictureInPicture loop style:height="2rem"> -->
               <!--    <source src={Sequencer.Database.getEntry(effect.data.file).file} type="video/webm" /> -->
               <!-- </video> -->
               <img
                  id={`et-${effect.id}`}
                  src="icons/svg/video.svg"
                  alt=""
                  class="ui-rounded-md ui-h-6 ui-border-none"
               />

               {@html getEffectName(effect)}
               {#if getAttachedToken(effect)}
                  <Icon icon="fa6-solid:at" />
                  <TokenThumb token={getAttachedToken(effect)} />
                  {getAttachedToken(effect).document.name}
               {/if}
               {#if getTiedDocument(effect)}
                  <Icon icon="jam:link" />
                  <TokenThumb token={getTiedDocument(effect)} />
                  {getTiedDocument(effect).document.name}
               {/if}
               {#if !effect.data.persist}
                  <Icon icon="mdi:timer-sand-empty" />
               {/if}
               {#if effect.section}
                  <Icon icon="twemoji:clapper-board" />
               {/if}
            </div>
            <div class="ui-flex ui-flex-none ui-flex-row ui-gap-2 ui-group-xs">
               <IconButton
                  disabled={!isPremium()}
                  on:click={(_) => preloadEffect(effect)}
                  icon="eva:cloud-download-outline"
                  title="Preload effect"
               />
               <!-- <IconButton -->
               <!--    disabled={!isPremium()} -->
               <!--    on:click={(_) => toggleLocalEffect(effect)} -->
               <!--    icon={effect.data.users?.length == 1 ? "fa-solid:eye-slash" : "fa-solid:eye"} -->
               <!--    title={effect.data.users?.length == 1 ? "Local" : "Visible for players"} -->
               <!-- /> -->
               <IconButton
                  disabled={!isPremium()}
                  title="Edit"
                  on:click={(_) => editEffect(effect)}
                  icon="fa-solid:edit"
               />

               <IconButton
                  disabled={!isPremium()}
                  title="Focus effect"
                  on:click={(e) => selectEffect(e, effect)}
                  icon="fa-solid:expand"
               />
               <IconButton
                  type="primary"
                  disabled={!effect.section || ( !isPremium() && $savedEffects.length >= 3)}
                  on:click={(_) => saveEffect(effect)}
                  icon="bxs:bookmark-plus"
                  title="Save effect"
               />
               <RemoveButton size="xs" on:click={(_) => removeEffect(effect)} />
            </div>
         </div>
      {/each}
      {#if effects.length == 0}
         <div
            class="ui-border-solid ui-border ui-border-base-300 ui-flex ui-flex-row ui-bg-base-100 ui-rounded-xl ui-shadow-lg ui-py-2 ui-px-4 ui-gap-2 ui-items-center ui-justify-center ui-font-bold"
         >
            No effects currently playing...
         </div>
      {/if}
   </div>
</div>
