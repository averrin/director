import { moduleId, SETTINGS, FLAGS } from '../constants.js';
import { plainToClass } from 'class-transformer';

export default class Tag {
  constructor(text) {
    this.text = text;
    this.color = "#46525D";
    this.icon = undefined;
    this.global = true;
    this.version = 1;
  }

  static fromPlain(plain) {
    if (typeof plain === 'string' || plain instanceof String) {
      try {
        plain = JSON.parse(plain);
      } catch (error) {
        return undefined;
      }
    }
    const t = plainToClass(Tag, plain);
    return t;
  }
}

export async function migrateOldTags() {
  let colors = game.settings.get(moduleId, SETTINGS.TAG_COLORS);
  if (Object.keys(colors).length > 0) {
    const tags = [];
    for (const [t, c] of Object.entries(colors)) {
      const tag = new Tag(t);
      tag.color = c;
      tags.push(tag);
    }
    await game.settings.set(moduleId, SETTINGS.TAGS, tags);
    await game.settings.set(moduleId, SETTINGS.TAG_COLORS, {});
  }
}
