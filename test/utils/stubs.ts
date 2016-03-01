import { Inject, Named, Tagged, ParamNames } from "../../src/inversify";

export interface FooInterface {
  name: string;
  greet(): string;
}

export interface BarInterface {
  name: string;
  greet(): string;
}

export interface FooBarInterface {
  foo: FooInterface;
  bar: BarInterface;
  greet(): string;
}

export class Foo implements FooInterface {
  public name: string;
  constructor() {
    this.name = "foo";
  }
  public greet(): string {
    return this.name;
  }
}

export class Bar implements BarInterface {
  public name: string;
  constructor() {
    this.name = "bar";
  }
  public greet(): string {
    return this.name;
  }
}

@Inject("FooInterface", "BarInterface")
export class FooBar implements FooBarInterface {
  public foo: FooInterface;
  public bar: BarInterface;
  constructor(foo: FooInterface, bar: BarInterface) {
    this.foo = foo;
    this.bar = bar;
  }
  public greet(): string{
    return this.foo.greet() + this.bar.greet();
  }
}

// 2.0

export interface IWeapon {}
export interface IKatana extends IWeapon {}
export interface IShuriken extends IWeapon {}

export class Katana implements IKatana {}
export class Shuriken implements IShuriken {}

export class WarriotWithoutInjections {}

@Inject()
export class DecoratedWarriotWithoutInjections {}

@Inject("IKatana","IShuriken")
export class Warrior {
    private _primaryWeapon: IKatana;
    private _secondaryWeapon: IShuriken;

    constructor(
      primary: IKatana,
      secondary: IShuriken) {
        // ...
    }
}

export class InvalidDecoratorUsageWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      primary: IWeapon,
      secondary: IWeapon) {
        // ...
    }
}

export class MissingInjectionWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      primary: IWeapon,
      secondary: IWeapon) {
        // ...
    }
}

@Inject("IKatana","IShuriken")
export class NamedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      @Named("strong") primary: IWeapon,
      @Named("weak") secondary: IWeapon) {
        // ...
    }
}

@Inject("IKatana","IShuriken")
export class TaggedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      @Tagged("power", 5) primary: IWeapon,
      @Tagged("power", 1) secondary: IWeapon) {
        // ...
    }
}
