import { expect } from 'chai';
import { describe, it } from 'mocha';

import { Container, interfaces } from '../../index';

type StorageConfig = 'all' | 'disk' | 'redis';

type Storage = 'disk-storage' | 'redis-storage';

/**
 * Creates a condition function for storage bindings based on a specific storage configuration.
 * This function is used with Inversify's `.when` method to dynamically control which bindings apply.
 *
 * @param config - The specific storage type to match. Cannot be 'all' since it acts as a wildcard.
 * @returns A function that checks whether the current storage configuration matches the provided type.
 */
function isStorageConfig(
  config: Exclude<StorageConfig, 'all'>,
): (request: interfaces.Request) => boolean {
  return ({ parentContext: { container } }: interfaces.Request) => {
    const storageConfig: StorageConfig =
      container.get<StorageConfig>('storage-config');
    return storageConfig === 'all' || storageConfig === config;
  };
}

describe('Issue 1670', () => {
  it('should get expected services with custom binding constraints (disk)', async () => {
    const config: StorageConfig = 'disk';
    const expectedStorageServices: Storage[] = ['disk-storage'];

    const container: Container = new Container({ defaultScope: 'Singleton' });

    container
      .bind<StorageConfig>('storage-config')
      .toDynamicValue(() => config);

    container
      .bind<Storage>('storage')
      .toDynamicValue(() => 'disk-storage')
      .when(isStorageConfig('disk'));

    container
      .bind<Storage>('storage')
      .toDynamicValue(() => 'redis-storage')
      .when(isStorageConfig('redis'));

    expect(
      container.getAll<Storage>('storage', { enforceBindingConstraints: true }),
    ).to.deep.eq(expectedStorageServices);
  });

  it('should get expected services with custom binding constraints (redis)', async () => {
    const config: StorageConfig = 'redis';
    const expectedStorageServices: Storage[] = ['redis-storage'];

    const container: Container = new Container({ defaultScope: 'Singleton' });

    container
      .bind<StorageConfig>('storage-config')
      .toDynamicValue(() => config);

    container
      .bind<Storage>('storage')
      .toDynamicValue(() => 'disk-storage')
      .when(isStorageConfig('disk'));

    container
      .bind<Storage>('storage')
      .toDynamicValue(() => 'redis-storage')
      .when(isStorageConfig('redis'));

    expect(
      container.getAll<Storage>('storage', { enforceBindingConstraints: true }),
    ).to.deep.eq(expectedStorageServices);
  });

  it('should get expected services with custom binding constraints (all)', async () => {
    const config: StorageConfig = 'all';
    const expectedStorageServices: Storage[] = [
      'disk-storage',
      'redis-storage',
    ];

    const container: Container = new Container({ defaultScope: 'Singleton' });

    container
      .bind<StorageConfig>('storage-config')
      .toDynamicValue(() => config);

    container
      .bind<Storage>('storage')
      .toDynamicValue(() => 'disk-storage')
      .when(isStorageConfig('disk'));

    container
      .bind<Storage>('storage')
      .toDynamicValue(() => 'redis-storage')
      .when(isStorageConfig('redis'));

    expect(
      container.getAll<Storage>('storage', { enforceBindingConstraints: true }),
    ).to.deep.eq(expectedStorageServices);
  });
});
