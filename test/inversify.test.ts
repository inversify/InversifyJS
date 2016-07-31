import interfaces from "../src/interfaces/interfaces";
import { expect } from "chai";
import "es6-symbol/implement";
import * as ERROR_MSGS from "../src/constants/error_msgs";
import * as Stubs from "./utils/stubs";
import {
    Kernel, injectable, inject, multiInject,
    tagged, named, targetName, decorate, typeConstraint,
    makePropertyInjectDecorator, makePropertyMultiInjectDecorator,
    KernelModule
} from "../src/inversify";

describe("InversifyJS", () => {

  it("Should be able to resolve and inject dependencies", () => {

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

          public fight() { return this._katana.hit(); };
          public sneak() { return this._shuriken.throw(); };

      }

      let kernel = new Kernel();
      kernel.bind<Ninja>("Ninja").to(Ninja);
      kernel.bind<Katana>("Katana").to(Katana);
      kernel.bind<Shuriken>("Shuriken").to(Shuriken);

      let ninja = kernel.get<Ninja>("Ninja");

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

      let TYPES = {
          Katana: Symbol("Katana"),
          Ninja: Symbol("Ninja"),
          Shuriken: Symbol("Shuriken")
      };

      @injectable()
      class Ninja implements Ninja {

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
      kernel.bind<Ninja>(TYPES.Ninja).to(Ninja);
      kernel.bind<Katana>(TYPES.Katana).to(Katana);
      kernel.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);

      let ninja = kernel.get<Ninja>(TYPES.Ninja);

      expect(ninja.fight()).eql("cut!");
      expect(ninja.sneak()).eql("hit!");

  });

    it("Should support Kernel modules", () => {

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

            public constructor(@inject("Katana") katana: Katana, @inject("Shuriken") shuriken: Shuriken) {
                this._katana = katana;
                this._shuriken = shuriken;
            }

            public fight() { return this._katana.hit(); };
            public sneak() { return this._shuriken.throw(); };

        }

        let warriors = new KernelModule((bind: interfaces.Bind) => {
            bind<Ninja>("Ninja").to(Ninja);
        });

        let weapons = new KernelModule((bind: interfaces.Bind) => {
            bind<Katana>("Katana").to(Katana);
            bind<Shuriken>("Shuriken").to(Shuriken);
        });

        let kernel = new Kernel();

        // load
        kernel.load(warriors, weapons);

        let ninja = kernel.get<Ninja>("Ninja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

        let tryGetNinja = () => { kernel.get("Ninja"); };
        let tryGetKatana = () => { kernel.get("Katana"); };
        let tryGetShuruken = () => { kernel.get("Shuriken"); };

        // unload
        kernel.unload(warriors);
        expect(tryGetNinja).to.throw(ERROR_MSGS.NOT_REGISTERED);
        expect(tryGetKatana).not.to.throw();
        expect(tryGetShuruken).not.to.throw();

        kernel.unload(weapons);
        expect(tryGetNinja).to.throw(ERROR_MSGS.NOT_REGISTERED);
        expect(tryGetKatana).to.throw(ERROR_MSGS.NOT_REGISTERED);
        expect(tryGetShuruken).to.throw(ERROR_MSGS.NOT_REGISTERED);

    });

    it("Should support control over the scope of the dependencies", () => {

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
        class Shuriken implements Shuriken {
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

            public fight() { return this._katana.hit(); };
            public sneak() { return this._shuriken.throw(); };

        }

        let kernel = new Kernel();
        kernel.bind<Ninja>("Ninja").to(Ninja);
        kernel.bind<Katana>("Katana").to(Katana).inSingletonScope();
        kernel.bind<Shuriken>("Shuriken").to(Shuriken);

        let ninja1 = kernel.get<Ninja>("Ninja");
        expect(ninja1.fight()).eql(`This katana was used 1 times!`);
        expect(ninja1.fight()).eql(`This katana was used 2 times!`);
        expect(ninja1.sneak()).eql(`Only 9 items left!`);
        expect(ninja1.sneak()).eql(`Only 8 items left!`);

        let ninja2 = kernel.get<Ninja>("Ninja");
        expect(ninja2.fight()).eql(`This katana was used 3 times!`);
        expect(ninja2.sneak()).eql(`Only 9 items left!`);

    });

    it("Should support the injection of classes to itself", () => {

        let heroName = "superman";

        @injectable()
        class Hero {
            public name: string;
            public constructor() {
                this.name = heroName;
            }
        }

        const kernel = new Kernel();
        kernel.bind(Hero).toSelf();
        let hero = kernel.get<Hero>(Hero);

        expect(hero.name).eql(heroName);

    });

    it("Should support the injection of constant values", () => {

        interface Warrior {
            name: string;
        }

        const TYPES = {
            Warrior: "Warrior"
        };

        let heroName = "superman";

        @injectable()
        class Hero implements Warrior {
            public name: string;
            public constructor() {
                this.name = heroName;
            }
        }

        const kernel = new Kernel();
        kernel.bind<Warrior>(TYPES.Warrior).toConstantValue(new Hero());
        let hero = kernel.get<Warrior>(TYPES.Warrior);

        expect(hero.name).eql(heroName);

    });

    it("Should support the injection of dynamic values", () => {

        interface UseDate {
            doSomething(): Date;
        }

        @injectable()
        class UseDate implements UseDate {
            public currentDate: Date;
            public constructor(@inject("Date") currentDate: Date) {
                this.currentDate = currentDate;
            }
            public doSomething() {
                return this.currentDate;
            }
        }

        let kernel = new Kernel();
        kernel.bind<UseDate>("UseDate").to(UseDate);
        kernel.bind<Date>("Date").toDynamicValue(() => { return new Date(); });

        let subject1 = kernel.get<UseDate>("UseDate");
        let subject2 = kernel.get<UseDate>("UseDate");
        expect(subject1.doSomething() === subject2.doSomething()).eql(false);

        kernel.unbind("Date");
        kernel.bind<Date>("Date").toConstantValue(new Date());

        let subject3 = kernel.get<UseDate>("UseDate");
        let subject4 = kernel.get<UseDate>("UseDate");
        expect(subject3.doSomething() === subject4.doSomething()).eql(true);

    });

    it("Should support the injection of Functions", () => {

        let ninjaId = "Ninja";
        let longDistanceWeaponId = "LongDistanceWeapon";
        let shortDistanceWeaponFactoryId = "ShortDistanceWeaponFactory";

        interface ShortDistanceWeaponFactory extends Function {
            (): ShortDistanceWeapon;
        }

        interface KatanaBlade {}

        @injectable()
        class KatanaBlade implements KatanaBlade {}

        interface KatanaHandler {}

        @injectable()
        class KatanaHandler implements KatanaHandler {}

        interface ShortDistanceWeapon {
            handler: KatanaHandler;
            blade: KatanaBlade;
        }

        @injectable()
        class Katana implements ShortDistanceWeapon {
            public handler: KatanaHandler;
            public blade: KatanaBlade;
            public constructor(handler: KatanaHandler, blade: KatanaBlade) {
                this.handler = handler;
                this.blade = blade;
            }
        }

        interface LongDistanceWeapon {}

        @injectable()
        class Shuriken implements LongDistanceWeapon {}

        interface Warripr {
            shortDistanceWeaponFactory: ShortDistanceWeaponFactory;
            longDistanceWeapon: LongDistanceWeapon;
        }

        @injectable()
        class Ninja implements Warripr {
            public shortDistanceWeaponFactory: ShortDistanceWeaponFactory;
            public longDistanceWeapon: LongDistanceWeapon;
            public constructor(
                @inject(shortDistanceWeaponFactoryId) @targetName("katana") shortDistanceWeaponFactory: ShortDistanceWeaponFactory,
                @inject(longDistanceWeaponId) @targetName("shuriken") longDistanceWeapon: LongDistanceWeapon
            ) {
                this.shortDistanceWeaponFactory = shortDistanceWeaponFactory;
                this.longDistanceWeapon = longDistanceWeapon;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Ninja>(ninjaId).to(Ninja);
        kernel.bind<LongDistanceWeapon>(longDistanceWeaponId).to(Shuriken);

        let katanaFactory = function() {
            return new Katana(new KatanaHandler(), new KatanaBlade());
        };

        kernel.bind<ShortDistanceWeaponFactory>(shortDistanceWeaponFactoryId).toFunction(katanaFactory); // IMPORTANT!
        let ninja = kernel.get<Ninja>(ninjaId);

        expect(ninja instanceof Ninja).eql(true);
        expect(typeof ninja.shortDistanceWeaponFactory === "function").eql(true);
        expect(ninja.shortDistanceWeaponFactory() instanceof Katana).eql(true);
        expect(ninja.shortDistanceWeaponFactory().handler instanceof KatanaHandler).eql(true);
        expect(ninja.shortDistanceWeaponFactory().blade instanceof KatanaBlade).eql(true);
        expect(ninja.longDistanceWeapon instanceof Shuriken).eql(true);

    });

    it("Should support the injection of class constructors", () => {

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
              @inject("Newable<Katana>") katana: interfaces.Newable<Katana>,
              @inject("Shuriken") shuriken: Shuriken
          ) {
              this._katana = new Katana();
              this._shuriken = shuriken;
          }

          public fight() { return this._katana.hit(); };
          public sneak() { return this._shuriken.throw(); };

      }

      let kernel = new Kernel();
      kernel.bind<Ninja>("Ninja").to(Ninja);
      kernel.bind<interfaces.Newable<Katana>>("Newable<Katana>").toConstructor<Katana>(Katana);
      kernel.bind<Shuriken>("Shuriken").to(Shuriken).inSingletonScope();

      let ninja = kernel.get<Ninja>("Ninja");

      expect(ninja.fight()).eql("cut!");
      expect(ninja.sneak()).eql("hit!");

    });

    it("Should support the injection of user defined factories", () => {

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
        class NinjaWithUserDefinedFactory implements Ninja {

            private _katana: Katana;
            private _shuriken: Shuriken;

            public constructor(
                @inject("Factory<Katana>") katanaFactory: () => Katana,
                @inject("Shuriken") shuriken: Shuriken
            ) {
                this._katana = katanaFactory();
                this._shuriken = shuriken;
            }

            public fight() { return this._katana.hit(); };
            public sneak() { return this._shuriken.throw(); };

        }

        let kernel = new Kernel();
        kernel.bind<Ninja>("Ninja").to(NinjaWithUserDefinedFactory);
        kernel.bind<Shuriken>("Shuriken").to(Shuriken);
        kernel.bind<Katana>("Katana").to(Katana);
        kernel.bind<interfaces.Factory<Katana>>("Factory<Katana>").toFactory<Katana>((context) => {
            return () => {
                return context.kernel.get<Katana>("Katana");
            };
        });

        let ninja = kernel.get<Ninja>("Ninja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

    });

    it("Should support the injection of user defined factories with args", () => {

        interface Ninja {
            fight(): string;
            sneak(): string;
        }

        interface Weapon {
            use(): string;
        }

        @injectable()
        class Katana implements Weapon {
            public use() {
                return "katana!";
            }
        }

        @injectable()
        class Shuriken implements Weapon {
            public use() {
                return "shuriken!";
            }
        }

        @injectable()
        class NinjaWithUserDefinedFactory implements Ninja {

            private _katana: Weapon;
            private _shuriken: Weapon;

            public constructor(
                @inject("Factory<Weapon>") weaponFactory: (throwable: boolean) => Weapon
            ) {
                this._katana = weaponFactory(false);
                this._shuriken = weaponFactory(true);
            }

            public fight() { return this._katana.use(); };
            public sneak() { return this._shuriken.use(); };

        }

        let kernel = new Kernel();
        kernel.bind<Ninja>("Ninja").to(NinjaWithUserDefinedFactory);
        kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("throwable", true);
        kernel.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("throwable", false);
        kernel.bind<interfaces.Factory<Weapon>>("Factory<Weapon>").toFactory<Weapon>((context) => {
            return (throwable: boolean) => {
                if (throwable) {
                    return context.kernel.getTagged<Weapon>("Weapon", "throwable", true);
                } else {
                    return context.kernel.getTagged<Weapon>("Weapon", "throwable", false);
                }
            };
        });

        let ninja = kernel.get<Ninja>("Ninja");

        expect(ninja.fight()).eql("katana!");
        expect(ninja.sneak()).eql("shuriken!");

    });

    it("Should support the injection of user defined factories with partial application", () => {

        interface InjectorPump {}

        @injectable()
        class InjectorPump implements InjectorPump {}

        interface SparkPlugs {}

        @injectable()
        class SparkPlugs implements SparkPlugs {}

        class Engine {
            public displacement: number;
        }

        @injectable()
        class DieselEngine implements Engine {
            public displacement: number;
            private _injectorPump: InjectorPump;
            constructor(
                @inject("InjectorPump") injectorPump: InjectorPump
            ) {
                this._injectorPump = injectorPump;
                this.displacement = null;
            }
        }

        @injectable()
        class PetrolEngine implements Engine {
            public displacement: number;
            private _sparkPlugs: SparkPlugs;
            constructor(
                @inject("SparkPlugs") sparkPlugs: SparkPlugs
            ) {
                this._sparkPlugs = sparkPlugs;
                this.displacement = null;
            }
        }

        interface CarFactory {
            createEngine(displacement: number): Engine;
        }

        @injectable()
        class DieselCarFactory implements CarFactory {
            private _dieselFactory: (displacement: number) => Engine ;
            constructor(
                @inject("Factory<Engine>") factory: (category: string) => (displacement: number) => Engine
            ) {
                this._dieselFactory = factory("diesel");
            }
            public createEngine(displacement: number): Engine {
                return this._dieselFactory(displacement);
            }
        }

        let kernel = new Kernel();
        kernel.bind<SparkPlugs>("SparkPlugs").to(SparkPlugs);
        kernel.bind<InjectorPump>("InjectorPump").to(InjectorPump);
        kernel.bind<Engine>("Engine").to(PetrolEngine).whenTargetNamed("petrol");
        kernel.bind<Engine>("Engine").to(DieselEngine).whenTargetNamed("diesel");

        kernel.bind<interfaces.Factory<Engine>>("Factory<Engine>").toFactory<Engine>((context: interfaces.Context) => {
            return (named: string) => (displacement: number) => {
                let engine = context.kernel.getNamed<Engine>("Engine", named);
                engine.displacement = displacement;
                return engine;
            };
        });

        kernel.bind<CarFactory>("DieselCarFactory").to(DieselCarFactory);

        let dieselCarFactory = kernel.get<CarFactory>("DieselCarFactory");
        let engine = dieselCarFactory.createEngine(300);

        expect(engine.displacement).eql(300);
        expect(engine instanceof DieselEngine).eql(true);

    });

    it("Should support the injection of auto factories", () => {

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
        class NinjaWithAutoFactory implements Ninja {

            private _katana: Katana;
            private _shuriken: Shuriken;

            public constructor(
                @inject("Factory<Katana>") katanaAutoFactory: () => Katana,
                @inject("Shuriken") shuriken: Shuriken
            ) {
                this._katana = katanaAutoFactory();
                this._shuriken = shuriken;
            }

            public fight() { return this._katana.hit(); };
            public sneak() { return this._shuriken.throw(); };

        }

        let kernel = new Kernel();
        kernel.bind<Ninja>("Ninja").to(NinjaWithAutoFactory);
        kernel.bind<Shuriken>("Shuriken").to(Shuriken);
        kernel.bind<Katana>("Katana").to(Katana);
        kernel.bind<interfaces.Factory<Katana>>("Factory<Katana>").toAutoFactory<Katana>("Katana");

        let ninja = kernel.get<Ninja>("Ninja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

    });

    it("Should support the injection of providers", (done) => {

        interface Ninja {
            katana: Katana;
            katanaProvider: interfaces.Provider<Katana>;
        }

        interface Katana {
            hit(): string;
        }

        @injectable()
        class Katana implements Katana {
            public hit() {
                return "cut!";
            }
        }

        @injectable()
        class NinjaWithProvider implements Ninja {

            public katana: Katana;
            public katanaProvider: interfaces.Provider<Katana>;

            public constructor(
                @inject("Provider<Katana>") katanaProvider: interfaces.Provider<Katana>
            ) {
                this.katanaProvider = katanaProvider;
                this.katana = null;
            }

        }

        let kernel = new Kernel();
        kernel.bind<Ninja>("Ninja").to(NinjaWithProvider);
        kernel.bind<Katana>("Katana").to(Katana);
        kernel.bind<interfaces.Provider<Katana>>("Provider<Katana>").toProvider<Katana>((context: interfaces.Context) => {
            return () => {
                return new Promise<Katana>((resolve) => {
                    let katana = context.kernel.get<Katana>("Katana");
                    resolve(katana);
                });
            };
        });

        let ninja = kernel.get<Ninja>("Ninja");

        ninja.katanaProvider()
            .then((katana) => {
                ninja.katana = katana;
                expect(ninja.katana.hit()).eql("cut!");
                done();
            })
            .catch((e) => { console.log(e); });

    });

    describe("Injection of multiple values with string as keys", () => {

        it("Should support the injection of multiple values", () => {

            let warriorId = "Warrior";
            let weaponId = "Weapon";

            interface Weapon {
                name: string;
            }

            @injectable()
            class Katana implements Weapon {
                public name = "Katana";
            }

            @injectable()
            class Shuriken implements Weapon {
                public name = "Shuriken";
            }

            interface Warrior {
                katana: Weapon;
                shuriken: Weapon;
            }

            @injectable()
            class Ninja implements Warrior {
                public katana: Weapon;
                public shuriken: Weapon;
                public constructor(@multiInject(weaponId) weapons: Weapon[]) {
                    this.katana = weapons[0];
                    this.shuriken = weapons[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<Warrior>(warriorId).to(Ninja);
            kernel.bind<Weapon>(weaponId).to(Katana);
            kernel.bind<Weapon>(weaponId).to(Shuriken);

            let ninja = kernel.get<Warrior>(warriorId);
            expect(ninja.katana.name).eql("Katana");
            expect(ninja.shuriken.name).eql("Shuriken");

            // if only one value is bound to Weapon
            let kernel2 = new Kernel();
            kernel2.bind<Warrior>(warriorId).to(Ninja);
            kernel2.bind<Weapon>(weaponId).to(Katana);

            let ninja2 = kernel2.get<Warrior>(warriorId);
            expect(ninja2.katana.name).eql("Katana");

        });

        it("Should support the injection of multiple values with nested inject", () => {

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

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            interface School {
                ninjaMaster: Ninja;
                student: Ninja;
            }

            @injectable()
            class NinjaSchool implements School {
                public ninjaMaster: Ninja;
                public student: Ninja;

                constructor(
                    @multiInject("Ninja") ninja: Ninja[]
                ) {
                    this.ninjaMaster = ninja[0];
                    this.student = ninja[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<Katana>("Katana").to(Katana);
            kernel.bind<Shuriken>("Shuriken").to(Shuriken);
            kernel.bind<Ninja>("Ninja").to(Ninja);
            kernel.bind<Ninja>("Ninja").to(Ninja);
            kernel.bind<School>("School").to(NinjaSchool);

            let ninjaSchool = kernel.get<School>("School");
            expect(ninjaSchool.ninjaMaster.fight()).eql("cut!");
            expect(ninjaSchool.ninjaMaster.sneak()).eql("hit!");

            expect(ninjaSchool.student.fight()).eql("cut!");
            expect(ninjaSchool.student.sneak()).eql("hit!");

        });

        it("Should support the injection of multiple values with nested multiInject", () => {

            let warriorId = "Warrior";
            let swordId = "Sword";
            let shurikenId = "Shuriken";
            let schoolId = "School";
            let organisationId = "Organisation";

            interface Warrior {
                fight(): string;
                sneak(): string;
            }

            interface Sword {
                hit(): string;
            }

            interface Shuriken {
                throw(): string;
            }

            @injectable()
            class Katana implements Sword {
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
            class Ninja implements Warrior {

                private _katana: Sword;
                private _shuriken: Shuriken;

                public constructor(
                    @inject(swordId) katana: Sword,
                    @inject(shurikenId) shuriken: Shuriken
                ) {
                    this._katana = katana;
                    this._shuriken = shuriken;
                }

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            interface School {
                ninjaMaster: Warrior;
                student: Warrior;
            }

            @injectable()
            class NinjaSchool implements School {

                public ninjaMaster: Warrior;
                public student: Warrior;

                constructor(
                    @multiInject(warriorId) ninjas: Ninja[]
                ) {
                    this.ninjaMaster = ninjas[0];
                    this.student = ninjas[1];
                }
            }

            interface Organisation {
                schools: School[];
            }

            @injectable()
            class NinjaOrganisation implements Organisation {
                public schools: School[];

                constructor(
                    @multiInject(schoolId) schools: School[]
                ) {
                    this.schools = schools;
                }
            }

            let kernel = new Kernel();
            kernel.bind<Sword>(swordId).to(Katana);
            kernel.bind<Shuriken>(shurikenId).to(Shuriken);
            kernel.bind<Warrior>(warriorId).to(Ninja);
            kernel.bind<Warrior>(warriorId).to(Ninja);
            kernel.bind<School>(schoolId).to(NinjaSchool);
            kernel.bind<School>(schoolId).to(NinjaSchool);
            kernel.bind<Organisation>(organisationId).to(NinjaOrganisation);

            let ninjaOrganisation = kernel.get<Organisation>(organisationId);

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

            // if only one value is bound to Weapon
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
                Warrior: Symbol("Warrior"),
                Weapon: Symbol("Weapon")
            };

            interface Weapon {
                name: string;
            }

            @injectable()
            class Katana implements Weapon {
                public name = "Katana";
            }

            @injectable()
            class Shuriken implements Weapon {
                public name = "Shuriken";
            }

            interface Warrior {
                katana: Weapon;
                shuriken: Weapon;
            }

            @injectable()
            class Ninja implements Warrior {
                public katana: Weapon;
                public shuriken: Weapon;
                public constructor(@multiInject(TYPES.Weapon) weapons: Weapon[]) {
                    this.katana = weapons[0];
                    this.shuriken = weapons[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<Warrior>(TYPES.Warrior).to(Ninja);
            kernel.bind<Weapon>(TYPES.Weapon).to(Katana);
            kernel.bind<Weapon>(TYPES.Weapon).to(Shuriken);

            let ninja = kernel.get<Warrior>(TYPES.Warrior);
            expect(ninja.katana.name).eql("Katana");
            expect(ninja.shuriken.name).eql("Shuriken");

            // if only one value is bound to Weapon
            let kernel2 = new Kernel();
            kernel2.bind<Warrior>(TYPES.Warrior).to(Ninja);
            kernel2.bind<Weapon>(TYPES.Weapon).to(Katana);

            let ninja2 = kernel2.get<Warrior>(TYPES.Warrior);
            expect(ninja2.katana.name).eql("Katana");

        });

        it("Should support the injection of multiple values with nested inject", () => {

            let TYPES = {
                Katana: Symbol("Katana"),
                Ninja: Symbol("Ninja"),
                School: Symbol("School"),
                Shuriken: Symbol("Shuriken"),
            };

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
                    @inject(TYPES.Katana) katana: Katana,
                    @inject(TYPES.Shuriken) shuriken: Shuriken
                ) {
                    this._katana = katana;
                    this._shuriken = shuriken;
                }

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            interface School {
                ninjaMaster: Ninja;
                student: Ninja;
            }

            @injectable()
            class NinjaSchool implements School {
                public ninjaMaster: Ninja;
                public student: Ninja;

                constructor(
                    @multiInject(TYPES.Ninja) ninja: Ninja[]
                ) {
                    this.ninjaMaster = ninja[0];
                    this.student = ninja[1];
                }
            }

            let kernel = new Kernel();
            kernel.bind<Katana>(TYPES.Katana).to(Katana);
            kernel.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);
            kernel.bind<Ninja>(TYPES.Ninja).to(Ninja);
            kernel.bind<Ninja>(TYPES.Ninja).to(Ninja);
            kernel.bind<School>(TYPES.School).to(NinjaSchool);

            let ninjaSchool = kernel.get<School>(TYPES.School);
            expect(ninjaSchool.ninjaMaster.fight()).eql("cut!");
            expect(ninjaSchool.ninjaMaster.sneak()).eql("hit!");

            expect(ninjaSchool.student.fight()).eql("cut!");
            expect(ninjaSchool.student.sneak()).eql("hit!");

        });

        it("Should support the injection of multiple values with nested multiInject", () => {

            let TYPES = {
                Katana: Symbol("Katana"),
                Ninja: Symbol("Ninja"),
                Organisation: Symbol("Organisation"),
                School: Symbol("School"),
                Shuriken: Symbol("Shuriken"),
            };

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
                    @inject(TYPES.Katana) katana: Katana,
                    @inject(TYPES.Shuriken) shuriken: Shuriken
                ) {
                    this._katana = katana;
                    this._shuriken = shuriken;
                }

                public fight() { return this._katana.hit(); };
                public sneak() { return this._shuriken.throw(); };

            }

            interface School {
                ninjaMaster: Ninja;
                student: Ninja;
            }

            @injectable()
            class NinjaSchool implements School {
                public ninjaMaster: Ninja;
                public student: Ninja;

                constructor(
                    @multiInject(TYPES.Ninja) ninjas: Ninja[]
                ) {
                    this.ninjaMaster = ninjas[0];
                    this.student = ninjas[1];
                }
            }

            interface Organisation {
                schools: NinjaSchool[];
            }

            @injectable()
            class NinjaOrganisation implements Organisation {
                public schools: NinjaSchool[];

                constructor(
                    @multiInject(TYPES.School) schools: School[]
                ) {
                    this.schools = schools;
                }
            }

            let kernel = new Kernel();
            kernel.bind<Katana>(TYPES.Katana).to(Katana);
            kernel.bind<Shuriken>(TYPES.Shuriken).to(Shuriken);
            kernel.bind<Ninja>(TYPES.Ninja).to(Ninja);
            kernel.bind<Ninja>(TYPES.Ninja).to(Ninja);
            kernel.bind<School>(TYPES.School).to(NinjaSchool);
            kernel.bind<School>(TYPES.School).to(NinjaSchool);
            kernel.bind<Organisation>(TYPES.Organisation).to(NinjaOrganisation);

            let ninjaOrganisation = kernel.get<Organisation>(TYPES.Organisation);

            for (let i = 0; i < 2; i++) {
                expect(ninjaOrganisation.schools[i].ninjaMaster.fight()).eql("cut!");
                expect(ninjaOrganisation.schools[i].ninjaMaster.sneak()).eql("hit!");
                expect(ninjaOrganisation.schools[i].student.fight()).eql("cut!");
                expect(ninjaOrganisation.schools[i].student.sneak()).eql("hit!");
            }

        });
    });

    it("Should support tagged bindings", () => {

        interface Weapon {}

        @injectable()
        class Katana implements Weapon { }

        @injectable()
        class Shuriken implements Weapon {}

        interface Warrior {
            katana: Weapon;
            shuriken: Weapon;
        }

        @injectable()
        class Ninja implements Warrior {
            public katana: Weapon;
            public shuriken: Weapon;
            public constructor(
                @inject("Weapon") @tagged("canThrow", false) katana: Weapon,
                @inject("Weapon") @tagged("canThrow", true) shuriken: Weapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Warrior>("Warrior").to(Ninja);
        kernel.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("canThrow", false);
        kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("canThrow", true);

        let ninja = kernel.get<Warrior>("Warrior");
        expect(ninja.katana instanceof Katana).eql(true);
        expect(ninja.shuriken instanceof Shuriken).eql(true);

    });

    it("Should support custom tag decorators", () => {

        interface Weapon {}

        @injectable()
        class Katana implements Weapon { }

        @injectable()
        class Shuriken implements Weapon {}

        interface Warrior {
            katana: Weapon;
            shuriken: Weapon;
        }

        let throwable = tagged("canThrow", true);
        let notThrowable = tagged("canThrow", false);

        @injectable()
        class Ninja implements Warrior {
            public katana: Weapon;
            public shuriken: Weapon;
            public constructor(
                @inject("Weapon") @notThrowable katana: Weapon,
                @inject("Weapon") @throwable shuriken: Weapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Warrior>("Warrior").to(Ninja);
        kernel.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("canThrow", false);
        kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("canThrow", true);

        let ninja = kernel.get<Warrior>("Warrior");
        expect(ninja.katana instanceof Katana).eql(true);
        expect(ninja.shuriken instanceof Shuriken).eql(true);

    });

    it("Should support named bindings", () => {

        interface Weapon {}

        @injectable()
        class Katana implements Weapon { }

        @injectable()
        class Shuriken implements Weapon {}

        interface Warrior {
            katana: Weapon;
            shuriken: Weapon;
        }

        @injectable()
        class Ninja implements Warrior {
            public katana: Weapon;
            public shuriken: Weapon;
            public constructor(
                @inject("Weapon") @named("strong") katana: Weapon,
                @inject("Weapon") @named("weak") shuriken: Weapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Warrior>("Warrior").to(Ninja);
        kernel.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("strong");
        kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("weak");

        let ninja = kernel.get<Warrior>("Warrior");
        expect(ninja.katana instanceof Katana).eql(true);
        expect(ninja.shuriken instanceof Shuriken).eql(true);

    });

    it("Should support contextual bindings and targetName annotation", () => {

        interface Weapon {}

        @injectable()
        class Katana implements Weapon { }

        @injectable()
        class Shuriken implements Weapon {}

        interface Warrior {
            katana: Weapon;
            shuriken: Weapon;
        }

        @injectable()
        class Ninja implements Warrior {
            public katana: Weapon;
            public shuriken: Weapon;
            public constructor(
                @inject("Weapon") @targetName("katana") katana: Weapon,
                @inject("Weapon") @targetName("shuriken") shuriken: Weapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Warrior>("Warrior").to(Ninja);

        kernel.bind<Weapon>("Weapon").to(Katana).when((request: interfaces.Request) => {
            return request.target.name.equals("katana");
        });

        kernel.bind<Weapon>("Weapon").to(Shuriken).when((request: interfaces.Request) => {
            return request.target.name.equals("shuriken");
        });

        let ninja = kernel.get<Warrior>("Warrior");
        expect(ninja.katana instanceof Katana).eql(true);
        expect(ninja.shuriken instanceof Shuriken).eql(true);

    });

    it("Should be able to resolve a ambiguous binding by providing a named tag", () => {

        interface Weapon {
            name: string;
        }

        @injectable()
        class Katana implements Weapon {
            public name: string;
            public constructor() {
                this.name = "katana";
            }
        }

        @injectable()
        class Shuriken implements Weapon {
            public name: string;
            public constructor() {
                this.name = "shuriken";
            }
        }

        let kernel = new Kernel();
        kernel.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("japonese");
        kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("chinese");

        let katana = kernel.getNamed<Weapon>("Weapon", "japonese");
        let shuriken = kernel.getNamed<Weapon>("Weapon", "chinese");

        expect(katana.name).eql("katana");
        expect(shuriken.name).eql("shuriken");

    });

    it("Should be able to resolve a ambiguous binding by providing a custom tag", () => {

        interface Weapon {
            name: string;
        }

        @injectable()
        class Katana implements Weapon {
            public name: string;
            public constructor() {
                this.name = "katana";
            }
        }

        @injectable()
        class Shuriken implements Weapon {
            public name: string;
            public constructor() {
                this.name = "shuriken";
            }
        }

        let kernel = new Kernel();
        kernel.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("faction", "samurai");
        kernel.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("faction", "ninja");

        let katana = kernel.getTagged<Weapon>("Weapon", "faction", "samurai");
        let shuriken = kernel.getTagged<Weapon>("Weapon", "faction", "ninja");

        expect(katana.name).eql("katana");
        expect(shuriken.name).eql("shuriken");

    });

    it("Should be able to inject into a super constructor", () => {

        const SYMBOLS = {
            Samurai: Symbol("Samurai"),
            SamuraiMaster: Symbol("SamuraiMaster"),
            SamuraiMaster2: Symbol("SamuraiMaster2"),
            Weapon: Symbol("Weapon")
        };

        interface Weapon {
            name: string;
        }

        interface Warrior {
            weapon: Weapon;
        }

        @injectable()
        class Katana implements Weapon {
            public name: string;
            public constructor() {
                this.name = "katana";
            }
        }

        @injectable()
        class Samurai implements Warrior {

            public weapon: Weapon;

            public constructor(weapon: Weapon) {
                this.weapon = weapon;
            }
        }

        // Important: derived classes constructor must be manually implemented and annotated
        // Therefore the following will fail
        @injectable()
        class SamuraiMaster extends Samurai implements Warrior {
            public isMaster: boolean;
        }

        // However, he following will work
        @injectable()
        class SamuraiMaster2 extends Samurai implements Warrior {
            public isMaster: boolean;
            public constructor(@inject(SYMBOLS.Weapon) weapon: Weapon) {
                super(weapon);
                this.isMaster = true;
            }
        }

        const kernel = new Kernel();
        kernel.bind<Weapon>(SYMBOLS.Weapon).to(Katana);
        kernel.bind<Warrior>(SYMBOLS.Samurai).to(Samurai);
        kernel.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);
        kernel.bind<Warrior>(SYMBOLS.SamuraiMaster2).to(SamuraiMaster2);

        let errorFunction = () => { kernel.get<Warrior>(SYMBOLS.SamuraiMaster); };
        let error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_1 + "SamuraiMaster" + ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_2;
        expect(errorFunction).to.throw(error);

        let samuraiMaster2 = kernel.get<Warrior>(SYMBOLS.SamuraiMaster2);
        expect(samuraiMaster2.weapon.name).eql("katana");
        expect(typeof (<any>samuraiMaster2).isMaster).eql("boolean");

    });

    it("Should support a whenInjectedInto contextual bindings constraint", () => {

        let TYPES = {
            Ninja: "Ninja",
            Weapon: "Weapon"
        };

        interface Weapon {
            name: string;
        }

        @injectable()
        class Katana implements Weapon {
            public name: string;
            public constructor() {
                this.name = "katana";
            }
        }

        @injectable()
        class Bokken implements Weapon {
            public name: string;
            public constructor() {
                this.name = "bokken";
            }
        }

        interface Ninja {
            weapon: Weapon;
        }

        @injectable()
        class NinjaStudent implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") @targetName("weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") @targetName("weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<Weapon>(TYPES.Weapon).to(Katana).whenInjectedInto(NinjaMaster);
        kernel.bind<Weapon>(TYPES.Weapon).to(Bokken).whenInjectedInto(NinjaStudent);

        let master = kernel.getTagged<Ninja>(TYPES.Ninja, "master", true);
        let student = kernel.getTagged<Ninja>(TYPES.Ninja, "master", false);

        expect(master instanceof NinjaMaster).eql(true);
        expect(student instanceof NinjaStudent).eql(true);

        expect(master.weapon.name).eql("katana");
        expect(student.weapon.name).eql("bokken");

    });

    it("Should support a whenParentNamed contextual bindings constraint", () => {

        let TYPES = {
            Material: "Material",
            Ninja: "Ninja",
            Weapon: "Weapon"
        };

        interface Material {
            name: string;
        }

        @injectable()
        class Wood implements Material {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements Material {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface Weapon {
            material: Material;
        }

        @injectable()
        class Sword implements Weapon {
            public material: Material;
            public constructor(@inject("Material") material: Material) {
                this.material = material;
            }
        }

        interface Ninja {
            weapon: Weapon;
        }

        @injectable()
        class NinjaStudent implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") @named("non-lethal") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") @named("lethal") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel.bind<Material>(TYPES.Material).to(Iron).whenParentNamed("lethal");
        kernel.bind<Material>(TYPES.Material).to(Wood).whenParentNamed("non-lethal");

        let master = kernel.getTagged<Ninja>(TYPES.Ninja, "master", true);
        let student = kernel.getTagged<Ninja>(TYPES.Ninja, "master", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

    });

    it("Should support a whenParentTagged contextual bindings constraint", () => {

        let TYPES = {
            Material: "Material",
            Ninja: "Ninja",
            Weapon: "Weapon"
        };

        interface Material {
            name: string;
        }

        @injectable()
        class Wood implements Material {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements Material {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface Weapon {
            material: Material;
        }

        @injectable()
        class Sword implements Weapon {
            public material: Material;
            public constructor(@inject("Material") material: Material) {
                this.material = material;
            }
        }

        interface Ninja {
            weapon: Weapon;
        }

        @injectable()
        class NinjaStudent implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") @tagged("lethal", false) weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") @tagged("lethal", true) weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        let kernel = new Kernel();
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel.bind<Material>(TYPES.Material).to(Iron).whenParentTagged("lethal", true);
        kernel.bind<Material>(TYPES.Material).to(Wood).whenParentTagged("lethal", false);

        let master = kernel.getTagged<Ninja>(TYPES.Ninja, "master", true);
        let student = kernel.getTagged<Ninja>(TYPES.Ninja, "master", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

    });

    it("Should support a whenAnyAncestorIs and whenNoAncestorIs contextual bindings constraint", () => {

        let TYPES = {
            Material: "Material",
            Ninja: "Ninja",
            Weapon: "Weapon"
        };

        interface Material {
            name: string;
        }

        @injectable()
        class Wood implements Material {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements Material {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface Weapon {
            material: Material;
        }

        @injectable()
        class Sword implements Weapon {
            public material: Material;
            public constructor(@inject("Material") material: Material) {
                this.material = material;
            }
        }

        interface Ninja {
            weapon: Weapon;
        }

        @injectable()
        class NinjaStudent implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        // whenAnyAncestorIs
        let kernel = new Kernel();
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel.bind<Material>(TYPES.Material).to(Iron).whenAnyAncestorIs(NinjaMaster);
        kernel.bind<Material>(TYPES.Material).to(Wood).whenAnyAncestorIs(NinjaStudent);

        let master = kernel.getTagged<Ninja>(TYPES.Ninja, "master", true);
        let student = kernel.getTagged<Ninja>(TYPES.Ninja, "master", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

        // whenNoAncestorIs
        let kernel2 = new Kernel();
        kernel2.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel2.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel2.bind<Material>(TYPES.Material).to(Iron).whenNoAncestorIs(NinjaStudent);
        kernel2.bind<Material>(TYPES.Material).to(Wood).whenNoAncestorIs(NinjaMaster);

        let master2 = kernel2.getTagged<Ninja>(TYPES.Ninja, "master", true);
        let student2 = kernel2.getTagged<Ninja>(TYPES.Ninja, "master", false);

        expect(master2.weapon.material.name).eql("iron");
        expect(student2.weapon.material.name).eql("wood");

    });

    it("Should support a whenAnyAncestorNamed and whenNoAncestorNamed contextual bindings constraint", () => {

        let TYPES = {
            Material: "Material",
            Ninja: "Ninja",
            Weapon: "Weapon"
        };

        interface Material {
            name: string;
        }

        @injectable()
        class Wood implements Material {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements Material {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface Weapon {
            material: Material;
        }

        @injectable()
        class Sword implements Weapon {
            public material: Material;
            public constructor(@inject("Material") material: Material) {
                this.material = material;
            }
        }

        interface Ninja {
            weapon: Weapon;
        }

        @injectable()
        class NinjaStudent implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        // whenAnyAncestorNamed
        let kernel = new Kernel();
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetNamed("non-lethal");
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetNamed("lethal");
        kernel.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel.bind<Material>(TYPES.Material).to(Iron).whenAnyAncestorNamed("lethal");
        kernel.bind<Material>(TYPES.Material).to(Wood).whenAnyAncestorNamed("non-lethal");

        let master = kernel.getNamed<Ninja>(TYPES.Ninja, "lethal");
        let student = kernel.getNamed<Ninja>(TYPES.Ninja, "non-lethal");

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

        // whenNoAncestorNamed
        let kernel2 = new Kernel();
        kernel2.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetNamed("non-lethal");
        kernel2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetNamed("lethal");
        kernel2.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel2.bind<Material>(TYPES.Material).to(Iron).whenNoAncestorNamed("non-lethal");
        kernel2.bind<Material>(TYPES.Material).to(Wood).whenNoAncestorNamed("lethal");

        let master2 = kernel.getNamed<Ninja>(TYPES.Ninja, "lethal");
        let student2 = kernel.getNamed<Ninja>(TYPES.Ninja, "non-lethal");

        expect(master2.weapon.material.name).eql("iron");
        expect(student2.weapon.material.name).eql("wood");

    });

    it("Should support a whenAnyAncestorTagged and whenNoAncestorTaggedcontextual bindings constraint", () => {

        let TYPES = {
            Material: "Material",
            Ninja: "Ninja",
            Weapon: "Weapon"
        };

        interface Material {
            name: string;
        }

        @injectable()
        class Wood implements Material {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements Material {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface Weapon {
            material: Material;
        }

        @injectable()
        class Sword implements Weapon {
            public material: Material;
            public constructor(@inject("Material") material: Material) {
                this.material = material;
            }
        }

        interface Ninja {
            weapon: Weapon;
        }

        @injectable()
        class NinjaStudent implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        // whenAnyAncestorTagged
        let kernel = new Kernel();
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged("lethal", false);
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged("lethal", true);
        kernel.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel.bind<Material>(TYPES.Material).to(Iron).whenAnyAncestorTagged("lethal", true);
        kernel.bind<Material>(TYPES.Material).to(Wood).whenAnyAncestorTagged("lethal", false);

        let master = kernel.getTagged<Ninja>(TYPES.Ninja, "lethal", true);
        let student = kernel.getTagged<Ninja>(TYPES.Ninja, "lethal", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

        // whenNoAncestorTagged
        let kernel2 = new Kernel();
        kernel2.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged("lethal", false);
        kernel2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged("lethal", true);
        kernel2.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel2.bind<Material>(TYPES.Material).to(Iron).whenNoAncestorTagged("lethal", false);
        kernel2.bind<Material>(TYPES.Material).to(Wood).whenNoAncestorTagged("lethal", true);

        let master2 = kernel.getTagged<Ninja>(TYPES.Ninja, "lethal", true);
        let student2 = kernel.getTagged<Ninja>(TYPES.Ninja, "lethal", false);

        expect(master2.weapon.material.name).eql("iron");
        expect(student2.weapon.material.name).eql("wood");

    });

    it("Should support a whenAnyAncestorMatches and whenNoAncestorMatches contextual bindings constraint", () => {

        let TYPES = {
            Material: "Material",
            Ninja: "Ninja",
            Weapon: "Weapon"
        };

        interface Material {
            name: string;
        }

        @injectable()
        class Wood implements Material {
            public name: string;
            public constructor() {
                this.name = "wood";
            }
        }

        @injectable()
        class Iron implements Material {
            public name: string;
            public constructor() {
                this.name = "iron";
            }
        }

        interface Weapon {
            material: Material;
        }

        @injectable()
        class Sword implements Weapon {
            public material: Material;
            public constructor(@inject("Material") material: Material) {
                this.material = material;
            }
        }

        interface Ninja {
            weapon: Weapon;
        }

        @injectable()
        class NinjaStudent implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        @injectable()
        class NinjaMaster implements Ninja {

            public weapon: Weapon;

            public constructor(
                @inject("Weapon") weapon: Weapon
            ) {
                this.weapon = weapon;
            }
        }

        // custom constraints
        let anyAncestorIsNinjaMasterConstraint = typeConstraint(NinjaMaster);
        let anyAncestorIsNinjaStudentConstraint = typeConstraint(NinjaStudent);

        // whenAnyAncestorMatches
        let kernel = new Kernel();
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel.bind<Material>(TYPES.Material).to(Iron).whenAnyAncestorMatches(anyAncestorIsNinjaMasterConstraint);
        kernel.bind<Material>(TYPES.Material).to(Wood).whenAnyAncestorMatches(anyAncestorIsNinjaStudentConstraint);

        let master = kernel.getTagged<Ninja>(TYPES.Ninja, "master", true);
        let student = kernel.getTagged<Ninja>(TYPES.Ninja, "master", false);

        expect(master.weapon.material.name).eql("iron");
        expect(student.weapon.material.name).eql("wood");

        // whenNoAncestorMatches
        let kernel2 = new Kernel();
        kernel2.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenTargetTagged("master", false);
        kernel2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenTargetTagged("master", true);
        kernel2.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel2.bind<Material>(TYPES.Material).to(Iron).whenNoAncestorMatches(anyAncestorIsNinjaStudentConstraint);
        kernel2.bind<Material>(TYPES.Material).to(Wood).whenNoAncestorMatches(anyAncestorIsNinjaMasterConstraint);

        let master2 = kernel2.getTagged<Ninja>(TYPES.Ninja, "master", true);
        let student2 = kernel2.getTagged<Ninja>(TYPES.Ninja, "master", false);

        expect(master2.weapon.material.name).eql("iron");
        expect(student2.weapon.material.name).eql("wood");

    });

    it("Should support property setter injection ", () => {

        let kernel = new Kernel();
        let inject = makePropertyInjectDecorator(kernel);

        interface Service {
            count: number;
            increment(): void;
        }

        @injectable()
        class SomeService implements Service {
            public count: number;
            public constructor() {
                this.count = 0;
            }
            public increment() {
                this.count = this.count + 1;
            }
        }

        class SomeWebComponent {
            @inject("Service")
            private _service: Service;
            public doSomething() {
                let count =  this._service.count;
                this._service.increment();
                return count;
            }
        }

        kernel.bind<Service>("Service").to(SomeService);

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

        let TYPES = { Weapon: "Weapon" };

        interface Weapon {
            durability: number;
            use(): void;
        }

        @injectable()
        class Sword implements Weapon {
            public durability: number;
            public constructor() {
                this.durability = 100;
            }
            public use() {
                this.durability = this.durability - 10;
            }
        }

        @injectable()
        class WarHammer implements Weapon {
            public durability: number;
            public constructor() {
                this.durability = 100;
            }
            public use() {
                this.durability = this.durability - 10;
            }
        }

        class Warrior {
            @multiInject(TYPES.Weapon)
            public weapons: Weapon[];
        }

        kernel.bind<Weapon>(TYPES.Weapon).to(Sword);
        kernel.bind<Weapon>(TYPES.Weapon).to(WarHammer);

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

    it("Should allow to use snapshots and property injections with singletons and constant value bindings", () => {

        let kernel = new Kernel();
        let inject = makePropertyInjectDecorator(kernel);

        let TYPES = {
            Warrior: "Warrior",
            Weapon: "Weapon"
        };

        interface Warrior {
            weapon: Weapon;
        }

        interface Weapon {
            durability: number;
            use(): void;
        }

        @injectable()
        class Sword implements Weapon {
            public durability: number;
            public constructor() {
                this.durability = 100;
            }
            public use() {
                this.durability = this.durability - 10;
            }
        }

        @injectable()
        class WarHammer implements Weapon {
            public durability: number;
            public constructor() {
                this.durability = 100;
            }
            public use() {
                this.durability = this.durability - 10;
            }
        }

        @injectable()
        class Ninja implements Warrior {
            @inject(TYPES.Weapon)
            public weapon: Weapon;
        }

        kernel.bind<Warrior>(TYPES.Warrior).to(Ninja);
        kernel.bind<Weapon>(TYPES.Weapon).to(Sword);

        // check property injection works
        let warrior1 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior1.weapon).to.be.instanceof(Sword);
        expect(warrior1.weapon.durability).eql(100);
        warrior1.weapon.use();
        expect(warrior1.weapon.durability).eql(90);

        // check snapshot works
        kernel.snapshot();
        kernel.unbind(TYPES.Weapon);
        kernel.bind<Weapon>(TYPES.Weapon).to(WarHammer);

        expect(warrior1.weapon).to.be.instanceof(Sword);
        expect(warrior1.weapon.durability).eql(90);

        let warrior2 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior2.weapon).to.be.instanceof(WarHammer);
        expect(warrior2.weapon.durability).eql(100);

        // check snapshot resore works
        kernel.restore();
        let warrior3 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior3.weapon).to.be.instanceof(Sword);
        expect(warrior3.weapon.durability).eql(100);

        // check property injection works with singletons
        kernel.unbind(TYPES.Weapon);
        kernel.bind<Weapon>(TYPES.Weapon).to(Sword).inSingletonScope();

        let warrior4 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior4.weapon).to.be.instanceof(Sword);
        expect(warrior4.weapon.durability).eql(100);
        warrior4.weapon.use();
        expect(warrior4.weapon.durability).eql(90);

        let warrior5 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior5.weapon).to.be.instanceof(Sword);
        expect(warrior5.weapon.durability).eql(90);

        // check property injection works with snapshot and singletons
        kernel.snapshot();
        kernel.unbind(TYPES.Weapon);
        kernel.bind<Weapon>(TYPES.Weapon).to(WarHammer).inSingletonScope();

        expect(warrior4.weapon).to.be.instanceof(Sword);
        expect(warrior4.weapon.durability).eql(90);
        expect(warrior5.weapon).to.be.instanceof(Sword);
        expect(warrior5.weapon.durability).eql(90);

        let warrior6 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior6.weapon).to.be.instanceof(WarHammer);
        expect(warrior6.weapon.durability).eql(100);
        warrior6.weapon.use();
        expect(warrior6.weapon.durability).eql(90);

        let warrior7 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior7.weapon).to.be.instanceof(WarHammer);
        expect(warrior7.weapon.durability).eql(90);

        // check property injection works with restore and singletons
        kernel.restore();
        let warrior8 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior8.weapon).to.be.instanceof(Sword);
        expect(warrior8.weapon.durability).eql(100);
        warrior8.weapon.use();
        expect(warrior8.weapon.durability).eql(90);

        let warrior9 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior9.weapon).to.be.instanceof(Sword);
        expect(warrior9.weapon.durability).eql(90);

        // check property injection works with snapshot and constant value bindings
        kernel.snapshot();
        kernel.unbind(TYPES.Weapon);
        kernel.bind<Weapon>(TYPES.Weapon).toConstantValue(new WarHammer());

        let warrior10 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior10.weapon).to.be.instanceof(WarHammer);
        expect(warrior10.weapon.durability).eql(100);
        warrior10.weapon.use();
        expect(warrior10.weapon.durability).eql(90);

        let warrior11 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior11.weapon).to.be.instanceof(WarHammer);
        expect(warrior11.weapon.durability).eql(90);

        // check property injection works with restore value bindings
        kernel.restore();
        let warrior12 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior12.weapon).to.be.instanceof(Sword);
        expect(warrior12.weapon.durability).eql(100);
        warrior12.weapon.use();
        expect(warrior12.weapon.durability).eql(90);

        let warrior13 = kernel.get<Warrior>(TYPES.Warrior);
        expect(warrior13.weapon).to.be.instanceof(Sword);
        expect(warrior13.weapon.durability).eql(90);

    });

    it("Should display a error when injecting into an abstract class", () => {

        interface Weapon {}

        @injectable()
        class Soldier extends Stubs.BaseSoldier {}

        @injectable()
        class Archer extends Stubs.BaseSoldier {}

        @injectable()
        class Knight extends Stubs.BaseSoldier {}

        @injectable()
        class Sword implements Stubs.Weapon {}

        @injectable()
        class Bow implements Stubs.Weapon {}

        @injectable()
        class DefaultWeapon implements Stubs.Weapon {}

        let kernel = new Kernel();

        kernel.bind<Stubs.Weapon>("Weapon").to(DefaultWeapon).whenInjectedInto(Soldier);
        kernel.bind<Stubs.Weapon>("Weapon").to(Sword).whenInjectedInto(Knight);
        kernel.bind<Stubs.Weapon>("Weapon").to(Bow).whenInjectedInto(Archer);
        kernel.bind<Stubs.BaseSoldier>("BaseSoldier").to(Soldier).whenTargetNamed("default");
        kernel.bind<Stubs.BaseSoldier>("BaseSoldier").to(Knight).whenTargetNamed("knight");
        kernel.bind<Stubs.BaseSoldier>("BaseSoldier").to(Archer).whenTargetNamed("archer");

        let throw1 = () => { kernel.getNamed<Stubs.BaseSoldier>("BaseSoldier", "default"); };
        let throw2 = () => { kernel.getNamed<Stubs.BaseSoldier>("BaseSoldier", "knight"); };
        let throw3 = () => { kernel.getNamed<Stubs.BaseSoldier>("BaseSoldier", "archer"); };

        function getError(className: string) {
            return ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_1 + className + ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH_2;
        }

        expect(throw1).to.throw(getError("Soldier"));
        expect(throw2).to.throw(getError("Knight"));
        expect(throw3).to.throw(getError("Archer"));

    });

    it("Should be able to inject a regular derived class", () => {

        const SYMBOLS = {
            RANK: Symbol("RANK"),
            SamuraiMaster: Symbol("SamuraiMaster")
        };

        interface Warrior {
            rank: string;
        }

        @injectable()
        class Samurai implements Warrior {

            public rank: string;

            public constructor(rank: string) {
                this.rank = rank;
            }
        }

        @injectable()
        class SamuraiMaster extends Samurai implements Warrior {
            constructor(@inject(SYMBOLS.RANK) rank: string) {
                super(rank);
            }
        }

        const kernel = new Kernel();
        kernel.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);
        kernel.bind<string>(SYMBOLS.RANK).toConstantValue("Master");

        let samurai = kernel.get<SamuraiMaster>(SYMBOLS.SamuraiMaster);
        expect(samurai.rank).eql("Master");

    });

    it("Should be able to identify missing @injectable in a base class", () => {

        const SYMBOLS = {
            SamuraiMaster: Symbol("SamuraiMaster")
        };

        interface Warrior {
            rank: string;
        }

        // IMPORTANT: Missing @injectable()
        class Samurai implements Warrior {

            public rank: string;

            public constructor(rank: string) {
                this.rank = rank;
            }
        }

        @injectable()
        class SamuraiMaster extends Samurai implements Warrior {
            constructor() {
                super("master");
            }
        }

        const kernel = new Kernel();
        kernel.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);

        function throws() {
            return kernel.get<Warrior>(SYMBOLS.SamuraiMaster);
        }

        expect(throws).to.throw(`${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} Samurai`);

    });

});
