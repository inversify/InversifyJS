import { expect } from "chai";
import { Container, inject, injectable, named } from "../../src/inversify";

describe("Named default", () => {

  it("Should be able to inject a default to avoid ambiguous binding exceptions", () => {

    const TYPES = {
      Warrior: "Warrior",
      Weapon: "Weapon"
    };

    const TAG = {
      chinese: "chinese",
      japanese: "japanese",
      throwable: "throwable"
    };

    interface Weapon {
      name: string;
    }

    interface Warrior {
      name: string;
      weapon: Weapon;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Katana";
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Shuriken";
      }
    }

    @injectable()
    class Samurai implements Warrior {
      public name: string;
      public weapon: Weapon;
      public constructor(
        @inject(TYPES.Weapon) weapon: Weapon
      ) {
        this.name = "Samurai";
        this.weapon = weapon;
      }
    }

    @injectable()
    class Ninja implements Warrior {
      public name: string;
      public weapon: Weapon;
      public constructor(
        @inject(TYPES.Weapon) @named(TAG.throwable) weapon: Weapon
      ) {
        this.name = "Ninja";
        this.weapon = weapon;
      }
    }

    const container = new Container();
    container.bind<Warrior>(TYPES.Warrior).to(Ninja).whenTargetNamed(TAG.chinese);
    container.bind<Warrior>(TYPES.Warrior).to(Samurai).whenTargetNamed(TAG.japanese);
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();

    const ninja = container.getNamed<Warrior>(TYPES.Warrior, TAG.chinese);
    const samurai = container.getNamed<Warrior>(TYPES.Warrior, TAG.japanese);

    expect(ninja.name).to.eql("Ninja");
    expect(ninja.weapon.name).to.eql("Shuriken");
    expect(samurai.name).to.eql("Samurai");
    expect(samurai.weapon.name).to.eql("Katana");

  });

  it("Should be able to select a default to avoid ambiguous binding exceptions", () => {

    const TYPES = {
      Weapon: "Weapon"
    };

    const TAG = {
      throwable: "throwable"
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Katana";
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Shuriken";
      }
    }

    const container = new Container();
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
    container.bind<Weapon>(TYPES.Weapon).to(Katana).inSingletonScope().whenTargetIsDefault();

    const defaultWeapon = container.get<Weapon>(TYPES.Weapon);
    const throwableWeapon = container.getNamed<Weapon>(TYPES.Weapon, TAG.throwable);

    expect(defaultWeapon.name).eql("Katana");
    expect(throwableWeapon.name).eql("Shuriken");

  });

});