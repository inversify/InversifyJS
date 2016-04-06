/// <reference path="./queryable_string.d.ts" />
/// <reference path="./metadata.d.ts" />

interface ITarget {
    service: (string|Symbol|INewable<any>);
    name: IQueryableString;
    metadata: Array<IMetadata>;
    hasTag(key: string): boolean;
    isArray(): boolean;
    matchesArray(name: string|Symbol|any): boolean;
    isNamed(): boolean;
    isTagged(): boolean;
    getServiceAsString(): string;
    matchesNamedTag(name: string): boolean;
    matchesTag(key: string): (value: any) => boolean;
}
