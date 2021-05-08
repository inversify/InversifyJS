import * as ERROR_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import { interfaces } from "../interfaces/interfaces";
import { getArrayDuplicate } from "../utils/js";

function tagParameter(
    annotationTarget: any,
    propertyName: string,
    parameterIndex: number,
    metadata: interfaces.MetadataOrMetadataArray
) {
    if(propertyName !== undefined) {
        throw new Error(ERROR_MSGS.INVALID_DECORATOR_OPERATION);
    }
    _tagParameterOrProperty(METADATA_KEY.TAGGED, annotationTarget, parameterIndex.toString(), metadata);
}

function tagProperty(
    annotationTarget: any,
    propertyName: string,
    metadata: interfaces.MetadataOrMetadataArray
) {
    _tagParameterOrProperty(METADATA_KEY.TAGGED_PROP, annotationTarget.constructor, propertyName, metadata);
}

function _ensureNoMetadataKeyDuplicates(metadata: interfaces.MetadataOrMetadataArray):interfaces.Metadata[]{
    let metadatas: interfaces.Metadata[] = [];
    if(Array.isArray(metadata)){
        metadatas = metadata;
        const duplicate = getArrayDuplicate(metadatas.map(md => md.key));
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
    annotationTarget: any,
    key: string,
    metadata: interfaces.MetadataOrMetadataArray,
) {
    const metadatas: interfaces.Metadata[] = _ensureNoMetadataKeyDuplicates(metadata);

    let paramsOrPropertiesMetadata: interfaces.ReflectResult = {};

    // read metadata if available
    if (Reflect.hasOwnMetadata(metadataKey, annotationTarget)) {
        paramsOrPropertiesMetadata = Reflect.getMetadata(metadataKey, annotationTarget);
    }

    let paramOrPropertyMetadata: interfaces.Metadata[] | undefined = paramsOrPropertiesMetadata[key];

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
    paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata;
    Reflect.defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);

}

function createTaggedDecorator(
    metadata:interfaces.MetadataOrMetadataArray,
    callback?:(target: any, targetKey: string, index?: number | PropertyDescriptor) => void
) {
    return function(target: any, targetKey: string, index?: number | PropertyDescriptor) {
        if(callback){
            callback(target, targetKey, index);
        }
        if (typeof index === "number") {
            tagParameter(target, targetKey, index, metadata);
        } else {
            tagProperty(target, targetKey, metadata);
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
