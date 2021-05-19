import { interfaces } from "../interfaces/interfaces";

const isTagsCollection = (tags: interfaces.Tags): tags is [interfaces.Tag[]] => Array.isArray(tags[0])

export function normalizeTags(tags: interfaces.Tags): interfaces.Tag[] {
  if (isTagsCollection(tags)) {
    return tags[0]
  }
  return [tags]
}

export function cloneTags(tags: interfaces.Tag[]): interfaces.Tag[] {
  return tags.map(tag => [tag[0], tag[1]])
}

export class TagsArray extends Array<interfaces.Tag> {
  private readonly originalTags: interfaces.Tag[] = [];

  constructor(...originalTags: interfaces.Tag[]) {
    super(...originalTags)
    this.originalTags = cloneTags(originalTags)
  }

  public hasChanged() {
    return this.originalTags.length !== this.length
      ? true
      : this.originalTags.some(
        (originalTag, i) => originalTag[0] !== this[i][0] || originalTag[1] !== this[i][1]);
  }

  public getTags(key: string | symbol | number | undefined, value: unknown): interfaces.Tag[] {
    if (this.hasChanged()) {
      return this
    }
    if (this.originalTags.length > 0) {
      const tags = [...this];
      const firstTag = tags.shift() as interfaces.Tag;
      if (key === undefined) {
        return tags;
      }
      if (key !== firstTag[0] || value !== firstTag[1]) {
        return [[key, value], ...tags];
      }
      return this
    } else if (key !== undefined) {
      return [[key, value]];
    }
    return []
  }
}
