import { interfaces } from "../interfaces/interfaces";
import { getFunctionName } from "../utils/serialization";
import { Target } from "./target";
import * as ERROR_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import { TargetTypeEnum } from "../constants/literal_types";

function getDependencies(func: Function): interfaces.Target[] {

    let constructorName = getFunctionName(func);
    let targets: interfaces.Target[] = getTargets(func, false);

    // Throw if a derived class does not implement its constructor explicitly
    // We do this to prevent errors when a base class (parent) has dependencies
    // and one of the derived classes (children) has no dependencies
    let baseClassDepencencyCount = getBaseClassDepencencyCount(func);
    if (targets.length < baseClassDepencencyCount) {
        let error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_1 +
                    constructorName + ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_2;
        throw new Error(error);
    }

    return targets;
}

function getTargets(func: Function, isBaseClass: boolean): interfaces.Target[] {

    let constructorName = getFunctionName(func);

    // TypeScript compiler generated annotations
    let serviceIdentifiers = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, func);

    // All types resolved bust be annotated with @injectable
    if (serviceIdentifiers === undefined) {
        let msg = `${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} ${constructorName}.`;
        throw new Error(msg);
    }

    // User generated annotations
    let constructorArgsMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, func) || [];

    let targets = [
        ...(
            getConstructorArgsAsTargets(
                isBaseClass, constructorName, serviceIdentifiers, constructorArgsMetadata, func.length
            )
        ),
        ...(getClassPropsAsTargets(func))
    ];

    return targets;

}

function getConstructorArgsAsTargets(
    isBaseClass: boolean,
    constructorName: string,
    serviceIdentifiers: any,
    constructorArgsMetadata: any,
    constructorLength: number
) {

    let targets: interfaces.Target[] = [];

    for (let i = 0; i < constructorLength; i++) {

        // Create map from array of metadata for faster access to metadata
        let targetMetadata = constructorArgsMetadata[i.toString()] || [];
        let metadata = formatTargetMetadata(targetMetadata);

        // Take types to be injected from user-generated metadata
        // if not available use compiler-generated metadata
        let serviceIndentifier = serviceIdentifiers[i];
        let hasInjectAnnotations = (metadata.inject || metadata.multiInject);
        serviceIndentifier = (hasInjectAnnotations) ? (hasInjectAnnotations) : serviceIndentifier;

        // Types Object and Function are too ambiguous to be resolved
        // user needs to generate metadata manually for those
        let isObject = serviceIndentifier === Object;
        let isFunction = serviceIndentifier === Function;
        let isUndefined = serviceIndentifier === undefined;
        let isUnknownType = (isObject || isFunction || isUndefined);

        if (isBaseClass === false && isUnknownType) {
            let msg = `${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument ${i} in class ${constructorName}.`;
            throw new Error(msg);
        }

        // Create target
        let target = new Target(TargetTypeEnum.ConstructorArgument, metadata.targetName, serviceIndentifier);
        target.metadata = targetMetadata;
        targets.push(target);

    }

    return targets;
}

function getClassPropsAsTargets(func: Function) {

    let classPropsMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED_PROP, func) || [];
    let targets: interfaces.Target[] = [];
    let keys = Object.keys(classPropsMetadata);

    for (let i = 0; i < keys.length; i++) {

        // the key of the property being injected
        let key = keys[i];

        // the metadata for the property being injected
        let targetMetadata = classPropsMetadata[key];

        // the metadata formatted for easier access
        let metadata = formatTargetMetadata(classPropsMetadata[key]);

        // the name of the property being injected
        let targetName = metadata.targetName || key;

        // Take types to be injected from user-generated metadata
        let serviceIndentifier = (metadata.inject || metadata.multiInject);

        // The property target
        let target = new Target(TargetTypeEnum.ClassProperty, targetName, serviceIndentifier);
        target.metadata = targetMetadata;
        targets.push(target);
    }

    // Check if base class has injected properties
    let baseConstructor = Object.getPrototypeOf(func.prototype).constructor;

    if (baseConstructor !== Object) {

        let baseTargets = getClassPropsAsTargets(baseConstructor);

        targets = [
            ...targets,
            ...baseTargets
        ];

    }

    return targets;
}

function getBaseClassDepencencyCount(func: Function): number {

    let baseConstructor = Object.getPrototypeOf(func.prototype).constructor;

    if (baseConstructor !== Object) {

        // get targets for base class
        let targets = getTargets(baseConstructor, true);

        // get unmanaged metadata
        let metadata: any[] = targets.map((t: interfaces.Target) => {
            return t.metadata.filter((m: interfaces.Metadata) => {
                return m.key === METADATA_KEY.UNMANAGED_TAG;
            });
        });

        // Compare the number of constructor arguments with the number of
        // unmanaged dependencies unmanaged dependencies are not required
        let unmanagedCount = [].concat.apply([], metadata).length;
        let dependencyCount = targets.length - unmanagedCount;

        if (dependencyCount > 0 ) {
            return dependencyCount;
        } else {
            return getBaseClassDepencencyCount(baseConstructor);
        }

    } else {
        return 0;
    }

}

function formatTargetMetadata(targetMetadata: any[]) {

    // Create map from array of metadata for faster access to metadata
    let targetMetadataMap: any = {};
    targetMetadata.forEach((m: interfaces.Metadata) => {
        targetMetadataMap[m.key.toString()] = m.value;
    });

    // user generated metadata
    return {
        inject : targetMetadataMap[METADATA_KEY.INJECT_TAG],
        multiInject: targetMetadataMap[METADATA_KEY.MULTI_INJECT_TAG],
        targetName: targetMetadataMap[METADATA_KEY.NAME_TAG],
        unmanaged: targetMetadataMap[METADATA_KEY.UNMANAGED_TAG]
    };

}

export { getDependencies };
