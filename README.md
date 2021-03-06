# Director

Module in active development, even minor versions can (and most likely will) break your saved data (actions / hooks / sequences). Please consider it before updating. If feature marked as `alpha` it means patch versions are dangerous too. Sorry for that, but it's the only way to deliver these features for you.

Are you annoyed with assigning a single tag for a huge bunch of tiles? Or with managing all your MATT-powered switches on a scene? This module is a solution!
Just select all your tiles (or tokens) and drag&drop the tag to assign it. Choose a color for it (useless but fancy) and create an action: toggle your tiles' visibility or fire the Active Tiles' trigger. 
Your actions are stored in the scene's data so that you can have many of them. The global tags are global; let's be consistent across the scenes!

Director sometimes looks too complex, so read [Documentation](https://github.com/averrin/director/wiki/How-to-use.-With-examples.). It contains a couple of easy to go examples.

## Hints
- you can drag and drop tags
- right click on tag opens a color picker
- click on "visible/hidden" tag in a selection card toggles visibility
- You can [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/averrin)

## Supported actions
It's not going to be MATT's alternative, so actions are pretty basic
- Execute a trigger [requires MATT]
- Toggle visibility
- Hide
- Show
- Kill [only for tokens]
- Revive [only for tokens]
- Play a sequence
- Stop Sequencer's effects

## Integrations
* Tagger [required]
* Monk's Active Tiles Triggers
* Sequencer [BETA, required]
* Token Magic FX [Virtual Sequencer's section]

## Plans
- [ ] Documentation
- [ ] Extension API
- [ ] v10 support
- [ ] Beginner / Expert UI mode
- [ ] Better import / export
- [ ] Better support of Sequencer's functions and types
- [ ] Better support for Token Magic FX
- [ ] Support for Dynamic Active Effects
- [ ] Hooks for ending effects of a sequence. E.g. to destroy DAE's effects.
- [ ] [Alpha HUD](https://github.com/averrin/alpha-hud) integrations. A scene widget with something like the hotbar.

## Images (quite outdated, see docs)
![toolbar](/assets/toolbar.png)
![selection](/assets/selection.png)
![actions](/assets/actions.png)
![sequencer](/assets/sequencer.png)

## My modules
- [Alpha HUD](https://github.com/averrin/alpha-hud)
- [Merchant Control](https://github.com/averrin/merchant-control)
