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
import { named } from '../../src/annotation/named';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import { interfaces } from '../../src/interfaces/interfaces';

type Weapon = unknown;

class NamedWarrior {
  private readonly _primaryWeapon: Weapon;
  private readonly _secondaryWeapon: Weapon;

  constructor(
    @named('more_powerful') primary: Weapon,
    @named('less_powerful') secondary: Weapon,
  ) {
    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
  }

  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon,
    };
  }
}

class InvalidDecoratorUsageWarrior {
  private readonly _primaryWeapon: Weapon;
  private readonly _secondaryWeapon: Weapon;

  constructor(primary: Weapon, secondary: Weapon) {
    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
  }

  public test(_a: string) {}

  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon,
    };
  }
}

describe('@named', () => {
  it('Should generate metadata for named parameters', () => {
    const metadataKey: string = METADATA_KEY.TAGGED;
    const paramsMetadata: interfaces.MetadataMap = Reflect.getMetadata(
      metadataKey,
      NamedWarrior,
    ) as interfaces.MetadataMap;

    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);

    const zeroIndexedMetadata: interfaces.Metadata[] = paramsMetadata[
      '0'
    ] as interfaces.Metadata[];

    const zeroIndexedFirstMetadata: interfaces.Metadata =
      zeroIndexedMetadata[0] as interfaces.Metadata;

    expect(zeroIndexedFirstMetadata.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(zeroIndexedFirstMetadata.value).to.be.eql('more_powerful');
    expect(zeroIndexedMetadata[1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);

    const oneIndexedMetadata: interfaces.Metadata[] = paramsMetadata[
      '1'
    ] as interfaces.Metadata[];

    const oneIndexedFirstMetadata: interfaces.Metadata =
      oneIndexedMetadata[0] as interfaces.Metadata;

    expect(oneIndexedFirstMetadata.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(oneIndexedFirstMetadata.value).to.be.eql('less_powerful');
    expect(oneIndexedMetadata[1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['2']).to.eq(undefined);
  });

  it('Should generate metadata for named properties', () => {
    class Warrior {
      @named('throwable')
      public weapon!: Weapon;
    }

    const metadataKey: string = METADATA_KEY.TAGGED_PROP;
    const metadata: interfaces.MetadataMap = Reflect.getMetadata(
      metadataKey,
      Warrior,
    ) as interfaces.MetadataMap;

    const weaponMetadata: interfaces.Metadata[] = metadata[
      'weapon'
    ] as interfaces.Metadata[];

    const weaponFirstMetadata: interfaces.Metadata =
      weaponMetadata[0] as interfaces.Metadata;
    expect(weaponFirstMetadata.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(weaponFirstMetadata.value).to.be.eql('throwable');
    expect(weaponMetadata[1]).to.eq(undefined);
  });

  it('Should throw when applied multiple times', () => {
    const useDecoratorMoreThanOnce: () => void = function () {
      __decorate(
        [__param(0, named('a')), __param(0, named('b'))],
        InvalidDecoratorUsageWarrior,
      );
    };

    const msg: string = `${ERROR_MSGS.DUPLICATED_METADATA} ${METADATA_KEY.NAMED_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);
  });

  it('Should throw when not applied to a constructor', () => {
    const useDecoratorOnMethodThatIsNotConstructor: () => void = function () {
      __decorate(
        [__param(0, named('a'))],
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
    type Shuriken = unknown;

    const vanillaJsWarrior: (primary: unknown, secondary: unknown) => void =
      (function () {
        function namedVanillaJsWarrior(_primary: Katana, _secondary: Shuriken) {
          // ...
        }
        return namedVanillaJsWarrior;
      })();

    decorate(named('more_powerful'), vanillaJsWarrior, 0);
    decorate(named('less_powerful'), vanillaJsWarrior, 1);

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

    expect(zeroIndexedFirstMetadata.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(zeroIndexedFirstMetadata.value).to.be.eql('more_powerful');
    expect(zeroIndexedMetadata[1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);

    const oneIndexedMetadata: interfaces.Metadata[] = paramsMetadata[
      '1'
    ] as interfaces.Metadata[];

    const oneIndexedFirstMetadata: interfaces.Metadata =
      oneIndexedMetadata[0] as interfaces.Metadata;

    expect(oneIndexedFirstMetadata.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(oneIndexedFirstMetadata.value).to.be.eql('less_powerful');
    expect(oneIndexedMetadata[1]).eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['2']).to.eq(undefined);
  });
});
