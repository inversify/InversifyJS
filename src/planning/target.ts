///<reference path="../interfaces/interfaces.d.ts" />

import Metadata from "../planning/metadata";
import QueryableString from "./queryable_string";
import * as METADATA_KEY from "../constants/metadata_keys";

class Target implements ITarget {

  public serviceIdentifier: (string|Symbol|INewable<any>);
  public name: QueryableString;
  public metadata: Array<IMetadata>;

  constructor(name: string, serviceIdentifier: (string|Symbol|INewable<any>), namedOrTagged?: (string|IMetadata)) {

    this.serviceIdentifier = serviceIdentifier;
    this.name = new QueryableString(name || "");
    this.metadata = new Array<IMetadata>();
    let metadataItem: IMetadata = null;

    // is named target
    if (typeof namedOrTagged === "string") {
        metadataItem = new Metadata(METADATA_KEY.NAMED_TAG, namedOrTagged);
    } else if (namedOrTagged instanceof Metadata) {
        // is target with metadata
        metadataItem = namedOrTagged;
    }

    // target has metadata
    if (metadataItem !== null) {
        this.metadata.push(metadataItem);
    }
  }

  public hasTag(key: string): boolean {
    for (let i = 0; i < this.metadata.length; i++) {
      let m = this.metadata[i];
      if (m.key === key) {
        return true;
      }
    }
    return false;
  }

  public isArray(): boolean {
      return this.hasTag(METADATA_KEY.MULTI_INJECT_TAG);
  }

  public matchesArray(name: string|Symbol|any): boolean {
    return this.matchesTag(METADATA_KEY.MULTI_INJECT_TAG)(name);
  }

  public isNamed(): boolean {
      return this.hasTag(METADATA_KEY.NAMED_TAG);
  }

  public isTagged(): boolean {
    if (this.metadata.length > 1) {
        return true;
    } else if (this.metadata.length === 1) {
        // NAMED_TAG is not considered a tagged binding
        return !this.hasTag(METADATA_KEY.NAMED_TAG);
    } else {
        return false;
    }
  }

  public matchesNamedTag(name: string): boolean {
    return this.matchesTag(METADATA_KEY.NAMED_TAG)(name);
  }

  public matchesTag(key: string) {
    return (value: any) => {
        for (let i = 0; i < this.metadata.length; i++) {
            let m = this.metadata[i];
            if (m.key === key && m.value === value) {
                return true;
            }
        }
        return false;
    };
  }

}

export default Target;
