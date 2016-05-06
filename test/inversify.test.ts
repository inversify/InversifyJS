///<reference path="../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import * as ERROR_MSGS from "../src/constants/error_msgs";
import * as Proxy from "harmony-proxy";
import {
    Kernel, injectable, inject, multiInject,
    tagged, named, targetName, decorate, typeConstraint,
    makePropertyInjectDecorator, makePropertyMultiInjectDecorator
} from "../src/inversify";

describe("InversifyJS", () => {

  it("Should be able to resolve and inject dependencies", () => {

      interface INinja {
          fight(): string;
          sneak(): string;
      }

      interface IKatana {
          hit(): string;
      }

      interface IShuriken {
          throw(): string;
      }

      @injectable()
      class Katana implements IKatana {
          public hit() {
              return "cut!";
          }
      }

      @injectable()
      class Shuriken implements IShuriken {
          public throw() {
              return "hit!";
          }
      }

      @injectable()
      class Ninja implements INinja {

          private _katana: IKatana;
          private _shuriken: IShuriken;

          public constructor(
              @inject("IKatana") katana: IKatana,
              @inject("IShuriken") shuriken: IShuriken
          ) {
              this._katana = katana;
              this._shuriken = shuriken;
          }

          public fight() { return this._katana.hit(); };
          public sneak() { return this._shuriken.throw(); };

      }

      let kernel = new Kernel();
      kernel.bind<INinja>("INinja").to(Ninja);
      kernel.bind<IKatana>("IKatana").to(Katana);
      kernel.bind<IShuriken>("IShuriken").to(Shuriken);

      let ninja = kernel.get<INinja>("INinja");

      expect(ninja.fight()).eql("cut!");
      expect(ninja.sneak()).eql("hit!");

  });

  it("Should be able to resolve and inject dependencies in VanillaJS", () => {

      let TYPES = {
          Katana: "Katana",
          Ninja: "Ninja",
          Shuriken: "Shuriken"
      };

      class Katana {
          public hit() {
              return "cut!";
          }
      }

      class Shuriken {
          public throw() {
              return "hit!";
          }
      }

      class Ninja {

          public _katana: Katana;
          public _shuriken: Shuriken;

          public constructor(katana: Katana, shuriken: Shuriken) {
              this._katana = katana;
              this._shuriken = shuriken;
          }
          public fight() { return this._katana.hit(); };
          public sneak() { return this._shuriken.throw(); };
      }

      decorate(injectable(), Katana);
      decorate(injectable(), Shuriken);
      decorate(injectable(), Ninja);
      decorate(inject(TYPES.Katana), Ninja, 0);
      decorate(inject(TYPES.Shuriken), Ninja, 1);

      let kernel = new Kernel();
      kernel.bind<Ninja>(TYPES.Ninja).to(Ninja);
      kernel.bind<Katana>(TYPES.Katana).to(Katana);
      kernel.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);

      let ninja = kernel.get<Ninja>(TYPES.Ninja);

      expect(ninja.fight()).eql("cut!");
      expect(ninja.sneak()).eql("hit!");

  });

  it("Should be able to use classes as runtime identifiers", () => {

      @injectable()
      class Katana {
          public hit() {
              return "cut!";
          }
      }

      @injectable()
      class Shuriken  {
          public throw() {
              return "hit!";
          }
      }

      @injectable()
      class Ninja  {

          private _katana: Katana;
          private _shuriken: Shuriken;

          public constructor(katana: Katana, shuriken: Shuriken) {
              this._katana = katana;
              this._shuriken = shuriken;
          }

          public fight() { return this._katana.hit(); };
          public sneak() { return this._shuriken.throw(); };

      }

      let kernel = new Kernel();
      kernel.bind<Ninja>(Ninja).to(Ninja);
      kernel.bind<Katana>(Katana).to(Katana);
      kernel.bind<Shuriken>(Shuriken).to(Shuriken);

      let ninja = kernel.get<Ninja>(Ninja);

      expect(ninja.fight()).eql("cut!");
      expect(ninja.sneak()).eql("hit!");

  });

  it("Should be able to use Symbols as runtime identifiers", () => {

      interface INinja {
          fight(): string;
          sneak(): string;
      }

      interface IKatana {
          hit(): string;
      }

      interface IShuriken {
          throw(): string;
      }

      @injectable()
      class Katana implements IKatana {
          public hit() {
              return "cut!";
          }
      }

      @injectable()
      class Shuriken implements IShuriken {
          public throw() {
              return "hit!";
          }
      }

      let TYPES = {
          Katana: Symbol("IKatana"),
          Ninja: Symbol("INinja"),
          Shuriken: Symbol("IShuriken")
      };

      @injectable()
      class Ninja implements INinja {

          private _katana: Katana;
          private _shuriken: Shuriken;

          public constructor(
              @inject(TYPES.Katana) katana: Katana,
              @inject(TYPES.Shuriken) shuriken: Shuriken
          ) {
              this._katana = katana;
              this._shuriken = shuriken;
          }

          public fight() { return this._katana.hit(); };
          public sneak() { return this._shuriken.throw(); };

      }

      let kernel = new Kernel();
      kernel.bind<INinja>(TYPES.Ninja).to(Ninja);
      kernel.bind<IKatana>(TYPES.Katana).to(Katana);
      kernel.bind<IShuriken>(TYPES.Shuriken).to(Shuriken);

      let ninja = kernel.get<Ninja>(TYPES.Ninja);

      expect(ninja.fight()).eql("cut!");
      expect(ninja.sneak()).eql("hit!");

  });

    it("Should support middleware", () => {

        interface INinja {}

        @injectable()
        class Ninja implements INinja {}

        let log: string[] = [];

        function middleware1(next: (context: IContext) => any) {
            return (context: IContext) => {
                let serviceIdentifier = context.kernel.getServiceIdentifierAsString(context.plan.rootRequest.serviceIdentifier);
                log.push(`Middleware1: ${serviceIdentifier}`);
                return next(context);
            };
        };

        function middleware2(next: (context: IContext) => any) {
            return (context: IContext) => {
                let serviceIdentifier = context.kernel.getServiceIdentifierAsString(context.plan.rootRequest.serviceIdentifier);
                log.push(`Middleware2: ${serviceIdentifier}`);
                return next(context);
            };
        };

        let kernel = new Kernel();
        kernel.applyMiddleware(middleware1, middleware2);
        kernel.bind<INinja>("INinja").to(Ninja);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware1: INinja`);
        expect(log[1]).eql(`Middleware2: INinja`);

    });

    it("Should support Kernel modules", () => {

        interface INinja {
            fight(): string;
            sneak(): string;
        }

        interface IKatana {
            hit(): string;
        }

        interface IShuriken {
            throw(): string;
        }

        @injectable()
        class Katana implements IKatana {
            public hit() {
                return "cut!";
            }
        }

        @injectable()
        class Shuriken implements IShuriken {
            public throw() {
                return "hit!";
            }
        }

        @injectable()
        class Ninja implements INinja {

            private _katana: IKatana;
            private _shuriken: IShuriken;

            public constructor(@inject("IKatana") katana: IKatana, @inject("IShuriken") shuriken: IShuriken) {
                this._katana = katana;
                this._shuriken = shuriken;
            }

            public fight() { return this._katana.hit(); };
            public sneak() { return this._shuriken.throw(); };

        }

        let warriors: IKernelModule = (kernel: IKernel) => {
            kernel.bind<INinja>("INinja").to(Ninja);
        };

        let weapons: IKernelModule = (kernel: IKernel) => {
            kernel.bind<IKatana>("IKatana").to(Katana);
            kernel.bind<IShuriken>("IShuriken").to(Shuriken);
        };

        let kernel = new Kernel();
        kernel.load(warriors, weapons);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

    });

    it("Should support control over the scope of the dependencies", () => {

        interface INinja {
            fight(): string;
            sneak(): string;
        }

        interface IKatana {
            hit(): string;
        }

        interface IShuriken {
            throw(): string;
        }

        @injectable()
        class Katana implements IKatana {
            private _usageCount: number;
            public constructor() {
                this._usageCount = 0;
            }
            public hit() {
                this._usageCount = this._usageCount + 1;
                return `This katana was used ${this._usageCount} times!`;
            }
        }

        @injectable()
        class Shuriken implements IShuriken {
            private _shurikenCount: number;
            public constructor() {
                this._shurikenCount = 10;
            }
            public throw() {
                this._shurikenCount = this._shurikenCount - 1;
                return `Only ${this._shurikenCount} items left!`;
            }
        }

        @injectable()
        class Ninja implements INinja {

            private _katana: IKatana;
            private _shuriken: IShuriken;

            public constructor(
                @inject("IKatana") katana: IKatana,
                @inject("IShuriken") shuriken: IShuriken
           ) {
                this._katana = katana;
                this._shuriken = shuriken;
            }

            public fight() { return this._katana.hit(); };
            public sneak() { return this._shuriken.throw(); };

        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.bind<IKatana>("IKatana").to(Katana).inSingletonScope();
        kernel.bind<IShuriken>("IShuriken").to(Shuriken);

        let ninja1 = kernel.get<INinja>("INinja");
        expect(ninja1.fight()).eql(`This katana was used 1 times!`);
        expect(ninja1.fight()).eql(`This katana was used 2 times!`);
        expect(ninja1.sneak()).eql(`Only 9 items left!`);
        expect(ninja1.sneak()).eql(`Only 8 items left!`);

        let ninja2 = kernel.get<INinja>("INinja");
        expect(ninja2.fight()).eql(`This katana was used 3 times!`);
        expect(ninja2.sneak()).eql(`Only 9 items left!`);

    });

    it("Should support the injection of constant values", () => {

        interface IHero {
            name: string;
        }

        const TYPES = {
            IHero: "IHero"
        };

        let heroName = "superman";

        @injectable()
        class Hero implements IHero {
            public name: string;
            public constructor() {
                this.name = heroName;
            }
        }

        const kernel = new Kernel();
        kernel.bind<IHero>(TYPES.IHero).toConstantValue(new Hero());
        let hero = kernel.get<IHero>(TYPES.IHero);

        expect(hero.name).eql(heroName);

    });

    it("Should support the injection of dynamic values", () => {

        interface IUseDate {
            doSomething(): Date;
        }

        @injectable()
        class UseDate implements IUseDate {
            public currentDate: Date;
            public constructor(@inject("Date") currentDate: Date) {
                this.currentDate = currentDate;
            }
            public doSomething() {
                return this.currentDate;
            }
        }

        let kernel = new Kernel();
        kernel.bind<IUseDate>("IUseDate").to(UseDate);
        kernel.bind<Date>("Date").toDynamicValue(() => { return new Date(); });

        let subject1 = kernel.get<IUseDate>("IUseDate");
        let subject2 = kernel.get<IUseDate>("IUseDate");
        expect(subject1.doSomething() === subject2.doSomething()).eql(false);

        kernel.unbind("Date");
        kernel.bind<Date>("Date").toConstantValue(new Date());

        let subject3 = kernel.get<IUseDate>("IUseDate");
        let subject4 = kernel.get<IUseDate>("IUseDate");
        expect(subject3.doSomething() === subject4.doSomething()).eql(true);

    });

    it("Should support the injection of class constructors", () => {

      interface INinja {
          fight(): string;
          sneak(): string;
      }

      interface IKatana {
          hit(): string;
      }

      interface IShuriken {
          throw(): string;
      }

      @injectable()
      class Katana implements IKatana {
          public hit() {
              return "cut!";
          }
      }

      @injectable()
      class Shuriken implements IShuriken {
          public throw() {
              return "hit!";
          }
      }

      @injectable()
      class Ninja implements INinja {

          private _katana: IKatana;
          private _shuriken: IShuriken;

          public constructor(
              @inject("INewable<IKatana>") katana: INewable<IKatana>,
              @inject("IShuriken") shuriken: IShuriken
          ) {
              this._katana = new Katana();
              this._shuriken = shuriken;
          }

          public fight() { return this._katana.hit(); };
          public sneak() { return this._shuriken.throw(); };

      }

      let kernel = new Kernel();
      kernel.bind<INinja>("INinja").to(Ninja);
      kernel.bind<INewable<IKatana>>("INewable<IKatana>").toConstructor<IKatana>(Katana);
      kernel.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();

      let ninja = kernel.get<INinja>("INinja");

      expect(ninja.fight()).eql("cut!");
      expect(ninja.sneak()).eql("hit!");

    });

    it("Should support the injection of user defined factories", () => {

        interface INinja {
            fight(): string;
            sneak(): string;
        }

        interface IKatana {
            hit(): string;
        }

        interface IShuriken {
            throw(): string;
        }

        @injectable()
        class Katana implements IKatana {
            public hit() {
                return "cut!";
            }
        }

        @injectable()
        class Shuriken implements IShuriken {
            public throw() {
                return "hit!";
            }
        }

        @injectable()
        class NinjaWithUserDefinedFactory implements INinja {

            private _katana: IKatana;
            private _shuriken: IShuriken;

            public constructor(
                @inject("IFactory<IKatana>") katanaFactory: () => IKatana,
                @inject("IShuriken") shuriken: IShuriken
            ) {
                this._katana = katanaFactory();
                this._shuriken = shuriken;
            }

            public fight() { return this._katana.hit(); };
            public sneak() { return this._shuriken.throw(); };

        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(NinjaWithUserDefinedFactory);
        kernel.bind<IShuriken>("IShuriken").to(Shuriken);
        kernel.bind<IKatana>("IKatana").to(Katana);
        kernel.bind<IFactory<IKatana>>("IFactory<IKatana>").toFactory<IKatana>((context) => {
            return () => {
                return context.kernel.get<IKatana>("IKatana");
            };
        });

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

    });

    it("Should support the injection of user defined factories with args", () => {

        interface INinja {
            fight(): string;
            sneak(): string;
        }

        interface IWeapon {
            use(): string;
        }

        @injectable()
        class Katana implements IWeapon {
            public use() {
                return "katana!";
            }
        }

        @injectable()
        class Shuriken implements IWeapon {
            public use() {
                return "shuriken!";
            }
        }

        @injectable()
        class NinjaWithUserDefinedFactory implements INinja {

            private _katana: IWeapon;
            private _shuriken: IWeapon;

            public constructor(
                @inject("IFactory<IWeapon>") weaponFactory: (throwable: boolean) => IWeapon
            ) {
                this._katana = weaponFactory(false);
                this._shuriken = weaponFactory(true);
            }

            public fight() { return this._katana.use(); };
            public sneak() { return this._shuriken.use(); };

        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(NinjaWithUserDefinedFactory);
        kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetTagged("throwable", true);
        kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetTagged("throwable", false);
        kernel.bind<IFactory<IWeapon>>("IFactory<IWeapon>").toFactory<IWeapon>((context) => {
            return (throwable: boolean) => {
                if (throwable) {
                    return context.kernel.getTagged<IWeapon>("IWeapon", "throwable", true);
                } else {
                    return context.kernel.getTagged<IWeapon>("IWeapon", "throwable", false);
                }
            };
        });

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja.fight()).eql("katana!");
        expect(ninja.sneak()).eql("shuriken!");

    });

    it("Should support the injection of user defined factories with partial application", () => {

        interface IInjectorPump {}

        @injectable()
        class InjectorPump implements IInjectorPump {}

        interface ISparkPlugs {}

        @injectable()
        class SparkPlugs implements ISparkPlugs {}

        class IEngine {
            public displacement: number;
        }

        @injectable()
        class DieselEngine implements IEngine {
            public displacement: number;
            private _injectorPump: IInjectorPump;
            constructor(
                @inject("IInjectorPump") injectorPump: IInjectorPump
            ) {
                this._injectorPump = injectorPump;
                this.displacement = null;
            }
        }

        @injectable()
        class PetrolEngine implements IEngine {
            public displacement: number;
            private _sparkPlugs: ISparkPlugs;
            constructor(
                @inject("ISparkPlugs") sparkPlugs: ISparkPlugs
            ) {
                this._sparkPlugs = sparkPlugs;
                this.displacement = null;
            }
        }

        interface ICarFactory {
            createEngine(displacement: number): IEngine;
        }

        @injectable()
        class DieselCarFactory implements ICarFactory {
            private _dieselFactory: (displacement: number) => IEngine ;
            constructor(
                @inject("IFactory<IEngine>") factory: (category: string) => (displacement: number) => IEngine
            ) {
                this._dieselFactory = factory("diesel");
            }
            public createEngine(displacement: number): IEngine {
                return this._dieselFactory(displacement);
            }
        }

        let kernel = new Kernel();
        kernel.bind<ISparkPlugs>("ISparkPlugs").to(SparkPlugs);
        kernel.bind<IInjectorPump>("IInjectorPump").to(InjectorPump);
        kernel.bind<IEngine>("IEngine").to(PetrolEngine).whenTargetNamed("petrol");
        kernel.bind<IEngine>("IEngine").to(DieselEngine).whenTargetNamed("diesel");

        kernel.bind<IFactory<IEngine>>("IFactory<IEngine>").toFactory<IEngine>((context) => {
            return (named: string) => (displacement: number) => {
                let engine = context.kernel.getNamed<IEngine>("IEngine", named);
                engine.displacement = displacement;
                return engine;
            };
        });

        kernel.bind<ICarFactory>("IDieselCarFactory").to(DieselCarFactory);

        let dieselCarFactory = kernel.get<ICarFactory>("IDieselCarFactory");
        let engine = dieselCarFactory.createEngine(300);

        expect(engine.displacement).eql(300);
        expect(engine instanceof DieselEngine).eql(true);

    });

    it("Should support the injection of auto factories", () => {

        interface INinja {
            fight(): string;
            sneak(): string;
        }

        interface IKatana {
            hit(): string;
        }

        interface IShuriken {
            throw(): string;
        }

        @injectable()
        class Katana implements IKatana {
            public hit() {
                return "cut!";
            }
        }

        @injectable()
        class Shuriken implements IShuriken {
            public throw() {
                return "hit!";
            }
        }

        @injectable()
        class NinjaWithAutoFactory implements INinja {

            private _katana: IKatana;
            private _shuriken: IShuriken;

            public constructor(
                @inject("IFactory<IKatana>") katanaAutoFactory: () => IKatana,
                @inject("IShuriken") shuriken: IShuriken
            ) {
                this._katana = katanaAutoFactory();
                this._shuriken = shuriken;
            }

            public fight() { return this._katana.hit(); };
            public sneak() { return this._shuriken.throw(); };

        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(NinjaWithAutoFactory);
        kernel.bind<IShuriken>("IShuriken").to(Shuriken);
        kernel.bind<IKatana>("IKatana").to(Katana);
        kernel.bind<IFactory<IKatana>>("IFactory<IKatana>").toAutoFactory<IKatana>("IKatana");

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

    });

    it("Should support the injection of providers", (done) => {

        interface INinja {
            katana: IKatana;
            katanaProvider: IProvider<IKatana>;
        }

        interface IKatana {
            hit(): string;
        }

        @injectable()
        class Katana implements IKatana {
            public hit() {
                return "cut!";
            }
        }

        @injectable()
        class NinjaWithProvider implements INinja {

            public katana: IKatana;
            public katanaProvider: IProvider<IKatana>;

            public constructor(
                @inject("IProvider<IKatana>") katanaProvider: IProvider<IKatana>
            ) {
                this.katanaProvider = katanaProvider;
                this.katana = null;
            }

        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(NinjaWithProvider);
        kernel.bind<IKatana>("IKatana").to(Katana);
        kernel.bind<IProvider<IKatana>>("IProvider<IKatana>").toProvider<IKatana>((context) => {
            return () => {
                return new Promise<IKatana>((resolve) => {
                    let katana = context.kernel.get<IKatana>("IKatana");
                    resolve(katana);
                });
            };
        });

        let ninja = kernel.get<INinja>("INinja");

        ninja.katanaProvider()
            .then((katana) => {
                ninja.katana = katana;
                expect(ninja.katana.hit()).eql("cut!");
                done();
            })
            .catch((e) => { console.log(e); });

    });

    it("Should support the injection of proxied objects", () => {

        interface IKatana {
            use: () => void;
        }

        @injectable()
        class Katana implements IKatana {
            public use() {
                return "Used Katana!";
            }
        }

        interface INinja {
            katana: IKatana;
        }

        @injectable()
        class Ninja implements INinja {
            public katana: IKatana;
            public constructor(@inject("IKatana") katana: IKatana) {
                this.katana = katana;
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);
        let log: string[] = [];

        kernel.bind<IKatana>("IKatana").to(Katana).onActivation((context: IContext, katana: IKatana) => {
            let handler = {
                apply: function(target: any, thisArgument: any, argumentsList: any[]) {
                    log.push(`Starting: ${new Date().getTime()}`);
                    let result = target.apply(thisArgument, argumentsList);
                    log.push(`Finished: ${new Date().getTime()}`);
                    return result;
                }
            };
            katana.use = new Proxy(katana.use, handler);
            return katana;
        });

        let ninja = kernel.get<INinja>("INinja");
        ninja.katana.use();

        expect(log.length).eql(2);
        expect(log[0].indexOf(`Starting: `)).not.to.eql(-1);
        expect(log[1].indexOf(`Finished: `)).not.to.eql(-1);

    });

    describe("Injection of multiple values with string as keys", () => {
        it("Should support the injection of multiple values", () => {

            interface IWeapon {
                name: string;
            }

            @injectable()
            class Katana implements IWeapon {
                public name = "Katana";
            }

            @injectable()
            class Shuriken implements IWeapon {
                public name = "Shuriken";
            }

            interface INinja {
                katana: IWeapon;
                shuriken: IWeapon;
            }

            @injectable()
            class Ninja implements INinja {
                public katana: IWeapon;
                public shuriken: IWeapon;
                public constructor(@multiInject("IWeapon") weapons: IWeapon[]) {
                    this.katana = weapons[0];
                    this.shuriken = weapons[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<INinja>("INinja").to(Ninja);
            kernel.bind<IWeapon>("IWeapon").to(Katana);
            kernel.bind<IWeapon>("IWeapon").to(Shuriken);

            let ninja = kernel.get<INinja>("INinja");
            expect(ninja.katana.name).eql("Katana");
            expect(ninja.shuriken.name).eql("Shuriken");

            // if only one value is bound to IWeapon
            let kernel2 = new Kernel();
            kernel2.bind<INinja>("INinja").to(Ninja);
            kernel2.bind<IWeapon>("IWeapon").to(Katana);

            let ninja2 = kernel2.get<INinja>("INinja");
            expect(ninja2.katana.name).eql("Katana");

        });

        it("Should support the injection of multiple values with nested inject", () => {

            interface INinja {
                fight(): string;
                sneak(): string;
            }

            interface IKatana {
                hit(): string;
            }

            interface IShuriken {
                throw(): string;
            }

            @injectable()
            class Katana implements IKatana {
                public hit() {
                    return "cut!";
                }
            }

            @injectable()
            class Shuriken implements IShuriken {
                public throw() {
                    return "hit!";
                }
            }

            @injectable()
            class Ninja implements INinja {

                private _katana: IKatana;
                private _shuriken: IShuriken;

                public constructor(
                    @inject("IKatana") katana: IKatana,
                    @inject("IShuriken") shuriken: IShuriken
                ) {
                    this._katana = katana;
                    this._shuriken = shuriken;
                }

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            interface INinjaSchool {
                ninjaMaster: INinja;
                student: INinja;
            }

            @injectable()
            class NinjaSchool implements INinjaSchool {
                public ninjaMaster: INinja;
                public student: INinja;

                constructor(
                    @multiInject("INinja") ninja: INinja[]
                ) {
                    this.ninjaMaster = ninja[0];
                    this.student = ninja[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<IKatana>("IKatana").to(Katana);
            kernel.bind<IShuriken>("IShuriken").to(Shuriken);
            kernel.bind<INinja>("INinja").to(Ninja);
            kernel.bind<INinja>("INinja").to(Ninja);
            kernel.bind<INinjaSchool>("INinjaSchool").to(NinjaSchool);

            let ninjaSchool = kernel.get<INinjaSchool>("INinjaSchool");
            expect(ninjaSchool.ninjaMaster.fight()).eql("cut!");
            expect(ninjaSchool.ninjaMaster.sneak()).eql("hit!");

            expect(ninjaSchool.student.fight()).eql("cut!");
            expect(ninjaSchool.student.sneak()).eql("hit!");

        });

        it("Should support the injection of multiple values with nested multiInject", () => {

            interface INinja {
                fight(): string;
                sneak(): string;
            }

            interface IKatana {
                hit(): string;
            }

            interface IShuriken {
                throw(): string;
            }

            @injectable()
            class Katana implements IKatana {
                public hit() {
                    return "cut!";
                }
            }

            @injectable()
            class Shuriken implements IShuriken {
                public throw() {
                    return "hit!";
                }
            }

            @injectable()
            class Ninja implements INinja {

                private _katana: IKatana;
                private _shuriken: IShuriken;

                public constructor(
                    @inject("IKatana") katana: IKatana,
                    @inject("IShuriken") shuriken: IShuriken
                ) {
                    this._katana = katana;
                    this._shuriken = shuriken;
                }

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            interface INinjaSchool {
                ninjaMaster: INinja;
                student: INinja;
            }

            @injectable()
            class NinjaSchool implements INinjaSchool {
                public ninjaMaster: INinja;
                public student: INinja;

                constructor(
                    @multiInject("INinja") ninjas: INinja[]
                ) {
                    this.ninjaMaster = ninjas[0];
                    this.student = ninjas[1];
                }
            }

            interface INinjaOrganisation {
                schools: INinjaSchool[];
            }

            @injectable()
            class NinjaOrganisation implements INinjaOrganisation {
                public schools: INinjaSchool[];

                constructor(
                    @multiInject("INinjaSchool") schools: INinjaSchool[]
                ) {
                    this.schools = schools;
                }
            }

            let kernel = new Kernel();
            kernel.bind<IKatana>("IKatana").to(Katana);
            kernel.bind<IShuriken>("IShuriken").to(Shuriken);
            kernel.bind<INinja>("INinja").to(Ninja);
            kernel.bind<INinja>("INinja").to(Ninja);
            kernel.bind<INinjaSchool>("INinjaSchool").to(NinjaSchool);
            kernel.bind<INinjaSchool>("INinjaSchool").to(NinjaSchool);
            kernel.bind<INinjaOrganisation>("INinjaOrganisation").to(NinjaOrganisation);

            let ninjaOrganisation = kernel.get<INinjaOrganisation>("INinjaOrganisation");

            for (let i = 0; i < 2; i++) {
                expect(ninjaOrganisation.schools[i].ninjaMaster.fight()).eql("cut!");
                expect(ninjaOrganisation.schools[i].ninjaMaster.sneak()).eql("hit!");
                expect(ninjaOrganisation.schools[i].student.fight()).eql("cut!");
                expect(ninjaOrganisation.schools[i].student.sneak()).eql("hit!");
            }

        });
    });

    describe("Injection of multiple values with class as keys", () => {
        it("Should support the injection of multiple values when using classes as keys", () => {

            @injectable()
            class Weapon {
                public name: string;
            }

            @injectable()
            class Katana extends Weapon {
                constructor() {
                    super();
                    this.name = "Katana";
                }
            }

            @injectable()
            class Shuriken extends Weapon {
                constructor() {
                    super();
                    this.name = "Shuriken";
                }
            }

            @injectable()
            class Ninja {
                public katana: Weapon;
                public shuriken: Weapon;
                public constructor(@multiInject(Weapon) weapons: Weapon[]) {
                    this.katana = weapons[0];
                    this.shuriken = weapons[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<Ninja>(Ninja).to(Ninja);
            kernel.bind<Weapon>(Weapon).to(Katana);
            kernel.bind<Weapon>(Weapon).to(Shuriken);

            let ninja = kernel.get<Ninja>(Ninja);
            expect(ninja.katana.name).eql("Katana");
            expect(ninja.shuriken.name).eql("Shuriken");

            // if only one value is bound to IWeapon
            let kernel2 = new Kernel();
            kernel2.bind<Ninja>(Ninja).to(Ninja);
            kernel2.bind<Weapon>(Weapon).to(Katana);

            let ninja2 = kernel2.get<Ninja>(Ninja);
            expect(ninja2.katana.name).eql("Katana");

        });

        it("Should support the injection of multiple values with nested inject", () => {

            @injectable()
            class Katana {
                public hit() {
                    return "cut!";
                }
            }

            @injectable()
            class Shuriken {
                public throw() {
                    return "hit!";
                }
            }

            @injectable()
            class Ninja {

                private _katana: Katana;
                private _shuriken: Shuriken;

                public constructor(
                    katana: Katana,
                    shuriken: Shuriken
                ) {
                    this._katana = katana;
                    this._shuriken = shuriken;
                }

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            @injectable()
            class NinjaSchool {
                public ninjaMaster: Ninja;
                public student: Ninja;

                constructor(
                    @multiInject(Ninja) ninja: Ninja[]
                ) {
                    this.ninjaMaster = ninja[0];
                    this.student = ninja[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<Katana>(Katana).to(Katana);
            kernel.bind<Shuriken>(Shuriken).to(Shuriken);
            kernel.bind<Ninja>(Ninja).to(Ninja);
            kernel.bind<Ninja>(Ninja).to(Ninja);
            kernel.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);

            let ninjaSchool = kernel.get<NinjaSchool>(NinjaSchool);
            expect(ninjaSchool.ninjaMaster.fight()).eql("cut!");
            expect(ninjaSchool.ninjaMaster.sneak()).eql("hit!");

            expect(ninjaSchool.student.fight()).eql("cut!");
            expect(ninjaSchool.student.sneak()).eql("hit!");

        });

        it("Should support the injection of multiple values with nested multiInject", () => {

            @injectable()
            class Katana {
                public hit() {
                    return "cut!";
                }
            }

            @injectable()
            class Shuriken {
                public throw() {
                    return "hit!";
                }
            }

            @injectable()
            class Ninja {

                private _katana: Katana;
                private _shuriken: Shuriken;

                public constructor(
                    katana: Katana,
                    shuriken: Shuriken
                ) {
                    this._katana = katana;
                    this._shuriken = shuriken;
                }

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            @injectable()
            class NinjaSchool {
                public ninjaMaster: Ninja;
                public student: Ninja;

                constructor(
                    @multiInject(Ninja) ninjas: Ninja[]
                ) {
                    this.ninjaMaster = ninjas[0];
                    this.student = ninjas[1];
                }
            }

            @injectable()
            class NinjaOrganisation {
                public schools: NinjaSchool[];

                constructor(
                    @multiInject(NinjaSchool) schools: NinjaSchool[]
                ) {
                    this.schools = schools;
                }
            }

            let kernel = new Kernel();
            kernel.bind<Katana>(Katana).to(Katana);
            kernel.bind<Shuriken>(Shuriken).to(Shuriken);
            kernel.bind<Ninja>(Ninja).to(Ninja);
            kernel.bind<Ninja>(Ninja).to(Ninja);
            kernel.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);
            kernel.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);
            kernel.bind<NinjaOrganisation>(NinjaOrganisation).to(NinjaOrganisation);

            let ninjaOrganisation = kernel.get<NinjaOrganisation>(NinjaOrganisation);

            for (let i = 0; i < 2; i++) {
                expect(ninjaOrganisation.schools[i].ninjaMaster.fight()).eql("cut!");
                expect(ninjaOrganisation.schools[i].ninjaMaster.sneak()).eql("hit!");
                expect(ninjaOrganisation.schools[i].student.fight()).eql("cut!");
                expect(ninjaOrganisation.schools[i].student.sneak()).eql("hit!");
            }

        });

    });

    describe("Injection of multiple values with Symbol as keys", () => {
        it("Should support the injection of multiple values when using Symbols as keys", () => {

            let TYPES = {
                INinja: Symbol("INinja"),
                IWeapon: Symbol("IWeapon")
            };

            interface IWeapon {
                name: string;
            }

            @injectable()
            class Katana implements IWeapon {
                public name = "Katana";
            }

            @injectable()
            class Shuriken implements IWeapon {
                public name = "Shuriken";
            }

            interface INinja {
                katana: IWeapon;
                shuriken: IWeapon;
            }

            @injectable()
            class Ninja implements INinja {
                public katana: IWeapon;
                public shuriken: IWeapon;
                public constructor(@multiInject(TYPES.IWeapon) weapons: IWeapon[]) {
                    this.katana = weapons[0];
                    this.shuriken = weapons[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<INinja>(TYPES.INinja).to(Ninja);
            kernel.bind<IWeapon>(TYPES.IWeapon).to(Katana);
            kernel.bind<IWeapon>(TYPES.IWeapon).to(Shuriken);

            let ninja = kernel.get<INinja>(TYPES.INinja);
            expect(ninja.katana.name).eql("Katana");
            expect(ninja.shuriken.name).eql("Shuriken");

            // if only one value is bound to IWeapon
            let kernel2 = new Kernel();
            kernel2.bind<INinja>(TYPES.INinja).to(Ninja);
            kernel2.bind<IWeapon>(TYPES.IWeapon).to(Katana);

            let ninja2 = kernel2.get<INinja>(TYPES.INinja);
            expect(ninja2.katana.name).eql("Katana");

        });

        it("Should support the injection of multiple values with nested inject", () => {

            let TYPES = {
                IKatana: Symbol("IKatana"),
                INinja: Symbol("INinja"),
                INinjaSchool: Symbol("INinjaSchool"),
                IShuriken: Symbol("IShuriken"),
            };

            interface INinja {
                fight(): string;
                sneak(): string;
            }

            interface IKatana {
                hit(): string;
            }

            interface IShuriken {
                throw(): string;
            }

            @injectable()
            class Katana implements IKatana {
                public hit() {
                    return "cut!";
                }
            }

            @injectable()
            class Shuriken implements IShuriken {
                public throw() {
                    return "hit!";
                }
            }

            @injectable()
            class Ninja implements INinja {

                private _katana: IKatana;
                private _shuriken: IShuriken;

                public constructor(
                    @inject(TYPES.IKatana) katana: IKatana,
                    @inject(TYPES.IShuriken) shuriken: IShuriken
                ) {
                    this._katana = katana;
                    this._shuriken = shuriken;
                }

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            interface INinjaSchool {
                ninjaMaster: INinja;
                student: INinja;
            }

            @injectable()
            class NinjaSchool implements INinjaSchool {
                public ninjaMaster: INinja;
                public student: INinja;

                constructor(
                    @multiInject(TYPES.INinja) ninja: INinja[]
                ) {
                    this.ninjaMaster = ninja[0];
                    this.student = ninja[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<IKatana>(TYPES.IKatana).to(Katana);
            kernel.bind<IShuriken>(TYPES.IShuriken).to(Shuriken);
            kernel.bind<INinja>(TYPES.INinja).to(Ninja);
            kernel.bind<INinja>(TYPES.INinja).to(Ninja);
            kernel.bind<INinjaSchool>(TYPES.INinjaSchool).to(NinjaSchool);

            let ninjaSchool = kernel.get<INinjaSchool>(TYPES.INinjaSchool);
            expect(ninjaSchool.ninjaMaster.fight()).eql("cut!");
            expect(ninjaSchool.ninjaMaster.sneak()).eql("hit!");

            expect(ninjaSchool.student.fight()).eql("cut!");
            expect(ninjaSchool.student.sneak()).eql("hit!");

        });

        it("Should support the injection of multiple values with nested multiInject", () => {

            let TYPES = {
                IKatana: Symbol("IKatana"),
                INinja: Symbol("INinja"),
                INinjaOrganisation: Symbol("INinjaOrganisation"),
                INinjaSchool: Symbol("INinjaSchool"),
                IShuriken: Symbol("IShuriken"),
            };

            interface INinja {
                fight(): string;
                sneak(): string;
            }

            interface IKatana {
                hit(): string;
            }

            interface IShuriken {
                throw(): string;
            }

            @injectable()
            class Katana implements IKatana {
                public hit() {
                    return "cut!";
                }
            }

            @injectable()
            class Shuriken implements IShuriken {
                public throw() {
                    return "hit!";
                }
            }

            @injectable()
            class Ninja implements INinja {

                private _katana: IKatana;
                private _shuriken: IShuriken;

                public constructor(
                    @inject(TYPES.IKatana) katana: IKatana,
                    @inject(TYPES.IShuriken) shuriken: IShuriken
                ) {
                    this._katana = katana;
                    this._shuriken = shuriken;
                }

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            interface INinjaSchool {
                ninjaMaster: INinja;
                student: INinja;
            }

            @injectable()
            class NinjaSchool implements INinjaSchool {
                public ninjaMaster: INinja;
                public student: INinja;

                constructor(
                    @multiInject(TYPES.INinja) ninjas: INinja[]
                ) {
                    this.ninjaMaster = ninjas[0];
                    this.student = ninjas[1];
                }
            }

            interface INinjaOrganisation {
                schools: INinjaSchool[];
            }

            @injectable()
            class NinjaOrganisation implements INinjaOrganisation {
                public schools: INinjaSchool[];

                constructor(
                    @multiInject(TYPES.INinjaSchool) schools: INinjaSchool[]
                ) {
                    this.schools = schools;
                }
            }

            let kernel = new Kernel();
            kernel.bind<IKatana>(TYPES.IKatana).to(Katana);
            kernel.bind<IShuriken>(TYPES.IShuriken).to(Shuriken);
            kernel.bind<INinja>(TYPES.INinja).to(Ninja);
            kernel.bind<INinja>(TYPES.INinja).to(Ninja);
            kernel.bind<INinjaSchool>(TYPES.INinjaSchool).to(NinjaSchool);
            kernel.bind<INinjaSchool>(TYPES.INinjaSchool).to(NinjaSchool);
            kernel.bind<INinjaOrganisation>(TYPES.INinjaOrganisation).to(NinjaOrganisation);

            let ninjaOrganisation = kernel.get<INinjaOrganisation>(TYPES.INinjaOrganisation);

            for (let i = 0; i < 2; i++) {
                expect(ninjaOrganisation.schools[i].ninjaMaster.fight()).eql("cut!");
                expect(ninjaOrganisation.schools[i].ninjaMaster.sneak()).eql("hit!");
                expect(ninjaOrganisation.schools[i].student.fight()).eql("cut!");
                expect(ninjaOrganisation.schools[i].student.sneak()).eql("hit!");
            }

        });
    });

    it("Should support tagged bindings", () => {

        interface IWeapon {}

        @injectable()
        class Katana implements IWeapon { }

        @injectable()
        class Shuriken implements IWeapon {}

        interface INinja {
            katana: IWeapon;
            shuriken: IWeapon;
        }

        @injectable()
        class Ninja implements INinja {
            public katana: IWeapon;
            public shuriken: IWeapon;
            public constructor(
                @inject("IWeapon") @tagged("canThrow", false) katana: IWeapon,
                @inject("IWeapon") @tagged("canThrow", true) shuriken: IWeapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetTagged("canThrow", false);
        kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetTagged("canThrow", true);

        let ninja = kernel.get<INinja>("INinja");
        expect(ninja.katana instanceof Katana).eql(true);
        expect(ninja.shuriken instanceof Shuriken).eql(true);

    });

    it("Should support custom tag decorators", () => {

        interface IWeapon {}

        @injectable()
        class Katana implements IWeapon { }

        @injectable()
        class Shuriken implements IWeapon {}

        interface INinja {
            katana: IWeapon;
            shuriken: IWeapon;
        }

        let throwable = tagged("canThrow", true);
        let notThrowable = tagged("canThrow", false);

        @injectable()
        class Ninja implements INinja {
            public katana: IWeapon;
            public shuriken: IWeapon;
            public constructor(
                @inject("IWeapon") @notThrowable katana: IWeapon,
                @inject("IWeapon") @throwable shuriken: IWeapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetTagged("canThrow", false);
        kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetTagged("canThrow", true);

        let ninja = kernel.get<INinja>("INinja");
        expect(ninja.katana instanceof Katana).eql(true);
        expect(ninja.shuriken instanceof Shuriken).eql(true);

    });

    it("Should support named bindings", () => {

        interface IWeapon {}

        @injectable()
        class Katana implements IWeapon { }

        @injectable()
        class Shuriken implements IWeapon {}

        interface INinja {
            katana: IWeapon;
            shuriken: IWeapon;
        }

        @injectable()
        class Ninja implements INinja {
            public katana: IWeapon;
            public shuriken: IWeapon;
            public constructor(
                @inject("IWeapon") @named("strong") katana: IWeapon,
                @inject("IWeapon") @named("weak") shuriken: IWeapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetNamed("strong");
        kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetNamed("weak");

        let ninja = kernel.get<INinja>("INinja");
        expect(ninja.katana instanceof Katana).eql(true);
        expect(ninja.shuriken instanceof Shuriken).eql(true);

    });

    it("Should support contextual bindings and targetName annotation", () => {

        interface IWeapon {}

        @injectable()
        class Katana implements IWeapon { }

        @injectable()
        class Shuriken implements IWeapon {}

        interface INinja {
            katana: IWeapon;
            shuriken: IWeapon;
        }

        @injectable()
        class Ninja implements INinja {
            public katana: IWeapon;
            public shuriken: IWeapon;
            public constructor(
                @inject("IWeapon") @targetName("katana") katana: IWeapon,
                @inject("IWeapon") @targetName("shuriken") shuriken: IWeapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);

        kernel.bind<IWeapon>("IWeapon").to(Katana).when((request: IRequest) => {
            return request.target.name.equals("katana");
        });

        kernel.bind<IWeapon>("IWeapon").to(Shuriken).when((request: IRequest) => {
            return request.target.name.equals("shuriken");
        });

        let ninja = kernel.get<INinja>("INinja");
        expect(ninja.katana instanceof Katana).eql(true);
        expect(ninja.shuriken instanceof Shuriken).eql(true);

    });

    it("Should throw if circular dependencies found", () => {

        interface IA {}
        interface IB {}
        interface IC {}
        interface ID {}

        @injectable()
        class A implements IA {
            public b: IB;
            public c: IC;
            public constructor(
                @inject("IB")  b: IB,
                @inject("IC")  c: IC
            ) {
                this.b = b;
                this.c = c;
            }
        }

        @injectable()
        class B implements IB {}

        @injectable()
        class C implements IC {
            public d: ID;
            public constructor(@inject("ID") d: ID) {
                this.d = d;
            }
        }

        @injectable()
        class D implements ID {
            public a: IA;
            public constructor(@inject("IA") a: IA) {
                this.a = a;
            }
        }

        let kernel = new Kernel();
        kernel.bind<IA>("IA").to(A);
        kernel.bind<IB>("IB").to(B);
        kernel.bind<IC>("IC").to(C);
        kernel.bind<ID>("ID").to(D);

        function willThrow() {
            let a = kernel.get<IA>("IA");
            return a;
        }

        expect(willThrow).to.throw(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} IA and ID`);

    });

    it("Should be able to resolve a ambiguous binding by providing a named tag", () => {

        interface IWeapon {
            name: string;
        }

        @injectable()
        class Katana implements IWeapon {
            public name: string;
            public constructor() {
                this.name = "katana";
            }
        }

        @injectable()
        class Shuriken implements IWeapon {
            public name: string;
            public constructor() {
                this.name = "shuriken";
            }
        }

        let kernel = new Kernel();
        kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetNamed("japonese");
        kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetNamed("chinese");

        let katana = kernel.getNamed<IWeapon>("IWeapon", "japonese");
        let shuriken = kernel.getNamed<IWeapon>("IWeapon", "chinese");

        expect(katana.name).eql("katana");
        expect(shuriken.name).eql("shuriken");

    });

    it("Should be able to resolve a ambiguous binding by providing a custom tag", () => {

        interface IWeapon {
            name: string;
        }

        @injectable()
        class Katana implements IWeapon {
            public name: string;
            public constructor() {
                this.name = "katana";
            }
        }

        @injectable()
        class Shuriken implements IWeapon {
            public name: string;
            public constructor() {
                this.name = "shuriken";
            }
        }

        let kernel = new Kernel();
        kernel.bind<IWeapon>("IWeapon").to(Katana).whenTargetTagged("faction", "samurai");
        kernel.bind<IWeapon>("IWeapon").to(Shuriken).whenTargetTagged("faction", "ninja");

        let katana = kernel.getTagged<IWeapon>("IWeapon", "faction", "samurai");
        let shuriken = kernel.getTagged<IWeapon>("IWeapon", "faction", "ninja");

        expect(katana.name).eql("katana");
        expect(shuriken.name).eql("shuriken");

    });

    it("Should be able to inject into a super constructor", () => {

        const SYMBOLS = {
            ISamurai: Symbol("ISamurai"),
            ISamuraiMaster: Symbol("ISamuraiMaster"),
            ISamuraiMaster2: Symbol("ISamuraiMaster2"),
            IWeapon: Symbol("IWeapon")
        };

        interface IWeapon {
            name: string;
        }

        interface IWarrior {
            weapon: IWeapon;
        }

        @injectable()
        class Katana implements IWeapon {
            public name: string;
            public constructor() {
                this.name = "katana";
            }
        }

        // Important: notice no anotations required in base class
        // However, it is recommended to annotate it as well
        @injectable()
        class Samurai implements IWarrior {

            public weapon: IWeapon;

            public constructor(weapon: IWeapon) {
                this.weapon = weapon;
            }
        }

        // Important: derived classes constructor must be manually implemented and annotated
        // Therefore the following will fail
        @injectable()
        class SamuraiMaster extends Samurai implements IWarrior {
            public isMaster: boolean;
        }

        // However, he following will work
        @injectable()
        class SamuraiMaster2 extends Samurai implements IWarrior {
            public isMaster: boolean;
            public constructor(@inject(SYMBOLS.IWeapon) weapon: IWeapon) {
                super(weapon);
                this.isMaster = true;
            }
        }

        const kernel = new Kernel();
        kernel.bind<IWeapon>(SYMBOLS.IWeapon).to(Katana);
        kernel.bind<IWarrior>(SYMBOLS.ISamurai).to(Samurai);
        kernel.bind<IWarrior>(SYMBOLS.ISamuraiMaster).to(SamuraiMaster);
        kernel.bind<IWarrior>(SYMBOLS.ISamuraiMaster2).to(SamuraiMaster2);

        let errorFunction = () => { kernel.get<IWarrior>(SYMBOLS.ISamuraiMaster); };
        expect(errorFunction).to.throw(`${ERROR_MSGS.MISSING_EXPLICIT_CONSTRUCTOR} SamuraiMaster.`);

        let samuraiMaster2 = kernel.get<IWarrior>(SYMBOLS.ISamuraiMaster2);
        expect(samuraiMaster2.weapon.name).eql("katana");
        expect(typeof (<any>samuraiMaster2).isMaster).eql("boolean");

    });

    it("Should be able to inject a regular derived class", () => {

        const SYMBOLS = {
            ISamuraiMaster: Symbol("ISamuraiMaster"),
        };

        interface ISamurai {
            rank: string;
        }

        class Samurai implements ISamurai {

            public rank: string;

            public constructor(rank: string) {
                this.rank = rank;
            }
        }

        @injectable()
        class SamuraiMaster extends Samurai implements ISamurai {
            constructor() {
                super("Master");
            }
        }


        const kernel = new Kernel();
        kernel.bind<ISamurai>(SYMBOLS.ISamuraiMaster).to(SamuraiMaster);

        let samurai = kernel.get<ISamurai>(SYMBOLS.ISamuraiMaster);
        expect(samurai.rank).eql("Master");

    });

    it("Should support a whenInjectedInto contextual bindings constraint", () => {

        let TYPES = {
            INinja: "INinja",
            IWeapon: "IWeapon"
        };

        interface IWeapon {
            name: string;
        }

        @injectable()
        class Katana implements IWeapon {
            public name: string;
            public constructor() {
                this.name = "katana";
            }
        }

        @injectable()
        class Bokken implements IWeapon {
            public name: string;
            public constructor() {
                this.name = "bokken";
            }
        }

        interface INinja {
            weapon: IWeapon;
        }

        @injectable()
        class NinjaStudent implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") @targetName("weapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") @targetName("weapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Katana).whenInjectedInto(NinjaMaster);
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Bokken).whenInjectedInto(NinjaStudent);

        let master = kernel.getTagged<INinja>(TYPES.INinja, "master", true);
        let student = kernel.getTagged<INinja>(TYPES.INinja, "master", false);

        expect(master instanceof NinjaMaster).eql(true);
        expect(student instanceof NinjaStudent).eql(true);

        expect(master.weapon.name).eql("katana");
        expect(student.weapon.name).eql("bokken");

    });

    it("Should support a whenParentNamed contextual bindings constraint", () => {

        let TYPES = {
            IMaterial: "IMaterial",
            INinja: "INinja",
            IWeapon: "IWeapon"
        };

        interface IMaterial {
            name: string;
        }

        @injectable()
        class Wood implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface IWeapon {
            material: IMaterial;
        }

        @injectable()
        class Sword implements IWeapon {
            public material: IMaterial;
            public constructor(@inject("IMaterial") material: IMaterial) {
                this.material = material;
            }
        }

        interface INinja {
            weapon: IWeapon;
        }

        @injectable()
        class NinjaStudent implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") @named("non-lethal") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") @named("lethal") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenParentNamed("lethal");
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenParentNamed("non-lethal");

        let master = kernel.getTagged<INinja>(TYPES.INinja, "master", true);
        let student = kernel.getTagged<INinja>(TYPES.INinja, "master", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

    });

    it("Should support a whenParentTagged contextual bindings constraint", () => {

        let TYPES = {
            IMaterial: "IMaterial",
            INinja: "INinja",
            IWeapon: "IWeapon"
        };

        interface IMaterial {
            name: string;
        }

        @injectable()
        class Wood implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface IWeapon {
            material: IMaterial;
        }

        @injectable()
        class Sword implements IWeapon {
            public material: IMaterial;
            public constructor(@inject("IMaterial") material: IMaterial) {
                this.material = material;
            }
        }

        interface INinja {
            weapon: IWeapon;
        }

        @injectable()
        class NinjaStudent implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") @tagged("lethal", false) weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") @tagged("lethal", true) weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenParentTagged("lethal", true);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenParentTagged("lethal", false);

        let master = kernel.getTagged<INinja>(TYPES.INinja, "master", true);
        let student = kernel.getTagged<INinja>(TYPES.INinja, "master", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

    });

    it("Should support a whenAnyAncestorIs and whenNoAncestorIs contextual bindings constraint", () => {

        let TYPES = {
            IMaterial: "IMaterial",
            INinja: "INinja",
            IWeapon: "IWeapon"
        };

        interface IMaterial {
            name: string;
        }

        @injectable()
        class Wood implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface IWeapon {
            material: IMaterial;
        }

        @injectable()
        class Sword implements IWeapon {
            public material: IMaterial;
            public constructor(@inject("IMaterial") material: IMaterial) {
                this.material = material;
            }
        }

        interface INinja {
            weapon: IWeapon;
        }

        @injectable()
        class NinjaStudent implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        // whenAnyAncestorIs
        let kernel = new Kernel();
        kernel.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenAnyAncestorIs(NinjaMaster);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenAnyAncestorIs(NinjaStudent);

        let master = kernel.getTagged<INinja>(TYPES.INinja, "master", true);
        let student = kernel.getTagged<INinja>(TYPES.INinja, "master", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

        // whenNoAncestorIs
        let kernel2 = new Kernel();
        kernel2.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel2.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel2.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel2.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenNoAncestorIs(NinjaStudent);
        kernel2.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenNoAncestorIs(NinjaMaster);

        let master2 = kernel2.getTagged<INinja>(TYPES.INinja, "master", true);
        let student2 = kernel2.getTagged<INinja>(TYPES.INinja, "master", false);

        expect(master2.weapon.material.name).eql("iron");
        expect(student2.weapon.material.name).eql("wood");

    });

    it("Should support a whenAnyAncestorNamed and whenNoAncestorNamed contextual bindings constraint", () => {

        let TYPES = {
            IMaterial: "IMaterial",
            INinja: "INinja",
            IWeapon: "IWeapon"
        };

        interface IMaterial {
            name: string;
        }

        @injectable()
        class Wood implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface IWeapon {
            material: IMaterial;
        }

        @injectable()
        class Sword implements IWeapon {
            public material: IMaterial;
            public constructor(@inject("IMaterial") material: IMaterial) {
                this.material = material;
            }
        }

        interface INinja {
            weapon: IWeapon;
        }

        @injectable()
        class NinjaStudent implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        // whenAnyAncestorNamed
        let kernel = new Kernel();
        kernel.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetNamed("non-lethal");
        kernel.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetNamed("lethal");
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenAnyAncestorNamed("lethal");
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenAnyAncestorNamed("non-lethal");

        let master = kernel.getNamed<INinja>(TYPES.INinja, "lethal");
        let student = kernel.getNamed<INinja>(TYPES.INinja, "non-lethal");

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

        // whenNoAncestorNamed
        let kernel2 = new Kernel();
        kernel2.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetNamed("non-lethal");
        kernel2.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetNamed("lethal");
        kernel2.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel2.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenNoAncestorNamed("non-lethal");
        kernel2.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenNoAncestorNamed("lethal");

        let master2 = kernel.getNamed<INinja>(TYPES.INinja, "lethal");
        let student2 = kernel.getNamed<INinja>(TYPES.INinja, "non-lethal");

        expect(master2.weapon.material.name).eql("iron");
        expect(student2.weapon.material.name).eql("wood");

    });

    it("Should support a whenAnyAncestorTagged and whenNoAncestorTaggedcontextual bindings constraint", () => {

        let TYPES = {
            IMaterial: "IMaterial",
            INinja: "INinja",
            IWeapon: "IWeapon"
        };

        interface IMaterial {
            name: string;
        }

        @injectable()
        class Wood implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface IWeapon {
            material: IMaterial;
        }

        @injectable()
        class Sword implements IWeapon {
            public material: IMaterial;
            public constructor(@inject("IMaterial") material: IMaterial) {
                this.material = material;
            }
        }

        interface INinja {
            weapon: IWeapon;
        }

        @injectable()
        class NinjaStudent implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        // whenAnyAncestorTagged
        let kernel = new Kernel();
        kernel.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetTagged("lethal", false);
        kernel.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetTagged("lethal", true);
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenAnyAncestorTagged("lethal", true);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenAnyAncestorTagged("lethal", false);

        let master = kernel.getTagged<INinja>(TYPES.INinja, "lethal", true);
        let student = kernel.getTagged<INinja>(TYPES.INinja, "lethal", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

        // whenNoAncestorTagged
        let kernel2 = new Kernel();
        kernel2.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetTagged("lethal", false);
        kernel2.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetTagged("lethal", true);
        kernel2.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel2.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenNoAncestorTagged("lethal", false);
        kernel2.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenNoAncestorTagged("lethal", true);

        let master2 = kernel.getTagged<INinja>(TYPES.INinja, "lethal", true);
        let student2 = kernel.getTagged<INinja>(TYPES.INinja, "lethal", false);

        expect(master2.weapon.material.name).eql("iron");
        expect(student2.weapon.material.name).eql("wood");

    });

    it("Should support a whenAnyAncestorMatches and whenNoAncestorMatches contextual bindings constraint", () => {

        let TYPES = {
            IMaterial: "IMaterial",
            INinja: "INinja",
            IWeapon: "IWeapon"
        };

        interface IMaterial {
            name: string;
        }

        @injectable()
        class Wood implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements IMaterial {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface IWeapon {
            material: IMaterial;
        }

        @injectable()
        class Sword implements IWeapon {
            public material: IMaterial;
            public constructor(@inject("IMaterial") material: IMaterial) {
                this.material = material;
            }
        }

        interface INinja {
            weapon: IWeapon;
        }

        @injectable()
        class NinjaStudent implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements INinja {

            public weapon: IWeapon;

            public constructor(
                @inject("IWeapon") weapon: IWeapon
            ) {
                this.weapon = weapon;
            }
        }

        // custom constraints
        let anyAncestorIsNinjaMasterConstraint = typeConstraint(NinjaMaster);
        let anyAncestorIsNinjaStudentConstraint = typeConstraint(NinjaStudent);

        // whenAnyAncestorMatches
        let kernel = new Kernel();
        kernel.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenAnyAncestorMatches(anyAncestorIsNinjaMasterConstraint);
        kernel.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenAnyAncestorMatches(anyAncestorIsNinjaStudentConstraint);

        let master = kernel.getTagged<INinja>(TYPES.INinja, "master", true);
        let student = kernel.getTagged<INinja>(TYPES.INinja, "master", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

        // whenNoAncestorMatches
        let kernel2 = new Kernel();
        kernel2.bind<INinja>(TYPES.INinja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel2.bind<INinja>(TYPES.INinja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel2.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel2.bind<IMaterial>(TYPES.IMaterial).to(Iron).whenNoAncestorMatches(anyAncestorIsNinjaStudentConstraint);
        kernel2.bind<IMaterial>(TYPES.IMaterial).to(Wood).whenNoAncestorMatches(anyAncestorIsNinjaMasterConstraint);

        let master2 = kernel2.getTagged<INinja>(TYPES.INinja, "master", true);
        let student2 = kernel2.getTagged<INinja>(TYPES.INinja, "master", false);

        expect(master2.weapon.material.name).eql("iron");
        expect(student2.weapon.material.name).eql("wood");

    });

    it("Should support property setter injection ", () => {

        let kernel = new Kernel();
        let inject = makePropertyInjectDecorator(kernel);

        interface ISomeService {
            count: number;
            increment(): void;
        }

        @injectable()
        class SomeService implements ISomeService {
            public count: number;
            public constructor() {
                this.count = 0;
            }
            public increment() {
                this.count = this.count + 1;
            }
        }

        class SomeWebComponent {
            @inject("ISomeService")
            private _service: ISomeService;
            public doSomething() {
                let count =  this._service.count;
                this._service.increment();
                return count;
            }
        }

        kernel.bind<ISomeService>("ISomeService").to(SomeService);

        let someComponent = new SomeWebComponent();
        expect(someComponent.doSomething()).eql(0);
        expect(someComponent.doSomething()).eql(1);

        let someComponent2 = new SomeWebComponent();
        expect(someComponent.doSomething()).eql(2);
        expect(someComponent2.doSomething()).eql(0);
        expect(someComponent2.doSomething()).eql(1);

    });

    it("Should support property setter multi-injection ", () => {

        let kernel = new Kernel();
        let multiInject = makePropertyMultiInjectDecorator(kernel);

        let TYPES = { IWeapon: "IWeapon" };

        interface IWeapon {
            durability: number;
            use(): void;
        }

        @injectable()
        class Sword implements IWeapon {
            public durability: number;
            public constructor() {
                this.durability = 100;
            }
            public use() {
                this.durability = this.durability - 10;
            }
        }

        @injectable()
        class WarHammer implements IWeapon {
            public durability: number;
            public constructor() {
                this.durability = 100;
            }
            public use() {
                this.durability = this.durability - 10;
            }
        }

        class Warrior {
            @multiInject(TYPES.IWeapon)
            public weapons: IWeapon[];
        }

        kernel.bind<IWeapon>(TYPES.IWeapon).to(Sword);
        kernel.bind<IWeapon>(TYPES.IWeapon).to(WarHammer);

        let warrior1 = new Warrior();

        expect(warrior1.weapons[0]).to.be.instanceof(Sword);
        expect(warrior1.weapons[1]).to.be.instanceof(WarHammer);
        expect(warrior1.weapons[0].durability).eql(100);
        expect(warrior1.weapons[1].durability).eql(100);

        warrior1.weapons[0].use();
        warrior1.weapons[1].use();

        expect(warrior1.weapons[0].durability).eql(90);
        expect(warrior1.weapons[1].durability).eql(90);

        let warrior2 = new Warrior();
        expect(warrior1.weapons[0].durability).eql(90);
        expect(warrior1.weapons[1].durability).eql(90);
        expect(warrior2.weapons[0].durability).eql(100);
        expect(warrior2.weapons[1].durability).eql(100);

    });

});
