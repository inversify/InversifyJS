///<reference path="../typings/browser.d.ts" />

import { expect } from "chai";
import { Kernel, inject } from "../src/inversify";

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
          throw();
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

      @inject("IKatana", "IShuriken")
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

    it("Should should support Kernel modules", () => {

        interface INinja {
            fight(): string;
            sneak(): string;
        }

        interface IKatana {
            hit(): string;
        }

        interface IShuriken {
            throw();
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

        @inject("IKatana", "IShuriken")
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

        let someModule: IKernelModule = (kernel: IKernel) => {
            kernel.bind<INinja>("INinja").to(Ninja);
            kernel.bind<IKatana>("IKatana").to(Katana);
            kernel.bind<IShuriken>("IShuriken").to(Shuriken);
        };

        let kernel = new Kernel({ modules: [ someModule ] });
        let ninja = kernel.get<INinja>("INinja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

    });

    it("Should should support controll over the scope of the dependencies", () => {

        interface INinja {
            fight(): string;
            sneak(): string;
        }

        interface IKatana {
            hit(): string;
        }

        interface IShuriken {
            throw();
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

        @inject("IKatana", "IShuriken")
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

    it("Should should support the injection of constant values", () => {

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

    it("Should should support the injection of class constructors", () => {

      interface INinja {
          fight(): string;
          sneak(): string;
      }

      interface IKatana {
          hit(): string;
      }

      interface IShuriken {
          throw();
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

      @inject("IKatana", "IShuriken")
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

    it("Should should support the injection of user defined factories", () => {

        interface INinja {
            fight(): string;
            sneak(): string;
        }

        interface IKatana {
            hit(): string;
        }

        interface IShuriken {
            throw();
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

        @inject("IKatana", "IShuriken")
        class Ninja implements INinja {

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
        kernel.bind<INinja>("INinja").to(Ninja);
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

    it("Should should support the injection of auto factories", () => {

        interface INinja {
            fight(): string;
            sneak(): string;
        }

        interface IKatana {
            hit(): string;
        }

        interface IShuriken {
            throw();
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

        @inject("IKatana", "IShuriken")
        class Ninja implements INinja {

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
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.bind<IShuriken>("IShuriken").to(Shuriken);
        kernel.bind<IKatana>("IKatana").to(Katana);
        kernel.bind<IFactory<IKatana>>("IFactory<IKatana>").toAutoFactory<IKatana>();

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

    });

    it("Should should support the injection of providers", (done) => {

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

        @inject("IKatana", "IShuriken")
        class Ninja implements INinja {

            public katana: IKatana;
            public katanaProvider: IProvider<IKatana>;

            public constructor(katanaProvider: IProvider<IKatana>) {
                this.katanaProvider = katanaProvider;
                this.katana = null;
            }

        }

        let kernel = new Kernel();
        kernel.bind<INinja>("INinja").to(Ninja);
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

    it("Should should support the injection of proxied objects");
    it("Should should support the injection of multiple values");
    it("Should should support tagged bindings");
    it("Should should support custom tag decorators");
    it("Should should support named bindings");
    it("Should should support contextual bindings and paramNames annotations");
    it("Should should throw if circular dependencies found");

});
