import interfaces from "../interfaces/interfaces";
import Metadata from "../planning/metadata";
import QueryableString from "./queryable_string";
import * as METADATA_KEY from "../constants/metadata_keys";
import TargetType from "./target_type";
import guid from "../utils/guid";

class Target implements interfaces.Target {

    public guid: string;
    public type: TargetType;
    public serviceIdentifier: interfaces.ServiceIdentifier<any>;
    public name: interfaces.QueryableString;
    public metadata: Array<Metadata>;

    constructor(
        type: TargetType,
        name: string,
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        namedOrTagged?: (string|Metadata)
    ) {

        this.guid = guid();
        this.type = type;
        this.serviceIdentifier = serviceIdentifier;
        this.name = new QueryableString(name || "");
        this.metadata = new Array<Metadata>();
        let metadataItem: interfaces.Metadata = null;

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
