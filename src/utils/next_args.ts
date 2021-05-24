import { interfaces, TargetTypeEnum } from "../inversify";

type Key = string | symbol | number | undefined;

type GetArgs<T> = Omit<interfaces.NextArgs<T>, 'contextInterceptor' | 'targetType' | 'key' | 'value'>

type MarkedTags = interfaces.Tag[] & { original: true, key: Key, value: any }

export class NextArgs<T> implements interfaces.NextArgs<T>{
  public avoidConstraints: boolean;
  public contextInterceptor: (contexts: interfaces.Context) => interfaces.Context = (context) => context;
  public isMultiInject: boolean;
  public targetType = TargetTypeEnum.Variable;
  public serviceIdentifier: interfaces.ServiceIdentifier<T>;
  public key?: Key;
  public value?: any;
  public tags: interfaces.Tag[];

  constructor(getArgs: GetArgs<T>) {
    if (getArgs.tags === undefined) {
      throw new Error("tags should be defined");
    }
    this.key = getArgs.tags[0]?.[0];
    this.value = getArgs.tags[0]?.[1];
    this.avoidConstraints = getArgs.avoidConstraints;
    this.isMultiInject = getArgs.isMultiInject;
    this.serviceIdentifier = getArgs.serviceIdentifier;
    this._setTags(getArgs.tags)
  }

  private _setTags(tags: interfaces.Tag[]) {
    this.tags = tags
    this._markTags()
  }

  private _markTags() {
    const markedTags = this.tags as MarkedTags;
    markedTags.original = true;
    markedTags.key = this.key;
    markedTags.value = this.value;
  }

  private static _fixUpTags(key: Key, value: unknown, tags: interfaces.Tag[]): interfaces.Tag[] {
    if (tags.length > 0) {
      const remainingTags = [...tags];
      const firstTag = remainingTags.shift() as interfaces.Tag;
      if (key === undefined) {
        return remainingTags;
      }
      if (key !== firstTag[0] || value !== firstTag[1]) {
        return [[key, value], ...remainingTags];
      }
      return tags;
    } else if (key !== undefined) {
      return [[key, value]];
    }
    return []
  }

  private static _isMarkedTags(tags: interfaces.Tag[]): tags is MarkedTags {
    return (tags as MarkedTags).original;
  }

  private static _getTagsIfGuaranteedOldMiddleware(tags: interfaces.Tag[] | undefined, key: Key, value: unknown): interfaces.Tag[] | null {
    if (tags === undefined) {
      return key === undefined ? [] : [[key, value]];
    }
    return null;
  }

  private static _getTagsBasedOnMarks(tags: interfaces.Tag[], key: Key, value: unknown): interfaces.Tag[] {
    if (NextArgs._isMarkedTags(tags)) {
      const originalKey = tags.key;
      const originalValue = tags.value;
      if (key !== originalKey || value !== originalValue) {
        tags = NextArgs._fixUpTags(key, value, tags);
      }
    }
    return tags;
  }

  private static _getTags(tags: interfaces.Tag[] | undefined, key: Key, value: unknown): interfaces.Tag[] {
    return NextArgs._getTagsIfGuaranteedOldMiddleware(tags, key, value) ??
      NextArgs._getTagsBasedOnMarks(tags!, key, value);
  }

  public static getTags(nextArgs: interfaces.NextArgs<unknown>): interfaces.Tag[] {
    return NextArgs._getTags(nextArgs.tags, nextArgs.key, nextArgs.value);
  }

}