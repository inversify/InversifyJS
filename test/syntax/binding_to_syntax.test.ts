import { expect } from "chai";
import * as sinon from "sinon";
import { injectable } from "../../src/annotation/injectable";
import { Binding } from "../../src/bindings/binding";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { BindingScopeEnum, BindingTypeEnum } from "../../src/constants/literal_types";
import { interfaces } from "../../src/interfaces/interfaces";
import { BindingToSyntax } from "../../src/syntax/binding_to_syntax";

describe("BindingToSyntax", () => {
    interface Ninja {}

    @injectable()
    class Ninja implements Ninja {}

    const mockBindingWhenOnUnbindRebind = {} as any;
    const mockBindingInWhenOnUnbindRebind = {} as any;
    const mockUnbindRebind = {} as any;

    function bind() {
        const b = new Binding<Ninja>(Ninja, BindingScopeEnum.Transient);
        const mockBindingSyntaxFactory: Pick<interfaces.BindingSyntaxFactory<Ninja>,
        "getBindingWhenOnUnbindRebind"|"getBindingInWhenOnUnbindRebind"|"getUnbindRebind"> = {
            getBindingInWhenOnUnbindRebind: sinon.stub().returns(mockBindingInWhenOnUnbindRebind),
            getBindingWhenOnUnbindRebind: sinon.stub().returns(mockBindingWhenOnUnbindRebind),
            getUnbindRebind: sinon.stub().returns(mockUnbindRebind)
        };
        const bindTo: BindingToSyntax<Ninja> = new BindingToSyntax<Ninja>(b, mockBindingSyntaxFactory as any);
        return {binding: b, bindingToSyntax: bindTo};
    }
    it(`Should be able to configure the type of a binding
 and return BindingWhenOnUnbindRebind or BindingInWhenOnUnbindRebind from the BindingSyntaxFactory`, () => {

        let {binding, bindingToSyntax} = bind();

        expect(binding.type).eql(BindingTypeEnum.Invalid);

        expect(bindingToSyntax.to(Ninja)).equal(mockBindingInWhenOnUnbindRebind);
        expect(binding.type).eql(BindingTypeEnum.Instance);
        expect(binding.implementationType).equal(Ninja);

        ({binding, bindingToSyntax} = bind());
        expect(bindingToSyntax.toSelf()).equal(mockBindingInWhenOnUnbindRebind);
        expect(binding.type).eql(BindingTypeEnum.Instance);
        expect(binding.implementationType).equal(Ninja);

        ({binding, bindingToSyntax} = bind());
        const constantNinja = new Ninja();
        expect(bindingToSyntax.toConstantValue(constantNinja)).equal(mockBindingWhenOnUnbindRebind);
        expect(binding.type).eql(BindingTypeEnum.ConstantValue);
        expect(binding.cache).equal(constantNinja);

        ({binding, bindingToSyntax} = bind());
        const dynamicValue = (context: interfaces.Context) => new Ninja();
        expect(bindingToSyntax.toDynamicValue(dynamicValue)).equal(mockBindingInWhenOnUnbindRebind);
        expect(binding.type).eql(BindingTypeEnum.DynamicValue);
        expect(binding.dynamicValue).equal(dynamicValue);

        ({binding, bindingToSyntax} = bind());
        expect(bindingToSyntax.toConstructor<Ninja>(Ninja)).equal(mockBindingWhenOnUnbindRebind);
        expect(binding.type).eql(BindingTypeEnum.Constructor);
        expect(binding.implementationType).equal(Ninja);

        ({binding, bindingToSyntax} = bind());
        const factory = (context: interfaces.Context) => () => new Ninja();
        expect(bindingToSyntax.toFactory<Ninja>(factory)).equal(mockBindingWhenOnUnbindRebind);
        expect(binding.type).eql(BindingTypeEnum.Factory);
        expect(binding.factory).equal(factory);

        ({binding, bindingToSyntax} = bind());
        const f = () => "test";
        expect(bindingToSyntax.toFunction(f)).equal(mockBindingWhenOnUnbindRebind);
        expect(binding.type).eql(BindingTypeEnum.Function);
        expect(binding.cache === f).eql(true);

        ({binding, bindingToSyntax} = bind());
        expect(bindingToSyntax.toAutoFactory<Ninja>(Ninja)).equal(mockBindingWhenOnUnbindRebind);
        expect(binding.type).eql(BindingTypeEnum.Factory);

        const mockNinja = {};
        let mockGet = sinon.fake.returns(mockNinja);
        const mockContext = {
            container: {
                get: mockGet
            }
        };
        const fromAutoFactory = binding.factory!(mockContext as any)();
        sinon.assert.calledWithExactly(mockGet, Ninja);
        expect(fromAutoFactory).equal(mockNinja);

        ({binding, bindingToSyntax} = bind());
        const provider = (context: interfaces.Context) =>
        () =>
            new Promise<Ninja>((resolve) => {
                resolve(new Ninja());
            });
        expect(bindingToSyntax.toProvider<Ninja>(provider)).equal(mockBindingWhenOnUnbindRebind);
        expect(binding.type).eql(BindingTypeEnum.Provider);
        expect(binding.provider).equal(provider);

        ({binding, bindingToSyntax} = bind());
        const serviceId = "ServiceId";
        expect(bindingToSyntax.toService(serviceId)).equal(mockUnbindRebind);
        const mockService = {};
        mockGet = sinon.fake.returns(mockService);
        mockContext.container.get = mockGet;
        const fromService = binding.dynamicValue!(mockContext as any);
        sinon.assert.calledWithExactly(mockGet, "ServiceId");
        expect(fromService).equal(mockService);
    });

    it("Should prevent invalid function bindings", () => {

        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        const bindingToSyntax = new BindingToSyntax<Ninja>(binding, undefined as any);

        const f = function () {
            bindingToSyntax.toFunction(5);
        };

        expect(f).to.throw(ERROR_MSGS.INVALID_FUNCTION_BINDING);

    });

});
