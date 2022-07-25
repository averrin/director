### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### [0.7.0](https://github.com/averrin/director/compare/0.6.1...0.7.0)

Bad news:
  * I broke your saved actions again, sorry
  * I did significant refactoring, and you know what it means: new bugs.
Good news:
  * Better integration with TokenMagicFX: actions for toggle/add/remove filters
  * Convenient Effects integration: sequencer sections, actions, and even hooks!
  * A bunch of new utility hooks and sections
  * The new, revamped actions UI is now consistent with hooks and sections: with name and collapsible. Also, you can right-click it and select an accent color to highlight the action for better recognition.
  * Extension API to write your own integration (or add your actions/hooks/sections).
  * Tiny Token Attacher's integration: the button for toggling Quick Edit
  * Hopefully, a couple of bugs were fixed. But I'm not sure that the balance is positive.

- pre-release 0.7 [`b8b5e3b`](https://github.com/averrin/director/commit/b8b5e3bdcbba2b360f9ad2bd126cd2d4f6dd1358)
- integrations api [`1e47c03`](https://github.com/averrin/director/commit/1e47c032deb4ac219629a060895d1a0395bd3218)
- integrations api [`c34dd4d`](https://github.com/averrin/director/commit/c34dd4dbef8cb4e53dd47d3f409a75949fa70cc9)

#### [0.6.1](https://github.com/averrin/director/compare/0.6.0...0.6.1)

> 19 July 2022

* Fixed error when default argument option (e.g. "first controlled") was set incorrectly on type change
* Added empty overrides for one-liner copy

- fix for arg input default value; better one-liner [`6b07da4`](https://github.com/averrin/director/commit/6b07da4b231c56c258c53f2c7fde722b8f17fe96)

#### [0.6.0](https://github.com/averrin/director/compare/0.5.4...0.6.0)

> 17 July 2022

First of all, I'm sorry, but all of your saved date will be erased or became broken. I tried to make all breaking changes at once, but I cannot guarantee it, unfortunately.
Please read the [documentation](https://github.com/averrin/director/wiki/How-to-use.-With-examples.), it contains a lot of examples and some useful info for the "hidden" features.
* As always, a couple of bugs fixed, many new added.
* Brand-new feature, Hooks. Now you can fire your actions automatically and use hook arguments to adjust sequences.
* Import/export

I'm going to polish the codebase and fix some bugs before 1.0.0. There are also several missed Sequencer's functions, that I want to implement. And of course, v10 support should be an interesting challenge.

- huge bunch of new features and fixes [`c54d575`](https://github.com/averrin/director/commit/c54d575e60ebee796a4f3a4a1156985ec2ef67cf)
- refactoring, hooks, endEffects [`805d62b`](https://github.com/averrin/director/commit/805d62b8fefa0b67642ad8c2abedadadb7d45689)
- readme [`011d9f9`](https://github.com/averrin/director/commit/011d9f9a631eddd7748251b3667b8c70a33d77a0)

#### [0.5.4](https://github.com/averrin/director/compare/0.5.3...0.5.4)

> 4 July 2022

* FIX: Export can fail on some argument types and sometimes stuck when you change active sequence

- fix stuck copy code [`f12e4bd`](https://github.com/averrin/director/commit/f12e4bd07ed1a7a473296406e0785307a2ba4420)

#### [0.5.3](https://github.com/averrin/director/compare/0.5.2...0.5.3)

> 4 July 2022

This is not a very feature-packed release, but quite important for Sequencer's support:
* "Expression" variables can be used for any argument type
* Added a bunch of missed Sequencer's function (see the Readme for the full list)
* Now you can copy a sequence as a macro code. It can contain bugs, but it works for most cases.

- more modifiers [`a829a9a`](https://github.com/averrin/director/commit/a829a9a7be324ed151f120bdd6133865179272db)
- more modifiers [`f2963a9`](https://github.com/averrin/director/commit/f2963a917c6842a1f3f7d0fa282bdaf79c64d1dc)
- more modifiers [`cb6a4d9`](https://github.com/averrin/director/commit/cb6a4d9b202252074994c48c9623e7ba6791801b)

#### [0.5.2](https://github.com/averrin/director/compare/0.5.1...0.5.2)

> 2 July 2022

* Added two Sequencer's sections: Token Magic Add / remove. Requires the Token Magic FX module.

- initial TokenMagic support [`6249e6b`](https://github.com/averrin/director/commit/6249e6b854d799df77997db6a1d5f8e2e3833edd)
- initial TokenMagic support [`d5c92e8`](https://github.com/averrin/director/commit/d5c92e8989bfaa1ca8091dd3cf703936c9bd70be)

#### [0.5.1](https://github.com/averrin/director/compare/0.5.0...0.5.1)

> 2 July 2022

* A couple of tags-related bugs fixed
* Actions, which plays sequences with "All controlled/targets" or tags override starts sequence for each token, not for only the first.

- tag fixes, actions seqs forEach [`9b72d5c`](https://github.com/averrin/director/commit/9b72d5cb75160037d9d19e6b1a6e5f2904ac9067)

#### [0.5.0](https://github.com/averrin/director/compare/0.4.0...0.5.0)

> 1 July 2022

* As always, some bug fixed, some added
* UI face lifting, more compact layout
* Actions now can use not only tags, but also Controlled & Targets (first, last, all)
* Actions can invoke Sequences (selection will override selected variable)
* A huge bunch of features for Sequencer. The most significant are: Tagger support in variables & code input for `playIf` and `thenDo`.

https://user-images.githubusercontent.com/426007/176953701-f63c5dc6-6621-4dd1-abc3-87f7a756feeb.mp4

- pre 0.5.0 [`cbbc1a7`](https://github.com/averrin/director/commit/cbbc1a74b098c595aba13b076a3740eb69f4a8b0)
- pre 0.5.0 [`547c0b4`](https://github.com/averrin/director/commit/547c0b466755f03ea61e5c1cc4ec6afb4298a664)

#### [0.4.0](https://github.com/averrin/director/compare/0.3.1...0.4.0)

> 30 June 2022

* Many bugs fixed
* Many bugs created
* Added support for Animation and Sound section
* Many QoL and UX tweaks.

Sequencer's editor is still beta, disabled by default. Please turn on it in the module settings.

- animation and sound [`6e00339`](https://github.com/averrin/director/commit/6e0033947ea34422f4c26112bfa7033292e539db)
- section collapsing [`979e609`](https://github.com/averrin/director/commit/979e6098f49058f0b0217a9d24411bb2a06b0b2a)

#### [0.3.1](https://github.com/averrin/director/compare/0.3.0...0.3.1)

> 30 June 2022

Should fix weird bug with combat tracker and huge amount of undetected others.

- fix style leakage; close #1 [`#1`](https://github.com/averrin/director/issues/1)

#### [0.3.0](https://github.com/averrin/director/compare/0.2.0...0.3.0)

> 29 June 2022

* UI refactoring. Can cause minor regressions
* Fixed the bug when "MATT execute" can fail if not every tile with tag has triggers.

## Sequencer editor Beta
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

- sequencer beta [`6fdf263`](https://github.com/averrin/director/commit/6fdf26365ebfc6fba9df297e1443a16b03b05ed9)

#### [0.2.0](https://github.com/averrin/director/compare/0.1.1...0.2.0)

> 25 June 2022

- Fixed style clash with Plutonium
- More compact UI layout
- UI Scale setting
- Using tile thumbs instead of full-size (should help when selected a huge tile)

- compact ui, style fixes, thumbs [`348c67e`](https://github.com/averrin/director/commit/348c67e22b996ca8269458fcdbbe78fcb05a1cb5)

#### [0.1.1](https://github.com/averrin/director/compare/0.1.0...0.1.1)

> 24 June 2022

Day one fix

- fix [`549b158`](https://github.com/averrin/director/commit/549b158e3d0d2833198c69b63b3d2fb033128824)

#### 0.1.0

> 24 June 2022

The first one. Buggy but important.

- init [`245ca25`](https://github.com/averrin/director/commit/245ca2554ae1e0704557ca7788ca4dea258ae407)
- readme [`41276aa`](https://github.com/averrin/director/commit/41276aa8aa536e07d14a06356cbffc1a45ceb656)
- Update README.md [`23885ac`](https://github.com/averrin/director/commit/23885ac5d618a4e5aae3c770f4202669cbae8a46)
