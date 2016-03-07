import { inject, named, tagged, paramNames } from "../../src/inversify";

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

@inject("FooInterface", "BarInterface")
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

@inject()
export class DecoratedWarriotWithoutInjections {}

@inject("IKatana", "IShuriken")
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

@inject("IKatana", "IShuriken")
export class NamedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      @named("strong") primary: IWeapon,
      @named("weak") secondary: IWeapon) {
        // ...
    }
}

@inject("IKatana", "IShuriken")
export class TaggedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      @tagged("power", 5) primary: IWeapon,
      @tagged("power", 1) secondary: IWeapon) {
        // ...
    }
}
