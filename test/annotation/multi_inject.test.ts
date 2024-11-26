// eslint-disable-next-line @typescript-eslint/naming-convention
declare function __decorate(
  decorators: ClassDecorator[],
  target: NewableFunction,
  key?: string | symbol,
  descriptor?: PropertyDescriptor | undefined,
): void;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare function __param(
  paramIndex: number,
  decorator: ParameterDecorator,
): ClassDecorator;

import { expect } from 'chai';

import { decorate } from '../../src/annotation/decorator_utils';
import { multiInject } from '../../src/annotation/multi_inject';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import type { interfaces } from '../../src/interfaces/interfaces';

type Weapon = object;

class DecoratedWarrior {
  private readonly _primaryWeapon: Weapon;
  private readonly _secondaryWeapon: Weapon;

  constructor(@multiInject('Weapon') weapons: [Weapon, Weapon]) {
    this._primaryWeapon = weapons[0];
    this._secondaryWeapon = weapons[1];
  }

  public mock() {
    return `${JSON.stringify(this._primaryWeapon)} ${JSON.stringify(this._secondaryWeapon)}`;
  }
}

class InvalidDecoratorUsageWarrior {
  private readonly _primaryWeapon: Weapon;
  private readonly _secondaryWeapon: Weapon;

  constructor(weapons: [Weapon, Weapon]) {
    this._primaryWeapon = weapons[0];
    this._secondaryWeapon = weapons[1];
  }

  public test(_a: string) {}

  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon,
    };
  }
}

describe('@multiInject', () => {
  it('Should generate metadata for named parameters', () => {
    const metadataKey: string = METADATA_KEY.TAGGED;
    const paramsMetadata: interfaces.MetadataMap = Reflect.getMetadata(
      metadataKey,
      DecoratedWarrior,
    ) as interfaces.MetadataMap;

    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);

    const zeroIndexedMetadata: interfaces.Metadata[] = paramsMetadata[
      '0'
    ] as interfaces.Metadata[];

    const zeroIndexedFirstMetadata: interfaces.Metadata =
      zeroIndexedMetadata[0] as interfaces.Metadata;

    expect(zeroIndexedFirstMetadata.key).to.be.eql(
      METADATA_KEY.MULTI_INJECT_TAG,
    );
    expect(zeroIndexedFirstMetadata.value).to.be.eql('Weapon');
    expect(zeroIndexedMetadata[1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['1']).to.eq(undefined);
  });

  it('Should throw when applied multiple times', () => {
    const useDecoratorMoreThanOnce: () => void = function () {
      __decorate(
        [__param(0, multiInject('Weapon')), __param(0, multiInject('Weapon'))],
        InvalidDecoratorUsageWarrior,
      );
    };

    const msg: string = `${ERROR_MSGS.DUPLICATED_METADATA} ${METADATA_KEY.MULTI_INJECT_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);
  });

  it('Should throw when not applied to a constructor', () => {
    const useDecoratorOnMethodThatIsNotConstructor: () => void = function () {
      __decorate(
        [__param(0, multiInject('Weapon'))],
        InvalidDecoratorUsageWarrior.prototype as unknown as NewableFunction,
        'test',
        Object.getOwnPropertyDescriptor(
          InvalidDecoratorUsageWarrior.prototype,
          'test',
        ),
      );
    };

    const msg: string = ERROR_MSGS.INVALID_DECORATOR_OPERATION;
    expect(useDecoratorOnMethodThatIsNotConstructor).to.throw(msg);
  });

  it('Should be usable in VanillaJS applications', () => {
    type Katana = unknown;
    type Shurien = unknown;

    const vanillaJsWarrior: (primary: unknown, secondary: unknown) => void =
      (function () {
        function warrior(_primary: Katana, _secondary: Shurien) {}
        return warrior;
      })();

    decorate(multiInject('Weapon'), vanillaJsWarrior, 0);

    const metadataKey: string = METADATA_KEY.TAGGED;
    const paramsMetadata: interfaces.MetadataMap = Reflect.getMetadata(
      metadataKey,
      vanillaJsWarrior,
    ) as interfaces.MetadataMap;

    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);

    const zeroIndexedMetadata: interfaces.Metadata[] = paramsMetadata[
      '0'
    ] as interfaces.Metadata[];

    const zeroIndexedFirstMetadata: interfaces.Metadata =
      zeroIndexedMetadata[0] as interfaces.Metadata;

    expect(zeroIndexedFirstMetadata.key).to.be.eql(
      METADATA_KEY.MULTI_INJECT_TAG,
    );
    expect(zeroIndexedFirstMetadata.value).to.be.eql('Weapon');
    expect(zeroIndexedMetadata[1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['1']).to.eq(undefined);
  });
});
