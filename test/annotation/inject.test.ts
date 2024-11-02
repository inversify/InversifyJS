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

import { LazyServiceIdentifier } from '@inversifyjs/common';
import { expect } from 'chai';

import { decorate } from '../../src/annotation/decorator_utils';
import { inject } from '../../src/annotation/inject';
import { multiInject } from '../../src/annotation/multi_inject';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import { interfaces } from '../../src/interfaces/interfaces';

class Katana {}
class Shuriken {}
class Sword {}

const lazySwordId: LazyServiceIdentifier = new LazyServiceIdentifier(
  () => 'Sword',
);

class DecoratedWarrior {
  private readonly _primaryWeapon: Katana;
  private readonly _secondaryWeapon: Shuriken;
  private readonly _tertiaryWeapon: Sword;

  constructor(
    @inject('Katana') primary: Katana,
    @inject('Shuriken') secondary: Shuriken,
    @inject(lazySwordId) tertiary: Shuriken,
  ) {
    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
    this._tertiaryWeapon = tertiary;
  }

  public debug() {
    return {
      primaryWeapon: this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon,
      tertiaryWeapon: this._tertiaryWeapon,
    };
  }
}

class InvalidDecoratorUsageWarrior {
  private readonly _primaryWeapon: Katana;
  private readonly _secondaryWeapon: Shuriken;

  constructor(primary: Katana, secondary: Shuriken) {
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

describe('@inject', () => {
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
    expect(zeroIndexedFirstMetadata.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(zeroIndexedFirstMetadata.value).to.be.eql('Katana');
    expect(zeroIndexedMetadata[1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);

    const oneIndexedMetadata: interfaces.Metadata[] = paramsMetadata[
      '1'
    ] as interfaces.Metadata[];

    const oneIndexedFirstMetadata: interfaces.Metadata =
      oneIndexedMetadata[0] as interfaces.Metadata;

    expect(oneIndexedFirstMetadata.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(oneIndexedFirstMetadata.value).to.be.eql('Shuriken');
    expect(oneIndexedMetadata[1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['2']).to.be.instanceof(Array);

    const twoIndexedMetadata: interfaces.Metadata[] = paramsMetadata[
      '2'
    ] as interfaces.Metadata[];

    const twoIndexedFirstMetadata: interfaces.Metadata =
      twoIndexedMetadata[0] as interfaces.Metadata;
    expect(twoIndexedFirstMetadata.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(twoIndexedFirstMetadata.value).to.be.eql(lazySwordId);
    expect(twoIndexedMetadata[1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['3']).to.eq(undefined);
  });

  it('Should throw when applied multiple times', () => {
    const useDecoratorMoreThanOnce: () => void = function () {
      __decorate(
        [__param(0, inject('Katana')), __param(0, inject('Shurien'))],
        InvalidDecoratorUsageWarrior,
      );
    };

    const msg: string = `${ERROR_MSGS.DUPLICATED_METADATA} ${METADATA_KEY.INJECT_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);
  });

  it('Should throw when not applied to a constructor', () => {
    const useDecoratorOnMethodThatIsNotConstructor: () => void = function () {
      __decorate(
        [__param(0, inject('Katana'))],
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

  it('Should throw when applied with undefined', () => {
    // this can happen when there is circular dependency between symbols
    const useDecoratorWithUndefined: () => void = function () {
      __decorate(
        [__param(0, inject(undefined as unknown as symbol))],
        InvalidDecoratorUsageWarrior,
      );
    };

    const msg: string = ERROR_MSGS.UNDEFINED_INJECT_ANNOTATION(
      'InvalidDecoratorUsageWarrior',
    );
    expect(useDecoratorWithUndefined).to.throw(msg);
  });

  it('Should be usable in VanillaJS applications', () => {
    type Shuriken = unknown;

    const vanillaJsWarrior: (primary: Katana, secondary: unknown) => void =
      (function () {
        function warrior(_primary: Katana, _secondary: Shuriken) {}
        return warrior;
      })();

    decorate(inject('Katana'), vanillaJsWarrior, 0);
    decorate(inject('Shurien'), vanillaJsWarrior, 1);

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

    expect(zeroIndexedFirstMetadata.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(zeroIndexedFirstMetadata.value).to.be.eql('Katana');
    expect(zeroIndexedMetadata[1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);

    const oneIndexedMetadata: interfaces.Metadata[] = paramsMetadata[
      '1'
    ] as interfaces.Metadata[];

    const oneIndexedFirstMetadata: interfaces.Metadata =
      oneIndexedMetadata[0] as interfaces.Metadata;

    expect(oneIndexedFirstMetadata.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(oneIndexedFirstMetadata.value).to.be.eql('Shurien');
    expect(oneIndexedMetadata[1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['2']).to.eq(undefined);
  });

  it('should throw when applied inject decorator with undefined service identifier to a property', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class WithUndefinedInject {
        @inject(undefined as unknown as symbol)
        public property!: string;
      }
    }).to.throw(ERROR_MSGS.UNDEFINED_INJECT_ANNOTATION('WithUndefinedInject'));
  });

  it('should throw when applied multiInject decorator with undefined service identifier to a constructor parameter', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class WithUndefinedInject {
        constructor(
          @multiInject(undefined as unknown as symbol)
          public readonly dependency: string[],
        ) {}
      }
    }).to.throw(ERROR_MSGS.UNDEFINED_INJECT_ANNOTATION('WithUndefinedInject'));
  });

  it('Should unwrap LazyServiceIdentifier', () => {
    const unwrapped: interfaces.ServiceIdentifier = lazySwordId.unwrap();

    expect(unwrapped).to.be.equal('Sword');
  });
});
