import { interfaces } from "../interfaces/interfaces";

const isTagsCollection = (tags: interfaces.Tags): tags is [interfaces.Tag[]] => Array.isArray(tags[0])

export function normalizeTags(tags: interfaces.Tags): interfaces.Tag[] {
    if (isTagsCollection(tags)) {
        return tags[0]
    }
    return [tags]
}

export function cloneTags(tags: interfaces.Tag[]): interfaces.Tag[] {
  return tags.map(([key, value]) => [key, value])
}