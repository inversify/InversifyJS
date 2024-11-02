import { LazyServiceIdentifier } from '@inversifyjs/common';

import * as ERROR_MSGS from '../constants/error_msgs';
import { TargetTypeEnum } from '../constants/literal_types';
import * as METADATA_KEY from '../constants/metadata_keys';
import { interfaces } from '../interfaces/interfaces';
import { getFunctionName } from '../utils/serialization';
import { Metadata } from './metadata';
import { Target } from './target';

function getDependencies(
  metadataReader: interfaces.MetadataReader,
  func: NewableFunction,
): interfaces.Target[] {
  const constructorName: string = getFunctionName(func);
  return getTargets(metadataReader, constructorName, func, false);
}

function getTargets(
  metadataReader: interfaces.MetadataReader,
  constructorName: string,
  func: NewableFunction,
  isBaseClass: boolean,
): interfaces.Target[] {
  const metadata: interfaces.ConstructorMetadata =
    metadataReader.getConstructorMetadata(func);

  // TypeScript compiler generated annotations
  const serviceIdentifiers: NewableFunction[] | undefined =
    metadata.compilerGeneratedMetadata;

  // All types resolved must be annotated with @injectable
  if (serviceIdentifiers === undefined) {
    const msg: string = `${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} ${constructorName}.`;
    throw new Error(msg);
  }

  // User generated annotations
  const constructorArgsMetadata: interfaces.MetadataMap =
    metadata.userGeneratedMetadata;

  const keys: string[] = Object.keys(constructorArgsMetadata);
  const hasUserDeclaredUnknownInjections: boolean =
    func.length === 0 && keys.length > 0;
  const hasOptionalParameters: boolean = keys.length > func.length;

  const iterations: number =
    hasUserDeclaredUnknownInjections || hasOptionalParameters
      ? keys.length
      : func.length;

  // Target instances that represent constructor arguments to be injected
  const constructorTargets: interfaces.Target[] = getConstructorArgsAsTargets(
    isBaseClass,
    constructorName,
    serviceIdentifiers,
    constructorArgsMetadata,
    iterations,
  );

  // Target instances that represent properties to be injected
  const propertyTargets: interfaces.Target[] = getClassPropsAsTargets(
    metadataReader,
    func,
    constructorName,
  );

  const targets: interfaces.Target[] = [
    ...constructorTargets,
    ...propertyTargets,
  ];

  return targets;
}
function getConstructorArgsAsTarget(
  index: number,
  isBaseClass: boolean,
  constructorName: string,
  serviceIdentifiers: interfaces.ServiceIdentifier[],
  constructorArgsMetadata: interfaces.MetadataMap,
): Target | null {
  // Create map from array of metadata for faster access to metadata
  const targetMetadata: interfaces.Metadata<unknown>[] =
    constructorArgsMetadata[index.toString()] || [];
  // eslint-disable-next-line @typescript-eslint/typedef
  const metadata = formatTargetMetadata(targetMetadata);
  const isManaged: boolean = metadata.unmanaged !== true;

  // Take types to be injected from user-generated metadata
  // if not available use compiler-generated metadata
  let serviceIdentifier: interfaces.ServiceIdentifier | undefined =
    serviceIdentifiers[index];
  const injectIdentifier: unknown = metadata.inject ?? metadata.multiInject;
  serviceIdentifier =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    (injectIdentifier ? injectIdentifier : serviceIdentifier) as
      | interfaces.ServiceIdentifier<unknown>
      | undefined;

  // we unwrap LazyServiceIdentifier wrappers to allow circular dependencies on symbols
  if (LazyServiceIdentifier.is(serviceIdentifier)) {
    serviceIdentifier = serviceIdentifier.unwrap();
  }

  // Types Object and Function are too ambiguous to be resolved
  // user needs to generate metadata manually for those
  if (isManaged) {
    const isObject: boolean = serviceIdentifier === Object;
    const isFunction: boolean = serviceIdentifier === Function;
    const isUndefined: boolean = serviceIdentifier === undefined;
    const isUnknownType: boolean = isObject || isFunction || isUndefined;

    if (!isBaseClass && isUnknownType) {
      const msg: string = `${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument ${index.toString()} in class ${constructorName}.`;
      throw new Error(msg);
    }

    const target: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      metadata.targetName as string | symbol,
      serviceIdentifier as interfaces.ServiceIdentifier,
    );
    target.metadata = targetMetadata;
    return target;
  }

  return null;
}

function getConstructorArgsAsTargets(
  isBaseClass: boolean,
  constructorName: string,
  serviceIdentifiers: interfaces.ServiceIdentifier[],
  constructorArgsMetadata: interfaces.MetadataMap,
  iterations: number,
): interfaces.Target[] {
  const targets: interfaces.Target[] = [];
  for (let i: number = 0; i < iterations; i++) {
    const target: Target | null = getConstructorArgsAsTarget(
      i,
      isBaseClass,
      constructorName,
      serviceIdentifiers,
      constructorArgsMetadata,
    );

    if (target !== null) {
      targets.push(target);
    }
  }

  return targets;
}

