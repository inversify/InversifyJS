declare function __decorate(decorators: ClassDecorator[], target: any, key?: any, desc?: any): void;
declare function __param(paramIndex: number, decorator: ParameterDecorator): ClassDecorator;

///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import { decorate } from "../../src/annotation/decorator_utils";
import Tagged from "../../src/annotation/tagged";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as ERRORS_MSGS from "../../src/constants/error_msgs";

interface IWeapon {}
class Katana implements IWeapon {}
class Shuriken implements IWeapon {}

class UnTaggedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      primary: IWeapon,
      secondary: IWeapon) {

        this._primaryWeapon = primary;
        this._secondaryWeapon = secondary;
    }
}

class TaggedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      @Tagged("power", 1) primary: IWeapon,
      @Tagged("power", 2) secondary: IWeapon) {

          this._primaryWeapon = primary;
        this._secondaryWeapon = secondary;
    }
}

class DoubleTaggedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      @Tagged("power", 1) @Tagged("distance", 1) primary: IWeapon,
      @Tagged("power", 2) @Tagged("distance", 5) secondary: IWeapon) {

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

describe("@Tagged", () => {

  it("Should not generate metadata for untagged parameters", () => {
    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, UnTaggedWarrior);
    expect(paramsMetadata).to.be.undefined;
  });

  it("Should generate metadata for tagged parameters", () => {

    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, TaggedWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: IMetadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql("power");
    expect(m1.value).to.be.eql(1);

    // argumnet at index 0 should only have one tag
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: IMetadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql("power");
    expect(m2.value).to.be.eql(2);

    // argumnet at index 1 should only have one tag
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;
  });

  it("Should generate metadata for parameters tagged mutiple times", () => {
    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, DoubleTaggedWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for argument at index 0
    expect(paramsMetadata["0"]).to.be.instanceof(Array);

    // assert argument at index 0 first tag
    let m11: IMetadata = paramsMetadata["0"][0];
    expect(m11.key).to.be.eql("distance");
    expect(m11.value).to.be.eql(1);

    // assert argument at index 0 second tag
    let m12: IMetadata = paramsMetadata["0"][1];
    expect(m12.key).to.be.eql("power");
    expect(m12.value).to.be.eql(1);

    // assert metadata for argument at index 1
    expect(paramsMetadata["1"]).to.be.instanceof(Array);

    // assert argument at index 1 first tag
    let m21: IMetadata = paramsMetadata["1"][0];
    expect(m21.key).to.be.eql("distance");
    expect(m21.value).to.be.eql(5);

    // assert argument at index 1 second tag
    let m22: IMetadata = paramsMetadata["1"][1];
    expect(m22.key).to.be.eql("power");
    expect(m22.value).to.be.eql(2);

    // no more metadata (argument at index > 1)
    expect(paramsMetadata["2"]).to.be.undefined;

  });

  it("Should throw when applied mutiple times", () => {

    let metadataKey = "a";

    let useDecoratorMoreThanOnce = function() {
      __decorate([ __param(0, Tagged(metadataKey, 1)), __param(0, Tagged(metadataKey, 2)) ], InvalidDecoratorUsageWarrior);
    };

    let msg = `${ERRORS_MSGS.DUPLICATED_METADATA} ${metadataKey}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);

  });

  it("Should throw when not applied to a constructor", () => {

    let useDecoratorOnMethodThatIsNotAContructor = function() {
      __decorate([ __param(0, Tagged("a", 1)) ],
      InvalidDecoratorUsageWarrior.prototype,
      "test", Object.getOwnPropertyDescriptor(InvalidDecoratorUsageWarrior.prototype, "test"));
    };

    let msg = ERRORS_MSGS.INVALID_DECORATOR_OPERATION;
    expect(useDecoratorOnMethodThatIsNotAContructor).to.throw(msg);

  });

  it("Should be usable in VanillaJS applications", () => {

    interface IKatana {}
    interface IShurien {}

    let VanillaJSWarrior = (function () {
        function TaggedVanillaJSWarrior(primary: IKatana, secondary: IShurien) {
            // ...
        }
        return TaggedVanillaJSWarrior;
    })();

    decorate(Tagged("power", 1), VanillaJSWarrior, 0);
    decorate(Tagged("power", 2), VanillaJSWarrior, 1);

    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: IMetadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql("power");
    expect(m1.value).to.be.eql(1);

    // argumnet at index 0 should only have one tag
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: IMetadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql("power");
    expect(m2.value).to.be.eql(2);

    // argumnet at index 1 should only have one tag
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;

  });

});
