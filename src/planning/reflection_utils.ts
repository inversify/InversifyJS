import { Newable } from '@inversifyjs/common';
import { getTargets } from '@inversifyjs/core';

import * as METADATA_KEY from '../constants/metadata_keys';
import { interfaces } from '../interfaces/interfaces';
import { getBaseType } from '../utils/get_base_type';
import { getFunctionName } from '../utils/serialization';
import { Metadata } from './metadata';

function getDependencies(
  metadataReader: interfaces.MetadataReader,
  func: NewableFunction,
): interfaces.Target[] {
  return getTargets(metadataReader)(func as Newable);
}

function getBaseClassDependencyCount(
  metadataReader: interfaces.MetadataReader,
  func: NewableFunction,
): number {
  const baseConstructor: Newable | undefined = getBaseType(func);

  if (baseConstructor === undefined || baseConstructor === Object) {
    return 0;
  }

  // get targets for base class
  const targets: interfaces.Target[] =
    getTargets(metadataReader)(baseConstructor);

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
}

export { getDependencies, getBaseClassDependencyCount, getFunctionName };
