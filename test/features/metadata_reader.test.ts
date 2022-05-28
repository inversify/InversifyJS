import { expect } from "chai";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import { interfaces } from "../../src/interfaces/interfaces";
import { Container, inject, injectable, MetadataReader } from "../../src/inversify";
import { Metadata } from "../../src/planning/metadata";

describe("Custom Metadata Reader", () => {

  interface FunctionWithMetadata extends NewableFunction {
    constructorInjections: interfaces.ServiceIdentifier[];
    propertyInjections: PropertyInjectionMetadata[];
  }

  interface PropertyInjectionMetadata {
    propName: string;
    injection: interfaces.ServiceIdentifier;
  }

  class StaticPropsMetadataReader implements interfaces.MetadataReader {

    public getConstructorMetadata(constructorFunc: FunctionWithMetadata): interfaces.ConstructorMetadata {

      const formatMetadata = (injections: interfaces.ServiceIdentifier[]) => {
        const userGeneratedMetadata: interfaces.MetadataMap = {};
        injections.forEach((injection, index) => {
          const metadata = new Metadata(METADATA_KEY.INJECT_TAG, injection);
          if (Array.isArray(userGeneratedMetadata[index])) {
            userGeneratedMetadata[index]?.push(metadata);
          } else {
            userGeneratedMetadata[index] = [metadata];
          }
        });
        return userGeneratedMetadata;
      };

      const constructorInjections = constructorFunc.constructorInjections;

      if (!Array.isArray(constructorInjections)) {
        throw new Error("Missing constructorInjections annotation!");
      }

      const userGeneratedConsturctorMetadata = formatMetadata(constructorInjections);

      return {
        // compilerGeneratedMetadata lenght must match userGeneratedMetadata
        // we expose compilerGeneratedMetadata because if your custom annotation
        // system is powered by decorators. The TypeScript compiler could generate
        // some metadata when the emitDecoratorMetadata flag is enabled.
        compilerGeneratedMetadata: new Array(constructorInjections.length),
        userGeneratedMetadata: userGeneratedConsturctorMetadata
      };

    }

    public getPropertiesMetadata(constructorFunc: FunctionWithMetadata): interfaces.MetadataMap {

      const formatMetadata = (injections: PropertyInjectionMetadata[]) => {
        const userGeneratedMetadata: interfaces.MetadataMap = {};
        injections.forEach((propInjection, index) => {
          const metadata = new Metadata(METADATA_KEY.INJECT_TAG, propInjection.injection);
          if (Array.isArray(userGeneratedMetadata[propInjection.propName])) {
            userGeneratedMetadata[propInjection.propName]?.push(metadata);
          } else {
            userGeneratedMetadata[propInjection.propName] = [metadata];
          }
        });
        return userGeneratedMetadata;
      };

      const propertyInjections = constructorFunc.propertyInjections;

      if (!Array.isArray(propertyInjections)) {
        throw new Error("Missing propertyInjections annotation!");
      }

      const userGeneratedPropertyMetadata = formatMetadata(propertyInjections);
      return userGeneratedPropertyMetadata;

    }

  }

  it("Should be able to use custom constructor injection metadata", () => {

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    class Katana implements Katana {
      public static readonly constructorInjections = [];
      public static readonly propertyInjections = [];
      public hit() {
        return "cut!";
      }
    }

    class Shuriken implements Shuriken {
      public static readonly constructorInjections = [];
      public static readonly propertyInjections = [];
      public throw() {
        return "hit!";
      }
    }

    class Ninja implements Ninja {

      public static readonly constructorInjections = ["Katana", "Shuriken"];
      public static readonly propertyInjections = [];

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(
        katana: Katana,
        shuriken: Shuriken
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.applyCustomMetadataReader(new StaticPropsMetadataReader());

    container.bind<Ninja>("Ninja").to(Ninja);
    container.bind<Katana>("Katana").to(Katana);
    container.bind<Shuriken>("Shuriken").to(Shuriken);

    const ninja = container.get<Ninja>("Ninja");

    expect(ninja.fight()).eql("cut!");
    expect(ninja.sneak()).eql("hit!");

  });

  it("Should be able to use custom prop injection metadata", () => {

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    class Katana implements Katana {
      public static readonly constructorInjections = [];
      public static readonly propertyInjections = [];
      public static readonly __brk = 1; // TEMP
      public hit() {
        return "cut!";
      }
    }

    class Shuriken implements Shuriken {
      public static readonly constructorInjections = [];
      public static readonly propertyInjections = [];
      public static readonly __brk = 1; // TEMP
      public throw() {
        return "hit!";
      }
    }

    class Ninja implements Ninja {

      public static readonly constructorInjections = [];

      public static readonly propertyInjections = [
        { propName: "_katana", injection: "Katana" },
        { propName: "_shuriken", injection: "Shuriken" }
      ];

      public static readonly __brk = 1; // TEMP

      private _katana!: Katana;
      private _shuriken!: Shuriken;
      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.applyCustomMetadataReader(new StaticPropsMetadataReader());
    container.bind<Ninja>("Ninja").to(Ninja);
    container.bind<Katana>("Katana").to(Katana);
    container.bind<Shuriken>("Shuriken").to(Shuriken);

    const ninja = container.get<Ninja>("Ninja");

    expect(ninja.fight()).eql("cut!");
    expect(ninja.sneak()).eql("hit!");

  });

  it("Should be able to use extend the default metadata reader", () => {

    const constructorMetadataLog: interfaces.ConstructorMetadata[] = [];
    const propertyMetadataLog: interfaces.MetadataMap[] = [];

    class CustomMetadataReader extends MetadataReader {
      public override getConstructorMetadata(constructorFunc: NewableFunction): interfaces.ConstructorMetadata {
        const constructorMetadata = super.getConstructorMetadata(constructorFunc);
        constructorMetadataLog.push(constructorMetadata);
        return constructorMetadata;
      }
      public override getPropertiesMetadata(constructorFunc: NewableFunction): interfaces.MetadataMap {
        const propertyMetadata = super.getPropertiesMetadata(constructorFunc);
        propertyMetadataLog.push(propertyMetadata);
        return propertyMetadata;
      }
    }

    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Katana {
      hit(): string;
    }

    interface Shuriken {
      throw(): string;
    }

    @injectable()
    class Katana implements Katana {
      public hit() {
        return "cut!";
      }
    }

    @injectable()
    class Shuriken implements Shuriken {
      public throw() {
        return "hit!";
      }
    }

    @injectable()
    class Ninja implements Ninja {

      private _katana: Katana;
      private _shuriken: Shuriken;

      public constructor(
        @inject("Katana") katana: Katana,
        @inject("Shuriken") shuriken: Shuriken
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() { return this._katana.hit(); }
      public sneak() { return this._shuriken.throw(); }

    }

    const container = new Container();
    container.applyCustomMetadataReader(new CustomMetadataReader());

    container.bind<Ninja>("Ninja").to(Ninja);
    container.bind<Katana>("Katana").to(Katana);
    container.bind<Shuriken>("Shuriken").to(Shuriken);

    const ninja = container.get<Ninja>("Ninja");

    expect(ninja.fight()).eql("cut!");
    expect(ninja.sneak()).eql("hit!");

    expect(Array.isArray(constructorMetadataLog)).eq(true);
    expect(constructorMetadataLog.length).eq(3);

    const constructorMetadataLogFirstElement = constructorMetadataLog[0] as interfaces.ConstructorMetadata;
    const constructorMetadataLogSecondElement = constructorMetadataLog[1] as interfaces.ConstructorMetadata;
    const constructorMetadataLogThirdElement = constructorMetadataLog[2] as interfaces.ConstructorMetadata;

    const compilerGeneratedMetadata0 = constructorMetadataLogFirstElement.compilerGeneratedMetadata;

    if (compilerGeneratedMetadata0) {
      expect(compilerGeneratedMetadata0[0]).eq(Katana);
      expect(compilerGeneratedMetadata0[1]).eq(Shuriken);
    }

    const userGeneratedMetadataFirstElement =
      constructorMetadataLogFirstElement.userGeneratedMetadata["0"] as interfaces.Metadata[];

    const userGeneratedMetadataSecondElement =
      constructorMetadataLogFirstElement.userGeneratedMetadata["1"] as interfaces.Metadata[];

    expect((userGeneratedMetadataFirstElement[0] as interfaces.Metadata).key).eq("inject");
    expect((userGeneratedMetadataFirstElement[0] as interfaces.Metadata).value).eq("Katana");
    expect((userGeneratedMetadataSecondElement[0] as interfaces.Metadata).key).eq("inject");
    expect((userGeneratedMetadataSecondElement[0] as interfaces.Metadata).value).eq("Shuriken");

    expect(JSON.stringify(constructorMetadataLogSecondElement.compilerGeneratedMetadata)).eq(JSON.stringify([]));
    expect(JSON.stringify(constructorMetadataLogThirdElement.compilerGeneratedMetadata)).eq(JSON.stringify([]));
    expect(JSON.stringify(constructorMetadataLogSecondElement.userGeneratedMetadata)).eq(JSON.stringify({}));
    expect(JSON.stringify(constructorMetadataLogThirdElement.userGeneratedMetadata)).eq(JSON.stringify({}));

    expect(propertyMetadataLog.length).eq(3);

    const getLength = (metadata: interfaces.MetadataMap) => {
      return (metadata as unknown as { length: number }).length
    }

    expect(getLength(propertyMetadataLog[0] as interfaces.MetadataMap)).eq(0);
    expect(getLength(propertyMetadataLog[1] as interfaces.MetadataMap)).eq(0);
    expect(getLength(propertyMetadataLog[2] as interfaces.MetadataMap)).eq(0);

  });

});