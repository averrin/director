# Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

## [Unreleased]
## [1.0.0 - 1.1.0](https://github.com/averrin/director/compare/1.0.0...1.1.0)
Added:
  * [Premium] alt key to skip effect editor when dragging effect from the Effects Tab
  * Ability to attach lights to effects. It's buggy and with a bunch of limitations. Possibly will be reworked in the future.

Fixed:
  * Toolbar icon changed to fa's instead of emoji

Known bugs/limitations:
  * After effect recreation (scene switching, foundry refreshing), playing effects lost its saved sequence (animation, attach and so on). Effects are still laying correctly, but editing is not complete and saving is disabled. [Sequencer issue here](https://github.com/fantasycalendar/FoundryVTT-Sequencer/issues/111), please thumb it up!
  * The same issue affects lights: they detach on effect's recreation

## [0.9.4 - 1.0.0](https://github.com/averrin/director/compare/0.9.4...1.0.0)
Important:
  * Drops v9 compatibility (based on new Sequencer versions), updated to match Sequencer 2.3.15 (e.g. `tieToDocuments`)
  * New "Effects" tab
  * Dropping effects on canvas handler (auto-attaching, edit sequence)

Added:
  * Position/token picker, "linked" mode for `scale` modifier

Premium:
  * Ability to edit/focus/preload effects
  * All effect modifiers (like attachTo/stretchTo/loopProperty)
  * Unlimited saved effects
  * Instant effects on drop (skipping editor)

Known bug/limitation
  * After effect recreation (scene switching, foundry refreshing), playing effects lost its saved sequence (animation, attach and so on). Effects are still laying correctly, but editing is not complete and saving is disabled. [Sequencer issue here](https://github.com/fantasycalendar/FoundryVTT-Sequencer/issues/111), please thumb it up!

## [0.9.2 - 0.9.4](https://github.com/averrin/director/compare/0.9.2...0.9.4)
Fixed:
  * Selects don't react on clicks on text of the selected element
  * Small UI issues

Added:
  * You can disable sequencer's modifier to skip its execution without removing. It's useful when you are using one sequence for several effects with different scale or rotation
  * Game Icons collection for tags and actions icons (`game-icons` value for the corresponding setting)

## [0.9.1 - 0.9.2](https://github.com/averrin/director/compare/0.9.1...0.9.2)
Fixed:
  * Stupid bug prevents saving actions and hooks into scene for v9
  * Dark theme hover buttons' color

## [0.9.0 - 0.9.1](https://github.com/averrin/director/compare/0.9.0...0.9.1)
Added:
  * Dark theme
  * Small QoLs

Fixed:
  * Tag dragging is suppresed by "remove, but keep text"
  * Various ArgInput bugs

## [0.8.8 - 0.9.0](https://github.com/averrin/director/compare/0.8.8...0.9.0)
  * Rebuilt GUI. Synced with Alpha Suit

Added:
  * Walls and Lights in the Selection tab (useful for tag assigning). For lights you need something like "Select tool everywhere".
  * Destroy action (also good for walls and lights)
  * {#}-notation for tags for targets

## [0.8.6 - 0.8.8](https://github.com/averrin/director/compare/0.8.5...0.8.8)
  * Various fixes
  * New action to call another action (only named)
  * A little more compact UI

Known bugs:
  * The list of available actions for "Another action" doesnt update automatcally on changing action's name. Workaround: collapse and open again action, or switch tabs.

## [0.8.5](https://github.com/averrin/director/compare/0.8.4...0.8.5)
  * Various fixes

## [0.8.4](https://github.com/averrin/director/compare/0.8.3...0.8.4)
Added:
  * Tag settings. In addition to a color, now you can choose an icon or set tag "local for scene"
  * Indicator for actions with `ignoreTarget`

Fixed:
  * Switching action type doesn't change argument and its options

## [0.8.3](https://github.com/averrin/director/compare/0.8.2...0.8.3)
Fixed:
  * Broken by v10 show/hide in the Selection tab
  * Toggle token magic doesn't work if targets are selected by Tagger
  * Size in the Selection tab isn't rounded
  * Tag color selection doesn't work in the mutual tag input
  * "Create action" from the selection tab made it with "undefined" type
  * Default color for pickers isn't set


## [0.8.2](https://github.com/averrin/director/compare/0.8.1...0.8.2)
Added:
  * More compact collapsed mode
  * Actions and Hooks can be global
  * "Run Macro" action

Fixed:
  * Tagger component acts weird sometimes if there are more than one instance on page

## [0.8.1](https://github.com/averrin/director/compare/0.8.0...0.8.1)
Fixed:
  * Changing variable type doesnt change list of available variables in arg inputs

Added:
  * Selection tab previews respects tint

## [0.8.0](https://github.com/averrin/director/compare/0.7.2...0.8.0)

Added:
  * Foundry v10 compatibility. Requires Sequencer's [Foundry_v10 branch](https://github.com/fantasycalendar/FoundryVTT-Sequencer/tree/Foundry_v10)
  * `abs` argument for "property" hooks. Applies `Math.abs` before comparing with a threshold
  * `args[1]` of the "setInterval" hook now contains the count of successful calls
  * `animateProperty` / `loopProperty` modifiers for sequences
  * FxMaster integration
  * Setting icon from action's button
  * `runAction` function for the API.
  * "copy oneliner" button for actions
  * `multiply` modifier for repeating section (effect or animation) for all targets
  * Small changes in code generation
  * Collapsed UI mode with actions toolbar (similar to AlphaHUD integration)
  * `alt-D` shortcut for toggle Director window, `alt-c` for toggle collapsing
  * You cannot add a duplicate modifier (there are some exceptions)
  * Support of Sequencer 2.1.9
  * A bunch of missed arguments for modifiers
  * `fadeDuration` for toggle/show/hide sections
  * `addSequence` section

Fixed:
  * Wrong width of argument labels
  * A couple of rare problems in the hooks' calling
  * Sequencer's warning about reading db before it's populated
  * Many problems with arguments' inputs (i suppose, i also added some more bugs)
  * Missed dependencies for v9
  * Manual position picking reset controlled tokens to only the first one.

Known bugs:
  * Color picker for stroke color in text modifier is bugged
  * Alpha in color pickers do nothing
  * Toggle/show/hide sections ignores `fadeDuration` in export as code
  * Non-sequencer sections (hide, kill, so on) with `multiply` cannot be played separately

## [0.7.2](https://github.com/averrin/director/compare/0.7.1...0.7.2)

Fixed:
  * convertToCode error when sequence is obsolete

## [0.7.1](https://github.com/averrin/director/compare/0.7.0...0.7.1)

Fixed:
  * Using variables as effects name causes "@varname" during converting to code

## [0.7.0](https://github.com/averrin/director/compare/0.6.1...0.7.0)

Bad news:
  * I broke your saved actions again, sorry
  * I did significant refactoring, and you know what it means: new bugs.

Good news:
  * Better integration with TokenMagicFX: actions for toggle/add/remove filters
  * Convenient Effects integration: sequencer sections, actions, and even hooks!
  * A bunch of new utility hooks and sections
  * The new, revamped actions UI is now consistent with hooks and sections: with name and collapsible. Also, you can right-click it and select an accent color to highlight the action for better recognition.
  * Extension API to write your own integration (or add your actions/hooks/sections). Documented [here](https://github.com/averrin/director/wiki/For-developers)
  * Tiny Token Attacher's integration: the button for toggling Quick Edit
  * Hopefully, a couple of bugs were fixed. But I'm not sure that the balance is positive.

## [0.6.1](https://github.com/averrin/director/compare/0.6.0...0.6.1)

> 19 July 2022

* Fixed error when default argument option (e.g. "first controlled") was set incorrectly on type change
* Added empty overrides for one-liner copy

## [0.6.0](https://github.com/averrin/director/compare/0.5.4...0.6.0)

> 17 July 2022

First of all, I'm sorry, but all of your saved date will be erased or became broken. I tried to make all breaking changes at once, but I cannot guarantee it, unfortunately.
Please read the [documentation](https://github.com/averrin/director/wiki/How-to-use.-With-examples.), it contains a lot of examples and some useful info for the "hidden" features.
* As always, a couple of bugs fixed, many new added.
* Brand-new feature, Hooks. Now you can fire your actions automatically and use hook arguments to adjust sequences.
* Import/export

I'm going to polish the codebase and fix some bugs before 1.0.0. There are also several missed Sequencer's functions, that I want to implement. And of course, v10 support should be an interesting challenge.

## [0.5.4](https://github.com/averrin/director/compare/0.5.3...0.5.4)

> 4 July 2022

* FIX: Export can fail on some argument types and sometimes stuck when you change active sequence

## [0.5.3](https://github.com/averrin/director/compare/0.5.2...0.5.3)

> 4 July 2022

This is not a very feature-packed release, but quite important for Sequencer's support:
* "Expression" variables can be used for any argument type
* Added a bunch of missed Sequencer's function (see the Readme for the full list)
* Now you can copy a sequence as a macro code. It can contain bugs, but it works for most cases.

## [0.5.2](https://github.com/averrin/director/compare/0.5.1...0.5.2)

> 2 July 2022

* Added two Sequencer's sections: Token Magic Add / remove. Requires the Token Magic FX module.

## [0.5.1](https://github.com/averrin/director/compare/0.5.0...0.5.1)

> 2 July 2022

* A couple of tags-related bugs fixed
* Actions, which plays sequences with "All controlled/targets" or tags override starts sequence for each token, not for only the first.

## [0.5.0](https://github.com/averrin/director/compare/0.4.0...0.5.0)

> 1 July 2022

* As always, some bug fixed, some added
* UI face lifting, more compact layout
* Actions now can use not only tags, but also Controlled & Targets (first, last, all)
* Actions can invoke Sequences (selection will override selected variable)
* A huge bunch of features for Sequencer. The most significant are: Tagger support in variables & code input for `playIf` and `thenDo`.

https://user-images.githubusercontent.com/426007/176953701-f63c5dc6-6621-4dd1-abc3-87f7a756feeb.mp4

## [0.4.0](https://github.com/averrin/director/compare/0.3.1...0.4.0)

> 30 June 2022

* Many bugs fixed
* Many bugs created
* Added support for Animation and Sound section
* Many QoL and UX tweaks.

Sequencer's editor is still beta, disabled by default. Please turn on it in the module settings.

## [0.3.1](https://github.com/averrin/director/compare/0.3.0...0.3.1)

> 30 June 2022

Should fix weird bug with combat tracker and huge amount of undetected others.

## [0.3.0](https://github.com/averrin/director/compare/0.2.0...0.3.0)

> 29 June 2022

* UI refactoring. Can cause minor regressions
* Fixed the bug when "MATT execute" can fail if not every tile with tag has triggers.

### Sequencer editor Beta
The Sequencer tab is disabled by default, you can enable it in the module's settings. Do it if you really want to fight with WIP software.

First, it's more alpha than beta. It's buggy, has no error handling or any QOL and supports a very limited quantity of functions. There is no `sound` or `animation` support yet. But you can already click a couple of simple effects without macro.

Speaking about macro. There are two API functions to integrate it with your tools:
```
Director.playSequence("%Sequence name%", {"%variable%": "%value%"})
```
Playing a sequence by name. You are also able to specify overrides for sequence's variables

```
Director.getSequence("%Sequence name%", {"%variable%": "%value%"})
```
Returns native Sequencer's sequence.

Please, use https://github.com/averrin/director/labels/Sequencer%20BETA label if you want to create an issue (but more likely it won't be very relevant)

## [0.2.0](https://github.com/averrin/director/compare/0.1.1...0.2.0)

> 25 June 2022

- Fixed style clash with Plutonium
- More compact UI layout
- UI Scale setting
- Using tile thumbs instead of full-size (should help when selected a huge tile)

## [0.1.1](https://github.com/averrin/director/compare/0.1.0...0.1.1)

> 24 June 2022

Day one fix

## 0.1.0

> 24 June 2022

The first one. Buggy but important.
