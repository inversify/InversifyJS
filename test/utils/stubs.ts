import { inject, injectable, named, tagged } from "../../src/inversify";

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

@injectable()
export class FooBar implements FooBarInterface {
  public foo: FooInterface;
  public bar: BarInterface;
  constructor(
      @inject("FooInterface") foo: FooInterface,
      @inject("BarInterface") bar: BarInterface
  ) {
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

@injectable()
export class DecoratedWarriotWithoutInjections {}

@injectable()
export class Warrior {
    private _primaryWeapon: IKatana;
    private _secondaryWeapon: IShuriken;

    constructor(
      @inject("IKatana") primary: IKatana,
      @inject("IShuriken") secondary: IShuriken
    ) {
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

@injectable()
export class NamedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      @inject("IKatana") @named("strong") primary: IWeapon,
      @inject("IShuriken") @named("weak") secondary: IWeapon
    ) {
        // ...
    }
}

@injectable()
export class TaggedWarrior {

    private _primaryWeapon: IWeapon;
    private _secondaryWeapon: IWeapon;

    constructor(
      @inject("IKatana") @tagged("power", 5) primary: IWeapon,
      @inject("IShuriken") @tagged("power", 1) secondary: IWeapon
    ) {
        // ...
    }
}

@injectable()
export abstract class BaseSoldier {
    public weapon: IWeapon;
    public constructor(
        @inject("IWeapon") weapon: IWeapon
    ) {
        this.weapon = weapon;
    }
}
