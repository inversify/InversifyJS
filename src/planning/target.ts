import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { guid } from "../utils/guid";
import { Metadata } from "./metadata";
import { QueryableString } from "./queryable_string";

class Target implements interfaces.Target {

    public guid: string;
    public type: interfaces.TargetType;
    public serviceIdentifier: interfaces.ServiceIdentifier<any>;
    public name: interfaces.QueryableString;
    public metadata: Metadata[];

    public constructor(
        type: interfaces.TargetType,
        name: string,
        serviceIdentifier: interfaces.ServiceIdentifier<any>,
        namedOrTagged?: (string | Metadata)
    ) {

        this.guid = guid();
        this.type = type;
        this.serviceIdentifier = serviceIdentifier;
        this.name = new QueryableString(name || "");
        this.metadata = new Array<Metadata>();

        let metadataItem: interfaces.Metadata | null = null;

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
        for (const m of this.metadata) {
            if (m.key === key) {
                return true;
            }
        }
        return false;
    }

    public isArray(): boolean {
        return this.hasTag(METADATA_KEY.MULTI_INJECT_TAG);
    }

    public matchesArray(name: interfaces.ServiceIdentifier<any>): boolean {
        return this.matchesTag(METADATA_KEY.MULTI_INJECT_TAG)(name);
    }

    public isNamed(): boolean {
        return this.hasTag(METADATA_KEY.NAMED_TAG);
    }

    public isTagged(): boolean {
        return this.metadata.some((m) =>
            (m.key !== METADATA_KEY.INJECT_TAG) &&
                   (m.key !== METADATA_KEY.MULTI_INJECT_TAG) &&
                   (m.key !== METADATA_KEY.NAME_TAG) &&
                   (m.key !== METADATA_KEY.UNMANAGED_TAG) &&
                   (m.key !== METADATA_KEY.NAMED_TAG));
    }

    public isOptional(): boolean {
        return this.matchesTag(METADATA_KEY.OPTIONAL_TAG)(true);
    }

    public getNamedTag(): interfaces.Metadata | null {
        if (this.isNamed()) {
            return this.metadata.filter((m) => m.key === METADATA_KEY.NAMED_TAG)[0];
        }
        return null;
    }

    public getCustomTags(): interfaces.Metadata[] | null {
        if (this.isTagged()) {
            return this.metadata.filter((m) =>
                (m.key !== METADATA_KEY.INJECT_TAG) &&
                    (m.key !== METADATA_KEY.MULTI_INJECT_TAG) &&
                    (m.key !== METADATA_KEY.NAME_TAG) &&
                    (m.key !== METADATA_KEY.UNMANAGED_TAG) &&
                    (m.key !== METADATA_KEY.NAMED_TAG));
        }
        return null;
    }

    public matchesNamedTag(name: string): boolean {
        return this.matchesTag(METADATA_KEY.NAMED_TAG)(name);
    }

    public matchesTag(key: string) {
        return (value: any) => {
            for (const m of this.metadata) {
                if (m.key === key && m.value === value) {
                    return true;
                }
            }
            return false;
        };
    }

}

export { Target };
