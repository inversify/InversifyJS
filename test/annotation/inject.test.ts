declare function __decorate(decorators: ClassDecorator[], target: any, key?: any, desc?: any): void;
declare function __param(paramIndex: number, decorator: ParameterDecorator): ClassDecorator;

import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { decorate } from "../../src/annotation/decorator_utils";
import { inject } from "../../src/annotation/inject";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

interface Katana {}
interface Shuriken {}
class Katana implements Katana {}
class Shuriken implements Shuriken {}

class DecoratedWarrior {

    private _primaryWeapon: Katana;
    private _secondaryWeapon: Shuriken;

    constructor(
      @inject("Katana") primary: Katana,
      @inject("Shuriken") secondary: Shuriken
    ) {

        this._primaryWeapon = primary;
        this._secondaryWeapon = secondary;
    }
}

class InvalidDecoratorUsageWarrior {

    private _primaryWeapon: Katana;
    private _secondaryWeapon: Shuriken;

    constructor(
      primary: Katana,
      secondary: Shuriken
    ) {

          this._primaryWeapon = primary;
          this._secondaryWeapon = secondary;
    }

    public test(a: string) { /*...*/ }
}

describe("@inject", () => {

  it("Should generate metadata for named parameters", () => {
    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, DecoratedWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: interfaces.Metadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m1.value).to.be.eql("Katana");
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: interfaces.Metadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m2.value).to.be.eql("Shuriken");
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;

  });

  it("Should throw when applayed mutiple times", () => {

    let useDecoratorMoreThanOnce = function() {
      __decorate([ __param(0, inject("Katana")), __param(0, inject("Shurien")) ], InvalidDecoratorUsageWarrior);
    };

    let msg = `${ERROR_MSGS.DUPLICATED_METADATA} ${METADATA_KEY.INJECT_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);

  });

  it("Should throw when not applayed to a constructor", () => {

    let useDecoratorOnMethodThatIsNotAContructor = function() {
      __decorate([ __param(0, inject("Katana")) ],
      InvalidDecoratorUsageWarrior.prototype,
      "test", Object.getOwnPropertyDescriptor(InvalidDecoratorUsageWarrior.prototype, "test"));
    };

    let msg = `${ERROR_MSGS.INVALID_DECORATOR_OPERATION}`;
    expect(useDecoratorOnMethodThatIsNotAContructor).to.throw(msg);

  });

  it("Should be usable in VanillaJS applications", () => {

    interface Katana {}
    interface Shurien {}

    let VanillaJSWarrior = (function () {
        function Warrior(primary: Katana, secondary: Shurien) {
            // ...
        }
        return Warrior;
    })();

    decorate(inject("Katana"), VanillaJSWarrior, 0);
    decorate(inject("Shurien"), VanillaJSWarrior, 1);

    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: interfaces.Metadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m1.value).to.be.eql("Katana");
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: interfaces.Metadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m2.value).to.be.eql("Shurien");
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;

  });

});
