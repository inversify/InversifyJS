///<reference path="../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import { Kernel, injectable, tagged, named, paramNames } from "../src/inversify";
import * as ERROR_MSGS from "../src/constants/error_msgs";
import * as Proxy from "harmony-proxy";

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

      class Katana implements IKatana {
          public hit() {
              return "cut!";
          }
      }

      class Shuriken implements IShuriken {
          public throw() {
              return "hit!";
          }
      }

      @injectable("IKatana", "IShuriken")
      class Ninja implements INinja {

          private _katana: IKatana;
          private _shuriken: IShuriken;

          public constructor(katana: IKatana, shuriken: IShuriken) {
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

     it("Should support middleware", () => {

        interface INinja {}
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

        class Katana implements IKatana {
            public hit() {
                return "cut!";
            }
        }

        class Shuriken implements IShuriken {
            public throw() {
                return "hit!";
            }
        }

        @injectable("IKatana", "IShuriken")
        class Ninja implements INinja {

            private _katana: IKatana;
            private _shuriken: IShuriken;

            public constructor(katana: IKatana, shuriken: IShuriken) {
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

        @injectable("IKatana", "IShuriken")
        class Ninja implements INinja {

            private _katana: IKatana;
            private _shuriken: IShuriken;

            public constructor(katana: IKatana, shuriken: IShuriken) {
                this._katana = katana;
                this._shuriken = shuriken;
            }

            public fight() { return this._katana.hit(); };
            public sneak() { return this._shuriken.throw(); };

        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.bind<IKatana>("IKatana").to(Katana).inSingletonScope();
        kernel.bind<IShuriken>("IShuriken").to(Shuriken).inTransientScope();

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

        class Hero implements IHero {
            public name: string;
            public constructor() {
                this.name = heroName;
            }
        }

        const kernel = new Kernel();
        kernel.bind(TYPES.IHero).toValue(new Hero());
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

      class Katana implements IKatana {
          public hit() {
              return "cut!";
          }
      }

      class Shuriken implements IShuriken {
          public throw() {
              return "hit!";
          }
      }

      @injectable("IKatana", "IShuriken")
      class Ninja implements INinja {

          private _katana: IKatana;
          private _shuriken: IShuriken;

          public constructor(katana: INewable<IKatana>, shuriken: IShuriken) {
              this._katana = new Katana();
              this._shuriken = shuriken;
          }

          public fight() { return this._katana.hit(); };
          public sneak() { return this._shuriken.throw(); };

      }

      let kernel = new Kernel();
      kernel.bind<INinja>("INinja").to(Ninja);
      kernel.bind<IKatana>("IKatana").to(Katana);
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

        class Katana implements IKatana {
            public hit() {
                return "cut!";
            }
        }

        class Shuriken implements IShuriken {
            public throw() {
                return "hit!";
            }
        }

        @injectable("IFactory<IKatana>", "IShuriken")
        class NinjaWithUserDefinedFactory implements INinja {

            private _katana: IKatana;
            private _shuriken: IShuriken;

            public constructor(katanaFactory: IFactory<IKatana>, shuriken: IShuriken) {
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

        class Katana implements IKatana {
            public hit() {
                return "cut!";
            }
        }

        class Shuriken implements IShuriken {
            public throw() {
                return "hit!";
            }
        }

        @injectable("IFactory<IKatana>", "IShuriken")
        class NinjaWithAutoFactory implements INinja {

            private _katana: IKatana;
            private _shuriken: IShuriken;

            public constructor(katanaAutoFactory: IFactory<IKatana>, shuriken: IShuriken) {
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
        kernel.bind<IFactory<IKatana>>("IFactory<IKatana>").toAutoFactory<IKatana>();

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

        class Katana implements IKatana {
            public hit() {
                return "cut!";
            }
        }

        @injectable("IProvider<IKatana>")
        class NinjaWithProvider implements INinja {

            public katana: IKatana;
            public katanaProvider: IProvider<IKatana>;

            public constructor(katanaProvider: IProvider<IKatana>) {
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

        class Katana implements IKatana {
            public use() {
                return "Used Katana!";
            }
        }

        interface INinja {
            katana: IKatana;
        }

        @injectable("IKatana")
        class Ninja implements INinja {
            public katana: IKatana;
            public constructor(katana: IKatana) {
                this.katana = katana;
            }
        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);
        let log: string[] = [];

        kernel.bind<IKatana>("IKatana").to(Katana).onActivation((katana) => {
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

        class Katana implements IWeapon {
            public name = "Katana";
        }

        class Shuriken implements IWeapon {
            public name = "Shuriken";
        }

        interface INinja {
            katana: IWeapon;
            shuriken: IWeapon;
        }

        @injectable("IWeapon[]")
        class Ninja implements INinja {
            public katana: IWeapon;
            public shuriken: IWeapon;
            public constructor(weapons: IWeapon[]) {
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

    it("Should support tagged bindings", () => {

        interface IWeapon {}
        class Katana implements IWeapon { }
        class Shuriken implements IWeapon {}

        interface INinja {
            katana: IWeapon;
            shuriken: IWeapon;
        }

        @injectable("IWeapon", "IWeapon")
        class Ninja implements INinja {
            public katana: IWeapon;
            public shuriken: IWeapon;
            public constructor(
                @tagged("canThrow", false) katana: IWeapon,
                @tagged("canThrow", true) shuriken: IWeapon
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
        class Katana implements IWeapon { }
        class Shuriken implements IWeapon {}

        interface INinja {
            katana: IWeapon;
            shuriken: IWeapon;
        }

        let throwable = tagged("canThrow", true);
        let notThrowable = tagged("canThrow", false);

        @injectable("IWeapon", "IWeapon")
        class Ninja implements INinja {
            public katana: IWeapon;
            public shuriken: IWeapon;
            public constructor(
                @notThrowable katana: IWeapon,
                @throwable shuriken: IWeapon
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
        class Katana implements IWeapon { }
        class Shuriken implements IWeapon {}

        interface INinja {
            katana: IWeapon;
            shuriken: IWeapon;
        }

        @injectable("IWeapon", "IWeapon")
        class Ninja implements INinja {
            public katana: IWeapon;
            public shuriken: IWeapon;
            public constructor(
                @named("strong")katana: IWeapon,
                @named("weak") shuriken: IWeapon
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

    it("Should support contextual bindings and paramNames annotations", () => {

        interface IWeapon {}
        class Katana implements IWeapon { }
        class Shuriken implements IWeapon {}

        interface INinja {
            katana: IWeapon;
            shuriken: IWeapon;
        }

        @injectable("IWeapon", "IWeapon")
        @paramNames("katana", "shuriken")
        class Ninja implements INinja {
            public katana: IWeapon;
            public shuriken: IWeapon;
            public constructor(
                katana: IWeapon,
                shuriken: IWeapon
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

        @injectable("IB", "IC")
        class A implements IA {
            public b: IB;
            public c: IC;
            public constructor(b: IB, c: IC) {
                this.b = b;
                this.c = c;
            }
        }

        class B implements IB {}

        @injectable("ID")
        class C implements IC {
            public d: ID;
            public constructor(d: ID) {
                this.d = d;
            }
        }

        @injectable("IA")
        class D implements ID {
            public a: IA;
            public constructor(a: IA) {
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

});
