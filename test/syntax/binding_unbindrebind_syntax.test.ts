import { expect } from "chai";
import * as sinon from "sinon";
import { Binding } from "../../src/bindings/binding";
import { Lookup } from "../../src/container/lookup";
import { interfaces } from "../../src/interfaces/interfaces";
import { BindingTypeEnum, Container, injectable } from "../../src/inversify";
import { getBindingDictionary } from "../../src/planning/planner";
import { BindingUnbindRebindSyntax } from "../../src/syntax/binding_unbindrebind_syntax";

describe("BindingUnbindRebindSyntax", () => {
    it("should call the unbind argument to unbind", () => {
        const bindingDictionary: interfaces.Lookup<interfaces.Binding<any>> = new Lookup<interfaces.Binding<any>>();
        const serviceIdentifier = "Sid";
        const binding: Binding<any> = new Binding(serviceIdentifier, "Request");
        const removeBinding: Binding<any> = new Binding(serviceIdentifier, "Request");
        bindingDictionary.add(serviceIdentifier, binding);
        bindingDictionary.add(serviceIdentifier, removeBinding);
        const unbind = sinon.expectation.create().once();
        const unbindRebind = new BindingUnbindRebindSyntax(removeBinding, unbind, null as any);
        unbindRebind.unbind();
        unbind.verify();
    });
    describe("Integration", () => {
        describe("unbind", () => {
            function expectContainerHasNoBindings(container: interfaces.Container) {
                let numBindings = 0;
                getBindingDictionary(container).traverse((sid, bindings) => {
                    numBindings += bindings.length;
                });
                expect(numBindings).eqls(0);
            }
            describe("BindingInWhenOnUnbindRebindSyntax", () => {
                it("Should be available after to()", () => {
                    class Ninja {}
                    @injectable()
                    class Samurai {}
                    const container = new Container();
                    container.bind("Warrior").to(Samurai);
                    const unbindNinja = container.bind("Warrior").to(Ninja);
                    let warriorBindings = getBindingDictionary(container).get("Warrior");
                    expect(warriorBindings.length).eqls(2);
                    unbindNinja.unbind();
                    warriorBindings = getBindingDictionary(container).get("Warrior");
                    expect(warriorBindings.length).eqls(1);
                    expect(container.get("Warrior")).instanceOf(Samurai);
                });
                it("Should be available after toSelf()", () => {
                    class Ninja {}
                    const container = new Container();
                    container.bind(Ninja).toSelf().unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after toDynamicValue()", () => {
                    const container = new Container();
                    container.bind("sid").toDynamicValue((c) => 1).unbind();
                    expectContainerHasNoBindings(container);
                });
            });
            describe("BindingWhenOnUnbindRebindSyntax", () => {
                it("should be available after toConstantValue()", () => {
                    const container = new Container();
                    container.bind("ConstantValue").toConstantValue(1).unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after toConstructor()", () => {
                    class Ninja {}
                    const container = new Container();
                    container.bind(Ninja).toConstructor(Ninja).unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after toFactory()", () => {
                    const container = new Container();
                    container.bind("Factory").toFactory((c) => {
                        return () => 1;
                    }).unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after toFunction()", () => {
                    const container = new Container();
                    container.bind("Function").toFunction(() => 1).unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after toAutoFactory()", () => {
                    const container = new Container();
                    container.bind("AutoFactory").toAutoFactory("Thing").unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after toProvider()", () => {
                    const container = new Container();
                    container.bind("Provider").toProvider((c) => {
                        return () => Promise.resolve(1);
                    }).unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after toService()", () => {
                    const container = new Container();
                    container.bind("Service").toService("some_service").unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after inSingletonScope", () => {
                    class Ninja {}
                    const container = new Container();
                    container.bind(Ninja).toSelf().inSingletonScope().unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after inTransientScope", () => {
                    class Ninja {}
                    const container = new Container();
                    container.bind(Ninja).toSelf().inTransientScope().unbind();
                    expectContainerHasNoBindings(container);
                });
                it("Should be available after inRequestScope", () => {
                    class Ninja {}
                    const container = new Container();
                    container.bind(Ninja).toSelf().inRequestScope().unbind();
                    expectContainerHasNoBindings(container);
                });
            });
            describe("BindingWhenUnbindRebindSyntax", () => {
                it("Should be available after OnActivation", () => {
                    const container = new Container();
                    container.bind("sid").toConstantValue(1).onActivation((c, i) => i).unbind();
                    expectContainerHasNoBindings(container);
                });
            });
            describe("BindingOnUnbindRebindSyntax ", () => {
                it("Should be available after when", () => {
                    const container = new Container();
                    container.bind("C").toConstantValue(1).when((c) => true).unbind();
                    expectContainerHasNoBindings(container);
                });
            });
        });
        describe("rebind", () => {
            it(`Should remove the binding and rebind with the same service identifier,
            leaving alone other bindings with the same service identifier`, () => {
                const container = new Container();
                const sid = Symbol.for("Sid");
                container.bind(sid).toConstantValue("Remains").whenTargetNamed("Remain");
                const unbindRebind = container.bind(sid).toConstantValue(1).whenTargetNamed("Match1");
                let bindings = getBindingDictionary(container).get(sid);
                const remainBinding = bindings[0];
                const removeBinding = bindings[1];

                const func = () => 1;
                unbindRebind.rebind().toFunction(func).whenTargetNamed("Match2");

                bindings = getBindingDictionary(container).get(sid);
                expect(bindings[0]).equal(remainBinding);
                const newBinding = bindings[1];
                expect(newBinding).not.equal(removeBinding);

                expect(newBinding.serviceIdentifier).equal(sid);
                expect(newBinding.type).eql(BindingTypeEnum.Function);
                expect(newBinding.cache).eql(func);
                expect(newBinding.constraint.metaData!.value).eqls("Match2");
            });
            it("should enable retyping T", () => {
                class Ninja {}
                @injectable()
                class Samurai {}
                const container = new Container();
                const sid = Symbol.for("Sid");
                const unbindRebind = container.bind<Ninja>(sid).toConstantValue(new Ninja());
                unbindRebind.rebind<Samurai>().toConstantValue(new Samurai());
                expect(container.get(sid)).instanceOf(Samurai);
            });
        });
    });
});
