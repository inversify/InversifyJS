declare function __decorate(decorators: ClassDecorator[], target: any, key?: any, desc?: any): void;
declare function __param(paramIndex: number, decorator: ParameterDecorator): ClassDecorator;

import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { decorate } from "../../src/annotation/decorator_utils";
import { named } from "../../src/annotation/named";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

interface Weapon {}

class NamedWarrior {

    private _primaryWeapon: Weapon;
    private _secondaryWeapon: Weapon;

    constructor(
      @named("more_powerful") primary: Weapon,
      @named("less_powerful") secondary: Weapon) {

        this._primaryWeapon = primary;
        this._secondaryWeapon = secondary;
    }
}

class InvalidDecoratorUsageWarrior {
    private _primaryWeapon: Weapon;
    private _secondaryWeapon: Weapon;

    constructor(
      primary: Weapon,
      secondary: Weapon
    ) {

          this._primaryWeapon = primary;
          this._secondaryWeapon = secondary;
    }

    public test(a: string) { /*...*/ }
}

describe("@named", () => {

  it("Should generate metadata for named parameters", () => {

    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, NamedWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: interfaces.Metadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m1.value).to.be.eql("more_powerful");
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: interfaces.Metadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m2.value).to.be.eql("less_powerful");
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;

  });

  it("Should generate metadata for named properties", () => {

    class Warrior {
      @named("throwwable")
      public weapon: Weapon;
    }

    let metadataKey = METADATA_KEY.TAGGED_PROP;
    let metadata: any = Reflect.getMetadata(metadataKey, Warrior);

    let m1 = metadata.weapon[0];
    expect(m1.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m1.value).to.be.eql("throwwable");
    expect(metadata.weapon[1]).to.be.undefined;

  });

  it("Should throw when applayed mutiple times", () => {

    let useDecoratorMoreThanOnce = function() {
      __decorate([ __param(0, named("a")), __param(0, named("b")) ], InvalidDecoratorUsageWarrior);
    };

    let msg = `${ERROR_MSGS.DUPLICATED_METADATA} ${METADATA_KEY.NAMED_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);

  });

  it("Should throw when not applayed to a constructor", () => {

    let useDecoratorOnMethodThatIsNotAContructor = function() {
      __decorate([ __param(0, named("a")) ],
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
        function NamedVanillaJSWarrior(primary: Katana, secondary: Shurien) {
            // ...
        }
        return NamedVanillaJSWarrior;
    })();

    decorate(named("more_powerful"), VanillaJSWarrior, 0);
    decorate(named("less_powerful"), VanillaJSWarrior, 1);

    let metadataKey = METADATA_KEY.TAGGED;
    let paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an("object");

    // assert metadata for first argument
    expect(paramsMetadata["0"]).to.be.instanceof(Array);
    let m1: interfaces.Metadata = paramsMetadata["0"][0];
    expect(m1.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m1.value).to.be.eql("more_powerful");
    expect(paramsMetadata["0"][1]).to.be.undefined;

    // assert metadata for second argument
    expect(paramsMetadata["1"]).to.be.instanceof(Array);
    let m2: interfaces.Metadata = paramsMetadata["1"][0];
    expect(m2.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(m2.value).to.be.eql("less_powerful");
    expect(paramsMetadata["1"][1]).to.be.undefined;

    // no more metadata should be available
    expect(paramsMetadata["2"]).to.be.undefined;

  });

});
