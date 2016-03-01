declare function __decorate(decorators, target, key?, desc?);
declare function __param(paramIndex, decorator);

///<reference path="../../typings/browser.d.ts" />

import { expect } from "chai";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import { decorate } from "../../src/activation/decorator_utils";
import { Named } from "../../src/activation/named";

interface IWeapon {}
class Katana implements IWeapon {}
class Shuriken implements IWeapon {}

class UnNamedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      primary: IWeapon,
      secondary: IWeapon) {

          this._primaryWeapon = primary;
          this._secondaryWeapon = secondary;
    }
}

class NamedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      @Named("more_powerful") primary: IWeapon,
      @Named("less_powerful") secondary: IWeapon) {

        this._primaryWeapon = primary;
        this._secondaryWeapon = secondary;
    }
}

class InvalidDecoratorUsageWarrior {
    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      primary: IWeapon,
      secondary: IWeapon) {

          this._primaryWeapon = primary;
          this._secondaryWeapon = secondary;
    }

    public test(a: string) { /*...*/ }
}

describe("@Named", () => {

  it("Should not generate metadata for unnamed parameters", () => {
    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, UnNamedWarrior);
    expect(paramsMetadata).to.be.undefined;
  });

  it("Should generate metadata for named parameters", () => {
    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, NamedWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: IMetadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql("named");
    expect(m1.value).to.be.eql("more_powerful");
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: IMetadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql("named");
    expect(m2.value).to.be.eql("less_powerful");
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;
  });

  it("Should throw when applayed mutiple times", () => {

    let useDecoratorMoreThanOnce = function() {
      __decorate([ __param(0, Named("a")), __param(0, Named("b")) ], InvalidDecoratorUsageWarrior);
    };

    let msg = "Metadadata key named was used more than once in a parameter.";
    expect(useDecoratorMoreThanOnce).to.throw(msg);
  });

  it("Should throw when not applayed to a constructor", () => {

    let useDecoratorOnMethodThatIsNotAContructor = function() {
      __decorate([ __param(0, Named("a")) ],
      InvalidDecoratorUsageWarrior.prototype,
      "test", Object.getOwnPropertyDescriptor(InvalidDecoratorUsageWarrior.prototype, "test"));
    };

    let msg = "The @tagged and @named decorator must be applied to the parameters of a constructor.";
    expect(useDecoratorOnMethodThatIsNotAContructor).to.throw(msg);
  });

  it("Should be usable in VanillaJS applications", () => {

    let VanillaJSWarrior = (function () {
        function NamedVanillaJSWarrior(primary, secondary) {
            // ...
        }
        return NamedVanillaJSWarrior;
    })();

    decorate(Named("more_powerful"), VanillaJSWarrior, 0);
    decorate(Named("less_powerful"), VanillaJSWarrior, 1);

    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: IMetadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql("named");
    expect(m1.value).to.be.eql("more_powerful");
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: IMetadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql("named");
    expect(m2.value).to.be.eql("less_powerful");
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;

  });

});
