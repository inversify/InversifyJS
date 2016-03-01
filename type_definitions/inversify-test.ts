/// <reference path="inversify.d.ts" />

import { BindingScope, Binding, Kernel, Inject } from "inversify";

module inversify_external_module_test {

    interface FooInterface {
        name: string;
        greet(): string;
    }

    interface BarInterface {
        name: string;
        greet(): string;
    }

    interface FooBarInterface {
        foo: FooInterface;
        bar: BarInterface;
        greet(): string;
    }

    class Foo implements FooInterface {
        public name: string;
        constructor() {
            this.name = "foo";
        }
        public greet(): string {
            return this.name;
        }
    }

    class Bar implements BarInterface {
        public name: string;
        constructor() {
            this.name = "bar";
        }
        public greet(): string {
            return this.name;
        }
    }

    @Inject("FooInterface", "BarInterface")
    class FooBar implements FooBarInterface {
        public foo: FooInterface;
        public bar: BarInterface;
        constructor(foo: FooInterface, bar: BarInterface) {
            this.foo = foo;
            this.bar = bar;
        }
        public greet(): string {
            return this.foo.greet() + this.bar.greet();
        }
    }

    // Kernel
    let kernel = new Kernel();

    // Identifiers
    let fooRuntimeIdentifier = "FooInterface";
    let barRuntimeIdentifier = "BarInterface";
    let fooBarRuntimeIdentifier = "FooBarInterface";

    // Bindings
    let fooBinding = new Binding<FooInterface>(fooRuntimeIdentifier, Foo);
    let barBinding = new Binding<BarInterface>(barRuntimeIdentifier, Bar);
    let fooBarBinding = new Binding<FooBarInterface>(fooBarRuntimeIdentifier, FooBar, BindingScope.Singleton);

    kernel.bind(fooBinding);
    kernel.bind(barBinding);
    kernel.bind(fooBarBinding);

    // Resolve
    let foo = kernel.get<Foo>(fooRuntimeIdentifier);
    let bar = kernel.get<Bar>(barRuntimeIdentifier);
    let fooBar = kernel.get<FooBar>(fooBarRuntimeIdentifier);

    console.log(foo);
    console.log(bar);
    console.log(fooBar);

    // Unbind
    kernel.unbind(fooRuntimeIdentifier);
    kernel.unbindAll();

}
