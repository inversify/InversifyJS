/// <reference path="./queryable_string.d.ts" />
/// <reference path="./metadata.d.ts" />

interface ITarget {
  service: IQueryableString;
  name: IQueryableString;
  metadata: Array<IMetadata>;
  isArray(): boolean;
  isNamed(): boolean;
  isTagged(): boolean;
  matchesName(name: string): boolean;
  matchesTag(name: IMetadata): boolean;
}
