declare function __decorate(decorators: ClassDecorator[], target: any, key?: any, desc?: any): void;
declare function __param(paramIndex: number, decorator: ParameterDecorator): ClassDecorator;

import { expect } from "chai";
import { decorate } from "../../src/annotation/decorator_utils";
import { inject } from "../../src/annotation/inject";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import { interfaces } from "../../src/interfaces/interfaces";

interface Katana {}
interface Shuriken {}
class Katana implements Katana {}
class Shuriken implements Shuriken {}

class DecoratedWarrior {

    private _primaryWeapon: Katana;
    private _secondaryWeapon: Shuriken;

    public constructor(
      @inject("Katana") primary: Katana,
      @inject("Shuriken") secondary: Shuriken
    ) {

        this._primaryWeapon = primary;
        this._secondaryWeapon = secondary;
    }

    public debug() {
      return {
        primaryWeapon: this._primaryWeapon,
        secondaryWeapon: this._secondaryWeapon
      };
    }

}

class InvalidDecoratorUsageWarrior {

    private _primaryWeapon: Katana;
    private _secondaryWeapon: Shuriken;

    public constructor(
      primary: Katana,
      secondary: Shuriken
    ) {

          this._primaryWeapon = primary;
          this._secondaryWeapon = secondary;
    }

    public test(a: string) { /*...*/ }

    public debug() {
      return {
        primaryWeapon: this._primaryWeapon,
        secondaryWeapon: this._secondaryWeapon
      };
    }

}

describe("@inject", () => {

  it("Should generate metadata for named parameters", () => {

    const metadataKey = METADATA_KEY.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, DecoratedWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    const m1: interfaces.Metadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m1.value).to.be.eql("Katana");
    expect(paramsMetadata["0"][1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    const m2: interfaces.Metadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m2.value).to.be.eql("Shuriken");
    expect(paramsMetadata["1"][1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.eq(undefined);

  });

  it("Should throw when applied multiple times", () => {

    const useDecoratorMoreThanOnce = function() {
      __decorate([ __param(0, inject("Katana")), __param(0, inject("Shurien")) ], InvalidDecoratorUsageWarrior);
    };

    const msg = `${ERROR_MSGS.DUPLICATED_METADATA} ${METADATA_KEY.INJECT_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);

  });

  it("Should throw when not applayed to a constructor", () => {

    const useDecoratorOnMethodThatIsNotAConstructor = function() {
      __decorate([ __param(0, inject("Katana")) ],
                 InvalidDecoratorUsageWarrior.prototype,
                 "test", Object.getOwnPropertyDescriptor(InvalidDecoratorUsageWarrior.prototype, "test"));
    };

    const msg = `${ERROR_MSGS.INVALID_DECORATOR_OPERATION}`;
    expect(useDecoratorOnMethodThatIsNotAConstructor).to.throw(msg);

  });

  it("Should be usable in VanillaJS applications", () => {

    interface Shurien {}

    const VanillaJSWarrior = (function () {
        function Warrior(primary: Katana, secondary: Shurien) {
            // ...
        }
        return Warrior;
    })();

    decorate(inject("Katana"), VanillaJSWarrior, 0);
    decorate(inject("Shurien"), VanillaJSWarrior, 1);

    const metadataKey = METADATA_KEY.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    const m1: interfaces.Metadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m1.value).to.be.eql("Katana");
    expect(paramsMetadata["0"][1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    const m2: interfaces.Metadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql(METADATA_KEY.INJECT_TAG);
    expect(m2.value).to.be.eql("Shurien");
    expect(paramsMetadata["1"][1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.eq(undefined);

  });

});
