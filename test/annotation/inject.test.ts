declare function __decorate(decorators: ClassDecorator[], target: any, key?: any, desc?: any): void;
declare function __param(paramIndex: number, decorator: ParameterDecorator): ClassDecorator;

///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import { decorate } from "../../src/annotation/decorator_utils";
import inject from "../../src/annotation/inject";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

interface IKatana {}
interface IShuriken {}
class Katana implements IKatana {}
class Shuriken implements IShuriken {}

class WarriorWithoutDecorator {

    private _primaryWeapon: IKatana;
    private _secondaryWeapon: IShuriken;

    constructor(
      primary: IKatana,
      secondary: IShuriken
    ) {

          this._primaryWeapon = primary;
          this._secondaryWeapon = secondary;
    }
}

class DecoratedWarrior {

    private _primaryWeapon: IKatana;
    private _secondaryWeapon: IShuriken;

    constructor(
      @inject("IKatana") primary: IKatana,
      @inject("IShuriken") secondary: IShuriken
    ) {

        this._primaryWeapon = primary;
        this._secondaryWeapon = secondary;
    }
}

class InvalidDecoratorUsageWarrior {

    private _primaryWeapon: IKatana;
    private _secondaryWeapon: IShuriken;

    constructor(
      primary: IKatana,
      secondary: IShuriken
    ) {

          this._primaryWeapon = primary;
          this._secondaryWeapon = secondary;
    }

    public test(a: string) { /*...*/ }
}

describe("@inject", () => {

  it("Should not generate metadata for unnamed parameters", () => {
    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, WarriorWithoutDecorator);
    expect(paramsMetadata).to.be.undefined;
  });

  it("Should generate metadata for named parameters", () => {
    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, DecoratedWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: IMetadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m1.value).to.be.eql("IKatana");
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: IMetadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m2.value).to.be.eql("IShuriken");
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;

  });

  it("Should throw when applayed mutiple times", () => {

    let useDecoratorMoreThanOnce = function() {
      __decorate([ __param(0, inject("IKatana")), __param(0, inject("IShurien")) ], InvalidDecoratorUsageWarrior);
    };

    let msg = `${ERROR_MSGS.DUPLICATED_METADATA} ${METADATA_KEY.INJECT_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);

  });

  it("Should throw when not applayed to a constructor", () => {

    let useDecoratorOnMethodThatIsNotAContructor = function() {
      __decorate([ __param(0, inject("IKatana")) ],
      InvalidDecoratorUsageWarrior.prototype,
      "test", Object.getOwnPropertyDescriptor(InvalidDecoratorUsageWarrior.prototype, "test"));
    };

    let msg = `${ERROR_MSGS.INVALID_DECORATOR_OPERATION}`;
    expect(useDecoratorOnMethodThatIsNotAContructor).to.throw(msg);

  });

  it("Should be usable in VanillaJS applications", () => {

    interface IKatana {}
    interface IShurien {}

    let VanillaJSWarrior = (function () {
        function Warrior(primary: IKatana, secondary: IShurien) {
            // ...
        }
        return Warrior;
    })();

    decorate(inject("IKatana"), VanillaJSWarrior, 0);
    decorate(inject("IShurien"), VanillaJSWarrior, 1);

    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: IMetadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m1.value).to.be.eql("IKatana");
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: IMetadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m2.value).to.be.eql("IShurien");
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;

  });

});
