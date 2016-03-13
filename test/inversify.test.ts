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
      kernel.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();

      let ninja = kernel.get<INinja>("INinja");

      expect(ninja.fight()).eql("cut!");
      expect(ninja.sneak()).eql("hit!");

  });

  it("Should should support Kernel modules");
  it("Should should support controll over the scope of the dependencies");
  it("Should should support the injection of constant values");
  it("Should should support the injection of class constructors");
  it("Should should support the injection of user defined factories");
  it("Should should support the injection of auto factories");
  it("Should should support the injection of providers");
  it("Should should support the injection of proxied objects");
  it("Should should support the injection of multiple values");
  it("Should should support tagged bindings");
  it("Should should support custom tag decorators");
  it("Should should support named bindings");
  it("Should should support contextual bindings and paramNames annotations");
  it("Should should throw if circular dependencies found");

});
