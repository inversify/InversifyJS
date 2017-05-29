import { interfaces } from "../interfaces/interfaces";
import { getFunctionName } from "../utils/serialization";
import { Target } from "./target";
import * as ERROR_MSGS from "../constants/error_msgs";
import * as METADATA_KEY from "../constants/metadata_keys";
import { TargetTypeEnum } from "../constants/literal_types";

function getDependencies(
    metadataReader: interfaces.MetadataReader, func: Function
): interfaces.Target[] {
    let constructorName = getFunctionName(func);
    let targets: interfaces.Target[] = getTargets(metadataReader, constructorName, func, false);
    return targets;
}

function getTargets(
    metadataReader: interfaces.MetadataReader, constructorName: string, func: Function, isBaseClass: boolean
): interfaces.Target[] {

    let metadata = metadataReader.getConstructorMetadata(func);

    // TypeScript compiler generated annotations
    let serviceIdentifiers = metadata.compilerGeneratedMetadata;

    // All types resolved must be annotated with @injectable
    if (serviceIdentifiers === undefined) {
        let msg = `${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} ${constructorName}.`;
        throw new Error(msg);
    }

    // User generated annotations
    let constructorArgsMetadata = metadata.userGeneratedMetadata;

    let keys = Object.keys(constructorArgsMetadata);
    let hasUserDeclaredUnknownInjections = (func.length === 0 && keys.length > 0);
    let iterations = (hasUserDeclaredUnknownInjections) ? keys.length : func.length;

    // Target instances that represent constructor arguments to be injected
    let constructorTargets = getConstructorArgsAsTargets(
        isBaseClass,
        constructorName,
        serviceIdentifiers,
        constructorArgsMetadata,
        iterations
    );

    // Target instances that represent properties to be injected
    let propertyTargets = getClassPropsAsTargets(metadataReader, func);

    let targets = [
        ...constructorTargets,
        ...propertyTargets
    ];

    // Throw if a derived class does not implement its constructor explicitly
    // We do this to prevent errors when a base class (parent) has dependencies
    // and one of the derived classes (children) has no dependencies
    let baseClassDepencencyCount = getBaseClassDepencencyCount(metadataReader, func);

    if (targets.length < baseClassDepencencyCount) {
        let error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_1 +
                    constructorName + ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_2;
        throw new Error(error);
    }

    return targets;

}
function getConstructorArgsAsTarget(
    index: number,
    isBaseClass: boolean,
    constructorName: string,
    serviceIdentifiers: any,
    constructorArgsMetadata: any
) {
    // Create map from array of metadata for faster access to metadata
    let targetMetadata = constructorArgsMetadata[index.toString()] || [];
    let metadata = formatTargetMetadata(targetMetadata);
    let isManaged = metadata.unmanaged !== true;

    // Take types to be injected from user-generated metadata
    // if not available use compiler-generated metadata
    let serviceIndentifier = serviceIdentifiers[index];
    let injectIndentifier  = (metadata.inject || metadata.multiInject);
    serviceIndentifier = (injectIndentifier) ? (injectIndentifier) : serviceIndentifier;

    // Types Object and Function are too ambiguous to be resolved
    // user needs to generate metadata manually for those
    if (isManaged === true) {

        let isObject = serviceIndentifier === Object;
        let isFunction = serviceIndentifier === Function;
        let isUndefined = serviceIndentifier === undefined;
        let isUnknownType = (isObject || isFunction || isUndefined);

        if (isBaseClass === false && isUnknownType) {
            let msg = `${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument ${index} in class ${constructorName}.`;
            throw new Error(msg);
        }

        let target = new Target(TargetTypeEnum.ConstructorArgument, metadata.targetName, serviceIndentifier);
        target.metadata = targetMetadata;
        return target;
    }

    return null;

}

function getConstructorArgsAsTargets(
    isBaseClass: boolean,
    constructorName: string,
    serviceIdentifiers: any,
    constructorArgsMetadata: any,
    iterations: number
) {

    let targets: interfaces.Target[] = [];
    for (let i = 0; i < iterations; i++) {
        let index = i;
        let target = getConstructorArgsAsTarget(
            index,
            isBaseClass,
            constructorName,
            serviceIdentifiers,
            constructorArgsMetadata
        );
        if (target !== null) {
            targets.push(target);
        }
    }

    return targets;
}

function getClassPropsAsTargets(metadataReader: interfaces.MetadataReader, constructorFunc: Function) {

    let classPropsMetadata = metadataReader.getPropertiesMetadata(constructorFunc);
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
    let baseConstructor = Object.getPrototypeOf(constructorFunc.prototype).constructor;

    if (baseConstructor !== Object) {

        let baseTargets = getClassPropsAsTargets(metadataReader, baseConstructor);

        targets = [
            ...targets,
            ...baseTargets
        ];

    }

    return targets;
}

function getBaseClassDepencencyCount(metadataReader: interfaces.MetadataReader, func: Function): number {

    let baseConstructor = Object.getPrototypeOf(func.prototype).constructor;

    if (baseConstructor !== Object) {

        // get targets for base class
        let baseConstructorName = getFunctionName(baseConstructor);

        let targets = getTargets(metadataReader, baseConstructorName, baseConstructor, true);

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
            return getBaseClassDepencencyCount(metadataReader, baseConstructor);
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
