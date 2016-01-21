export interface FooInterface {
  name : string;
  greet() : string;
}

export interface BarInterface {
  name : string;
  greet() : string;
}

export interface FooBarInterface {
  foo : FooInterface;
  bar : BarInterface;
  greet() : string;
}

export class Foo implements FooInterface {
  public name : string;
  constructor() {
    this.name = "foo";
  }
  public greet() : string {
    return this.name;
  }
}

export class Bar implements BarInterface {
  public name : string;
  constructor() {
    this.name = "bar";
  }
  public greet() : string {
    return this.name;
  }
}

export class FooBar implements FooBarInterface {
  public foo : FooInterface;
  public bar : BarInterface;
  constructor(FooInterface : FooInterface, BarInterface : BarInterface) {
    this.foo = FooInterface;
    this.bar = BarInterface;
  }
  public greet() : string{
    return this.foo.greet() + this.bar.greet();
  }
}