function _getServiceIdentifierForProperty(
  inject: interfaces.ServiceIdentifier | undefined,
  multiInject: interfaces.ServiceIdentifier | undefined,
  propertyName: string | symbol,
  className: string,
): interfaces.ServiceIdentifier {
  const serviceIdentifier: interfaces.ServiceIdentifier | undefined =
    inject ?? multiInject;

  if (serviceIdentifier === undefined) {
    const msg: string = `${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} for property ${String(propertyName)} in class ${className}.`;
    throw new Error(msg);
  }

  return serviceIdentifier;
}

function getClassPropsAsTargets(
  metadataReader: interfaces.MetadataReader,
  constructorFunc: NewableFunction,
  constructorName: string,
) {
  const classPropsMetadata: interfaces.MetadataMap =
    metadataReader.getPropertiesMetadata(constructorFunc);
  let targets: interfaces.Target[] = [];
  const symbolKeys: symbol[] = Object.getOwnPropertySymbols(classPropsMetadata);
  const stringKeys: (string | symbol)[] = Object.keys(classPropsMetadata);
  const keys: (string | symbol)[] = stringKeys.concat(symbolKeys);

  for (const key of keys) {
    // the metadata for the property being injected
    const targetMetadata: interfaces.Metadata[] = classPropsMetadata[
      key
    ] as interfaces.Metadata[];

    // the metadata formatted for easier access
    // eslint-disable-next-line @typescript-eslint/typedef
    const metadata = formatTargetMetadata(targetMetadata);

    const identifier: unknown = metadata.targetName ?? key;

    // Take types to be injected from user-generated metadata
    const serviceIdentifier: interfaces.ServiceIdentifier =
      _getServiceIdentifierForProperty(
        metadata.inject as interfaces.ServiceIdentifier | undefined,
        metadata.multiInject as interfaces.ServiceIdentifier | undefined,
        key,
        constructorName,
      );

    // The property target
    const target: Target = new Target(
      TargetTypeEnum.ClassProperty,
      identifier as string | symbol,
      serviceIdentifier,
    );

    target.metadata = targetMetadata;
    targets.push(target);
  }

  // Check if base class has injected properties
  const baseConstructor: NewableFunction = Object.getPrototypeOf(
    constructorFunc.prototype,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  ).constructor as NewableFunction;

  if (baseConstructor !== (Object as unknown as NewableFunction)) {
    const baseTargets: interfaces.Target[] = getClassPropsAsTargets(
      metadataReader,
      baseConstructor,
      constructorName,
    );

    targets = [...targets, ...baseTargets];
  }

  return targets;
}

function getBaseClassDependencyCount(
  metadataReader: interfaces.MetadataReader,
  func: NewableFunction,
): number {
  const baseConstructor: NewableFunction =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Object.getPrototypeOf(func.prototype).constructor as NewableFunction;
  if (baseConstructor !== (Object as unknown as NewableFunction)) {
    // get targets for base class
    const baseConstructorName: string = getFunctionName(baseConstructor);

    const targets: interfaces.Target[] = getTargets(
      metadataReader,
      baseConstructorName,
      baseConstructor,
      true,
    );

    // get unmanaged metadata
    const metadata: interfaces.Metadata[][] = targets.map(
      (t: interfaces.Target) =>
        t.metadata.filter(
          (m: interfaces.Metadata) => m.key === METADATA_KEY.UNMANAGED_TAG,
        ),
    );

    // Compare the number of constructor arguments with the number of
    // unmanaged dependencies unmanaged dependencies are not required
    const unmanagedCount: number = ([] as Metadata[]).concat.apply(
      [],
      metadata,
    ).length;
    const dependencyCount: number = targets.length - unmanagedCount;

    if (dependencyCount > 0) {
      return dependencyCount;
    } else {
      return getBaseClassDependencyCount(metadataReader, baseConstructor);
    }
  } else {
    return 0;
  }
}

function formatTargetMetadata(targetMetadata: interfaces.Metadata[]) {
  // Create map from array of metadata for faster access to metadata
  const targetMetadataMap: Record<string, unknown> = {};
  targetMetadata.forEach((m: interfaces.Metadata) => {
    targetMetadataMap[m.key.toString()] = m.value;
  });

  // user generated metadata
  return {
    inject: targetMetadataMap[METADATA_KEY.INJECT_TAG],
    multiInject: targetMetadataMap[METADATA_KEY.MULTI_INJECT_TAG],
    targetName: targetMetadataMap[METADATA_KEY.NAME_TAG],
    unmanaged: targetMetadataMap[METADATA_KEY.UNMANAGED_TAG],
  };
}

export { getDependencies, getBaseClassDependencyCount, getFunctionName };
