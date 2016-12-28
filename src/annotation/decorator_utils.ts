import { interfaces } from "../interfaces/interfaces";
import * as METADATA_KEY from "../constants/metadata_keys";
import * as ERROR_MSGS from "../constants/error_msgs";

function tagParameter(
    annotationTarget: any,
    propertyName: string,
    parameterIndex: number,
    metadata: interfaces.Metadata
) {
    let metadataKey = METADATA_KEY.TAGGED;
    _tagParameterOrProperty(metadataKey, annotationTarget, propertyName, metadata, parameterIndex);
}

function tagProperty(
    annotationTarget: any,
    propertyName: string,
    metadata: interfaces.Metadata
) {
    let metadataKey = METADATA_KEY.TAGGED_PROP;
    _tagParameterOrProperty(metadataKey, annotationTarget.constructor, propertyName, metadata);
}

function _tagParameterOrProperty(
    metadataKey: string,
    annotationTarget: any,
    propertyName: string,
    metadata: interfaces.Metadata,
    parameterIndex?: number
) {

    let paramsOrPropertiesMetadata: interfaces.ReflectResult = {};
    let isParameterDecorator = (typeof parameterIndex === "number");
    let key: string = (parameterIndex !== undefined && isParameterDecorator) ? parameterIndex.toString() : propertyName;

    // If the decorator is used as a parameter decorator property name must be provided
    if (isParameterDecorator === true && propertyName !== undefined) {
        throw new Error(ERROR_MSGS.INVALID_DECORATOR_OPERATION);
    }

    // read metadata if avalible
    if (Reflect.hasOwnMetadata(metadataKey, annotationTarget) === true) {
        paramsOrPropertiesMetadata = Reflect.getMetadata(metadataKey, annotationTarget);
    }

    // get metadata for the decorated parameter by its index
    let paramOrPropertyMetadata: interfaces.Metadata[] = paramsOrPropertiesMetadata[key];
    if (Array.isArray(paramOrPropertyMetadata) !== true) {
        paramOrPropertyMetadata = [];
    } else {
        for (let i = 0; i < paramOrPropertyMetadata.length; i++) {
            let m: interfaces.Metadata = paramOrPropertyMetadata[i];
            if (m.key === metadata.key) {
                throw new Error(`${ERROR_MSGS.DUPLICATED_METADATA} ${m.key}`);
            }
        }
    }

    // set metadata
    paramOrPropertyMetadata.push(metadata);
    paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata;
    Reflect.defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);
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
    decorator: (ClassDecorator|ParameterDecorator),
    target: any,
    parameterIndex?: number): void {

    if (typeof parameterIndex === "number") {
        _decorate([_param(parameterIndex, <ParameterDecorator>decorator)], target);
    } else {
        _decorate([<ClassDecorator>decorator], target);
    }
}

export { decorate, tagParameter, tagProperty };
