import { expect } from 'chai';

import * as METADATA_KEY from '../../src/constants/metadata_keys';
import type { interfaces } from '../../src/interfaces/interfaces';
import { Container, inject, injectable, MetadataReader } from '../../src/index';
import { Metadata } from '../../src/planning/metadata';

describe('Custom Metadata Reader', () => {
  interface FunctionWithMetadata extends NewableFunction {
    constructorInjections: interfaces.ServiceIdentifier[];
    propertyInjections: PropertyInjectionMetadata[];
  }

  interface PropertyInjectionMetadata {
    propName: string;
    injection: interfaces.ServiceIdentifier;
  }

  class StaticPropsMetadataReader implements interfaces.MetadataReader {
    public getConstructorMetadata(
      constructorFunc: FunctionWithMetadata,
    ): interfaces.ConstructorMetadata {
      const formatMetadata: (
        injections: interfaces.ServiceIdentifier[],
      ) => interfaces.MetadataMap = (
        injections: interfaces.ServiceIdentifier[],
      ) => {
        const userGeneratedMetadata: interfaces.MetadataMap = {};
        injections.forEach(
          (injection: interfaces.ServiceIdentifier, index: number) => {
            const metadata: Metadata = new Metadata(
              METADATA_KEY.INJECT_TAG,
              injection,
            );
            if (Array.isArray(userGeneratedMetadata[index])) {
              userGeneratedMetadata[index].push(metadata);
            } else {
              userGeneratedMetadata[index] = [metadata];
            }
          },
        );
        return userGeneratedMetadata;
      };

      const constructorInjections: interfaces.ServiceIdentifier[] =
        constructorFunc.constructorInjections;

      if (!Array.isArray(constructorInjections)) {
        throw new Error('Missing constructorInjections annotation!');
      }

      const userGeneratedConsturctorMetadata: interfaces.MetadataMap =
        formatMetadata(constructorInjections);

      return {
        // compilerGeneratedMetadata lenght must match userGeneratedMetadata
        // we expose compilerGeneratedMetadata because if your custom annotation
        // system is powered by decorators. The TypeScript compiler could generate
        // some metadata when the emitDecoratorMetadata flag is enabled.
        compilerGeneratedMetadata: new Array(constructorInjections.length),
        userGeneratedMetadata: userGeneratedConsturctorMetadata,
      };
    }

    public getPropertiesMetadata(
      constructorFunc: FunctionWithMetadata,
    ): interfaces.MetadataMap {
      const formatMetadata: (
        injections: PropertyInjectionMetadata[],
      ) => interfaces.MetadataMap = (
        injections: PropertyInjectionMetadata[],
      ) => {
        const userGeneratedMetadata: interfaces.MetadataMap = {};
        injections.forEach(
          (propInjection: PropertyInjectionMetadata, _index: number) => {
            const metadata: Metadata = new Metadata(
              METADATA_KEY.INJECT_TAG,
              propInjection.injection,
            );
            if (Array.isArray(userGeneratedMetadata[propInjection.propName])) {
              userGeneratedMetadata[propInjection.propName]?.push(metadata);
            } else {
              userGeneratedMetadata[propInjection.propName] = [metadata];
            }
          },
        );
        return userGeneratedMetadata;
      };

      const propertyInjections: PropertyInjectionMetadata[] =
        constructorFunc.propertyInjections;

      if (!Array.isArray(propertyInjections)) {
        throw new Error('Missing propertyInjections annotation!');
      }

      const userGeneratedPropertyMetadata: interfaces.MetadataMap =
        formatMetadata(propertyInjections);

      return userGeneratedPropertyMetadata;
    }
  }

  it('Should be able to use custom constructor injection metadata', () => {
    interface NinjaInterface {
      fight(): string;
      sneak(): string;
    }

    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    class Katana implements KatanaInterface {
      public static readonly constructorInjections: [] = [];
      public static readonly propertyInjections: [] = [];
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken implements ShurikenInterface {
      public static readonly constructorInjections: [] = [];
      public static readonly propertyInjections: [] = [];
      public throw() {
        return 'hit!';
      }
    }

    class Ninja implements NinjaInterface {
      public static readonly constructorInjections: [string, string] = [
        'Katana',
        'Shuriken',
      ];
      public static readonly propertyInjections: [] = [];

      private readonly _katana: KatanaInterface;
      private readonly _shuriken: ShurikenInterface;

      constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.applyCustomMetadataReader(new StaticPropsMetadataReader());

    container.bind<NinjaInterface>('Ninja').to(Ninja);
    container.bind<KatanaInterface>('Katana').to(Katana);
    container.bind<ShurikenInterface>('Shuriken').to(Shuriken);

    const ninja: NinjaInterface = container.get('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
  });

  it('Should be able to use custom prop injection metadata', () => {
    interface NinjaInterface {
      fight(): string;
      sneak(): string;
    }

    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    class Katana implements KatanaInterface {
      public static readonly constructorInjections: [] = [];
      public static readonly propertyInjections: [] = [];
      public static readonly brk: number = 1;
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken implements ShurikenInterface {
      public static readonly constructorInjections: [] = [];
      public static readonly propertyInjections: [] = [];
      public static readonly brk: number = 1;
      public throw() {
        return 'hit!';
      }
    }

    class Ninja implements NinjaInterface {
      public static readonly constructorInjections: [] = [];

      public static readonly propertyInjections: PropertyInjectionMetadata[] = [
        { injection: 'Katana', propName: '_katana' },
        { injection: 'Shuriken', propName: '_shuriken' },
      ];

      public static readonly brk: number = 1;

      private readonly _katana!: Katana;
      private readonly _shuriken!: Shuriken;
      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.applyCustomMetadataReader(new StaticPropsMetadataReader());
    container.bind<NinjaInterface>('Ninja').to(Ninja);
    container.bind<KatanaInterface>('Katana').to(Katana);
    container.bind<ShurikenInterface>('Shuriken').to(Shuriken);

    const ninja: NinjaInterface = container.get<NinjaInterface>('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');
  });

  it('Should be able to use extend the default metadata reader', () => {
    const constructorMetadataLog: interfaces.ConstructorMetadata[] = [];
    const propertyMetadataLog: interfaces.MetadataMap[] = [];

    class CustomMetadataReader extends MetadataReader {
      public override getConstructorMetadata(
        constructorFunc: NewableFunction,
      ): interfaces.ConstructorMetadata {
        const constructorMetadata: interfaces.ConstructorMetadata =
          super.getConstructorMetadata(constructorFunc);
        constructorMetadataLog.push(constructorMetadata);
        return constructorMetadata;
      }
      public override getPropertiesMetadata(
        constructorFunc: NewableFunction,
      ): interfaces.MetadataMap {
        const propertyMetadata: interfaces.MetadataMap =
          super.getPropertiesMetadata(constructorFunc);
        propertyMetadataLog.push(propertyMetadata);
        return propertyMetadata;
      }
    }

    interface AbstractNinja {
      fight(): string;
      sneak(): string;
    }

    interface AbstractKatana {
      hit(): string;
    }

    interface AbstractShuriken {
      throw(): string;
    }

    @injectable()
    class Katana implements AbstractKatana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Shuriken implements AbstractShuriken {
      public throw() {
        return 'hit!';
      }
    }

    @injectable()
    class Ninja implements AbstractNinja {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(
        @inject('Katana') katana: Katana,
        @inject('Shuriken') shuriken: Shuriken,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.applyCustomMetadataReader(new CustomMetadataReader());

    container.bind<Ninja>('Ninja').to(Ninja);
    container.bind<Katana>('Katana').to(Katana);
    container.bind<Shuriken>('Shuriken').to(Shuriken);

    const ninja: Ninja = container.get('Ninja');

    expect(ninja.fight()).eql('cut!');
    expect(ninja.sneak()).eql('hit!');

    expect(Array.isArray(constructorMetadataLog)).eq(true);

    expect(constructorMetadataLog.length).eq(3);

    const constructorMetadataLogFirstElement: interfaces.ConstructorMetadata =
      constructorMetadataLog[0] as interfaces.ConstructorMetadata;
    const constructorMetadataLogSecondElement: interfaces.ConstructorMetadata =
      constructorMetadataLog[1] as interfaces.ConstructorMetadata;
    const constructorMetadataLogThirdElement: interfaces.ConstructorMetadata =
      constructorMetadataLog[2] as interfaces.ConstructorMetadata;

    const compilerGeneratedMetadata0: NewableFunction[] | undefined =
      constructorMetadataLogFirstElement.compilerGeneratedMetadata;

    if (compilerGeneratedMetadata0) {
      expect(compilerGeneratedMetadata0[0]).eq(Katana);
      expect(compilerGeneratedMetadata0[1]).eq(Shuriken);
    }

    const userGeneratedMetadataFirstElement: interfaces.Metadata<unknown>[] =
      constructorMetadataLogFirstElement.userGeneratedMetadata[
        '0'
      ] as interfaces.Metadata[];

    const userGeneratedMetadataSecondElement: interfaces.Metadata<unknown>[] =
      constructorMetadataLogFirstElement.userGeneratedMetadata[
        '1'
      ] as interfaces.Metadata[];

    expect(
      (userGeneratedMetadataFirstElement[0] as interfaces.Metadata).key,
    ).eq('inject');
    expect(
      (userGeneratedMetadataFirstElement[0] as interfaces.Metadata).value,
    ).eq('Katana');
    expect(
      (userGeneratedMetadataSecondElement[0] as interfaces.Metadata).key,
    ).eq('inject');
    expect(
      (userGeneratedMetadataSecondElement[0] as interfaces.Metadata).value,
    ).eq('Shuriken');

    expect(
      JSON.stringify(
        constructorMetadataLogSecondElement.compilerGeneratedMetadata,
      ),
    ).eq(JSON.stringify([]));
    expect(
      JSON.stringify(
        constructorMetadataLogThirdElement.compilerGeneratedMetadata,
      ),
    ).eq(JSON.stringify([]));
    expect(
      JSON.stringify(constructorMetadataLogSecondElement.userGeneratedMetadata),
    ).eq(JSON.stringify({}));
    expect(
      JSON.stringify(constructorMetadataLogThirdElement.userGeneratedMetadata),
    ).eq(JSON.stringify({}));

    expect(propertyMetadataLog.length).eq(3);

    expect(propertyMetadataLog[0] as interfaces.MetadataMap).to.deep.equal({});
    expect(propertyMetadataLog[1] as interfaces.MetadataMap).to.deep.equal({});
    expect(propertyMetadataLog[2] as interfaces.MetadataMap).to.deep.equal({});
  });
});
