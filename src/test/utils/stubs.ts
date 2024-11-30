import { inject, injectable, named, tagged } from '../../index';

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
    this.name = 'foo';
  }
  public greet(): string {
    return this.name;
  }
}

export class Bar implements BarInterface {
  public name: string;
  constructor() {
    this.name = 'bar';
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
    @inject('FooInterface') foo: FooInterface,
    @inject('BarInterface') bar: BarInterface,
  ) {
    this.foo = foo;
    this.bar = bar;
  }
  public greet(): string {
    return this.foo.greet() + this.bar.greet();
  }
}

export class Katana {}
export class Shuriken {}

export class WarriorWithoutInjections {}

@injectable()
export class DecoratedWarriorWithoutInjections {}

@injectable()
export class Warrior {
  constructor(
    @inject('Katana') _primary: Katana,
    @inject('Shuriken') _secondary: Shuriken,
  ) {}
}

export class InvalidDecoratorUsageWarrior {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_primary: unknown, _secondary: unknown) {}
}

export class MissingInjectionWarrior {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_primary: unknown, _secondary: unknown) {}
}

@injectable()
export class NamedWarrior {
  constructor(
    @inject('Katana') @named('strong') _primary: unknown,
    @inject('Shuriken') @named('weak') _secondary: unknown,
  ) {}
}

@injectable()
export class TaggedWarrior {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    @inject('Katana') @tagged('power', 5) _primary: unknown,
    @inject('Shuriken') @tagged('power', 1) _secondary: unknown,
  ) {}
}
