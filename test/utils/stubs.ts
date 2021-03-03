import { inject, injectable } from '../../src/inversify';

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
	public constructor() {
		this.name = 'foo';
	}
	public greet(): string {
		return this.name;
	}
}

export class Bar implements BarInterface {
	public name: string;
	public constructor() {
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
	public constructor(@inject('FooInterface') foo: FooInterface, @inject('BarInterface') bar: BarInterface) {
		this.foo = foo;
		this.bar = bar;
	}
	public greet(): string {
		return this.foo.greet() + this.bar.greet();
	}
}

// 2.0

export interface Weapon {}
export interface Katana extends Weapon {}
export interface Shuriken extends Weapon {}

export class Katana implements Katana {}
export class Shuriken implements Shuriken {}

export class WarriorWithoutInjections {}

@injectable()
export class DecoratedWarriorWithoutInjections {}
