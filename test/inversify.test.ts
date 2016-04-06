///<reference path="../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import * as ERROR_MSGS from "../src/constants/error_msgs";
import * as Proxy from "harmony-proxy";
import {
    Kernel, injectable, inject, multiInject,
    tagged, named, paramName, decorate
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
                log.push(`Middleware1: ${context.plan.rootRequest.service}`);
                return next(context);
            };
        };

        function middleware2(next: (context: IContext) => any) {
            return (context: IContext) => {
                log.push(`Middleware2: ${context.plan.rootRequest.service}`);
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
        kernel.bind<IHero>(TYPES.IHero).toValue(new Hero());
        let hero = kernel.get<IHero>(TYPES.IHero);

        expect(hero.name).eql(heroName);

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
                @inject("IFactory<IKatana>") katanaFactory: IFactory<IKatana>,
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
                @inject("IFactory<IKatana>") katanaAutoFactory: IFactory<IKatana>,
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

    });

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

    });

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

    it("Should support contextual bindings and paramName annotation", () => {

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
                @inject("IWeapon") @paramName("katana") katana: IWeapon,
                @inject("IWeapon") @paramName("shuriken") shuriken: IWeapon
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

    it("Should be able to inject into a supper constructor", () => {

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

        // Important: notice no anotations required in derived class
        // However, it is recommended to annotate it as well
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

    describe("Contextual bindings contraints", () => {

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
                @inject("IWeapon") @paramName("katana") katana: IWeapon,
                @inject("IWeapon") @paramName("shuriken") shuriken: IWeapon
            ) {
                this.katana = katana;
                this.shuriken = shuriken;
            }
        }

        it("Should support contextual bindings with a type constraint the request target");

        it("Should support contextual bindings with a named constraint the request target");
        it("Should support contextual bindings with a taget constraint the request target");
        it("Should support contextual bindings with a type constraint the request parent");
        it("Should support contextual bindings with a type named the target of the request parent");
        it("Should support contextual bindings with a type tagged the target of the request parent");
        it("Should support contextual bindings with a type constraint to some of its ancestors");
        it("Should support contextual bindings with a type constraint to none of its ancestors");
        it("Should support contextual bindings with a named constraint to some of its ancestors");
        it("Should support contextual bindings with a named constraint to none of its ancestors");
        it("Should support contextual bindings with a tagged constraint to some of its ancestors");
        it("Should support contextual bindings with a tagged constraint to none of its ancestors");
        it("Should support contextual bindings with a custom constraint to some of its ancestors");
        it("Should support contextual bindings with a custom constraint to none of its ancestors");

    });

});
