import * as ERROR_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { getFirstArrayDuplicate } from "../utils/js";

function tagParameter(
    annotationTarget: Object,
    propertyName: string | symbol | undefined,
    parameterIndex: number,
    metadata: interfaces.MetadataOrMetadataArray
) {
    if(propertyName !== undefined) {
        throw new Error(ERROR_MSGS.INVALID_DECORATOR_OPERATION);
    }
    _tagParameterOrProperty(METADATA_KEY.TAGGED, annotationTarget, parameterIndex.toString(), metadata);
}

function tagProperty(
    annotationTarget: Object,
    propertyName: string | symbol,
    metadata: interfaces.MetadataOrMetadataArray
) {
    _tagParameterOrProperty(METADATA_KEY.TAGGED_PROP, annotationTarget.constructor, propertyName, metadata);
}

function _ensureNoMetadataKeyDuplicates(metadata: interfaces.MetadataOrMetadataArray):interfaces.Metadata[]{
    let metadatas: interfaces.Metadata[] = [];
    if(Array.isArray(metadata)){
        metadatas = metadata;
        const duplicate = getFirstArrayDuplicate(metadatas.map(md => md.key));
        if(duplicate !== undefined) {
            throw new Error(`${ERROR_MSGS.DUPLICATED_METADATA} ${duplicate.toString()}`);
        }
    }else{
        metadatas = [metadata];
    }
    return metadatas;
}

function _tagParameterOrProperty(
    metadataKey: string,
    annotationTarget: Object,
    key: string | symbol,
    metadata: interfaces.MetadataOrMetadataArray,
) {
    const metadatas: interfaces.Metadata[] = _ensureNoMetadataKeyDuplicates(metadata);

    let paramsOrPropertiesMetadata:Record<string | symbol, interfaces.Metadata[] | undefined>  = {};
    // read metadata if available
    if (Reflect.hasOwnMetadata(metadataKey, annotationTarget)) {
        paramsOrPropertiesMetadata = Reflect.getMetadata(metadataKey, annotationTarget);
    }

    let paramOrPropertyMetadata: interfaces.Metadata[] | undefined = paramsOrPropertiesMetadata[key as any];

    if (paramOrPropertyMetadata === undefined) {
        paramOrPropertyMetadata = [];
    } else {
        for (const m of paramOrPropertyMetadata) {
            if (metadatas.some(md => md.key === m.key)) {
                throw new Error(`${ERROR_MSGS.DUPLICATED_METADATA} ${m.key.toString()}`);
            }
        }
    }

    // set metadata
    paramOrPropertyMetadata.push(...metadatas);
    paramsOrPropertiesMetadata[key as any] = paramOrPropertyMetadata;
    Reflect.defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);

}

function createTaggedDecorator(
    metadata:interfaces.MetadataOrMetadataArray,
) {
    return (target:Object, targetKey:string | symbol | undefined, indexOrPropertyDescriptor?:number | TypedPropertyDescriptor<unknown>) => {
        if (typeof indexOrPropertyDescriptor === "number") {
            tagParameter(target, targetKey, indexOrPropertyDescriptor, metadata);
        } else {
            tagProperty(target, targetKey as string | symbol, metadata);
        }
    };
}

function _decorate(decorators: any[], target: any): void {
    Reflect.decorate(decorators, target);
}

function _param(paramIndex: number, decorator: ParameterDecorator) {
    return function (target: any, key: string) { decorator(target, key, paramIndex); };
}

// Allows VanillaJS developers to use decorators:
// decorate(injectable("Foo", "Bar"), FooBar);
// decorate(targetName("foo", "bar"), FooBar);
// decorate(named("foo"), FooBar, 0);
// decorate(tagged("bar"), FooBar, 1);
function decorate(
    decorator: (ClassDecorator | ParameterDecorator | MethodDecorator),
    target: any,
    parameterIndex?: number | string): void {

    if (typeof parameterIndex === "number") {
        _decorate([_param(parameterIndex, decorator as ParameterDecorator)], target);
    } else if (typeof parameterIndex === "string") {
        Reflect.decorate([decorator as MethodDecorator], target, parameterIndex);
    } else {
        _decorate([decorator as ClassDecorator], target);
    }
}

export { decorate, tagParameter, tagProperty, createTaggedDecorator };
