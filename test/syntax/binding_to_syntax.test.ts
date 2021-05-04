import { expect } from "chai";
import { injectable } from "../../src/annotation/injectable";
import { Binding } from "../../src/bindings/binding";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import { interfaces } from "../../src/interfaces/interfaces";
import { BindingToSyntax } from "../../src/syntax/binding_to_syntax";
import * as sinon from 'sinon';
import { BindingInWhenOnSyntax } from "../../src/syntax/binding_in_when_on_syntax";

describe("BindingToSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        const bindingToSyntax = new BindingToSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        const _bindingToSyntax: any = bindingToSyntax;

        expect(_bindingToSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

    });

    it("Should set up the value providers", () => {
        @injectable()
        class Ninja {}
        const irrelevant = Ninja as any;

        const constantValueProvider:interfaces.ConstantValueProvider<unknown> = {
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            initialize(b){
                //expect called
            },
            clone(){
                return null as any;
            }
        }

        const constructorValueProvider:interfaces.ConstructorValueProvider<unknown> = {
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            initialize(b){
                //expect called
            },
            clone(){
                return null as any;
            }
        }

        const dynamicValueProvider:interfaces.DynamicValueProvider<unknown> = {
            factoryType:"toDynamicValue",
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            clone(){
                return null as any;
            }
        }

        const factoryValueProvider:interfaces.FactoryValueProvider<unknown> = {
            factoryType:"toFactory",
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            initialize(b){
                //expect called
            },
            clone(){
                return null as any;
            }
        }

        const providerValueProvider:interfaces.ProviderValueProvider<unknown> = {
            factoryType:"toProvider",
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            initialize(b){
                //expect called
            },
            clone(){
                return null as any;
            }
        }

        const instanceValueProvider:interfaces.InstanceValueProvider<unknown> = {
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            clone(){
                return null as any;
            }
        }

        const mockConstantValueProvider = sinon.mock(constantValueProvider);
        const mockConstructorValueProvider = sinon.mock(constructorValueProvider);
        const mockFactoryValueProvider = sinon.mock(factoryValueProvider);
        const mockProviderValueProvider = sinon.mock(providerValueProvider);

        const mockValueProviderFactory:interfaces.ValueProviderFactory<unknown> = {
            toConstantValue(){
                return constantValueProvider;
            },
            toConstructor(){
                return constructorValueProvider;
            },
            toDynamicValue(){
               return dynamicValueProvider;
            },
            toFactory(){
                return factoryValueProvider;
            },
            toInstance(){
                return instanceValueProvider;
            },
            toProvider(){
                return providerValueProvider;
            }
        }

        const binding = new Binding(irrelevant, BindingScopeEnum.Transient);
        const syntax = new BindingToSyntax(binding);
        (syntax as any)._valueProviderFactory = mockValueProviderFactory;

        const constantValue = new Ninja();
        syntax.toConstantValue(constantValue);
        expect(binding.valueProvider === constantValueProvider);
        expect(constantValueProvider.valueFrom === constantValue).to.equal(true);
        mockConstantValueProvider.expects("initialize").calledWithExactly(binding);

        const dynamicValue:interfaces.DynamicValue<unknown> = () => new Ninja();
        syntax.toDynamicValue(dynamicValue);
        expect(binding.valueProvider === dynamicValueProvider);
        expect(dynamicValueProvider.valueFrom === dynamicValue).to.equal(true);

        syntax.toConstructor(Ninja);
        expect(binding.valueProvider === constructorValueProvider);
        expect(constructorValueProvider.valueFrom === Ninja).to.equal(true);
        mockConstructorValueProvider.expects("initialize").calledWithExactly(binding);

        const factoryCreator:interfaces.FactoryCreator<any> = (context:interfaces.Context) => () => new Ninja();
        syntax.toFactory(factoryCreator);
        expect(binding.valueProvider === factoryValueProvider);
        expect(factoryValueProvider.valueFrom === factoryCreator).to.equal(true);
        mockFactoryValueProvider.expects("initialize").calledWithExactly(binding);

        const providerCreator:interfaces.ProviderCreator<any> = (context:interfaces.Context) => () => Promise.resolve(new Ninja());
        syntax.toProvider(providerCreator);
        expect(binding.valueProvider === providerValueProvider);
        expect(providerValueProvider.valueFrom === providerCreator).to.equal(true);
        mockProviderValueProvider.expects("initialize").calledWithExactly(binding);

        syntax.to(Ninja);
        expect(binding.valueProvider === instanceValueProvider);
        expect(instanceValueProvider.valueFrom === Ninja).to.equal(true);

        //helpers
        const mockSyntax = sinon.mock(syntax);
        syntax.toSelf();
        mockSyntax.expects("to").calledWithExactly(irrelevant);
        const fn = () => true;
        syntax.toFunction(fn);
        mockSyntax.expects("toConstantValue").calledWithExactly(fn);
        syntax.toService("service");
        mockSyntax.expects("toDynamicValue").calledWith(sinon.match.func);
        syntax.toAutoFactory("sid");
        mockSyntax.expects("toFactory").calledWith(sinon.match.func);
    })

    it("Should return BindingInWhenOnSyntax<T>(this._binding)", () => {
        class Sid {}
        const binding = new Binding(Sid,"Request");
        const bindingToSyntax = new BindingToSyntax(binding);

        function expectBindingInWhenOnSyntax(bindingInWhenOn:any){
            expect(bindingInWhenOn).to.be.instanceOf(BindingInWhenOnSyntax);
            expect(bindingInWhenOn._binding === binding).to.equal(true);
        }
        expectBindingInWhenOnSyntax(bindingToSyntax.to(Sid));
    })

    it("Should be able to configure the type of a binding", () => {

        interface Ninja {}

        @injectable()
        class Ninja implements Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        // let bindingWithClassAsId = new Binding<Ninja>(Ninja, BindingScopeEnum.Transient);
        const bindingToSyntax = new BindingToSyntax<Ninja>(binding);

//        (bindingToSyntax as any)._binding = bindingWithClassAsId;
//        bindingToSyntax.toSelf();
//        expect(binding.type).eql(BindingTypeEnum.Instance);
//        expect(binding.implementationType).not.to.eql(null);

        (bindingToSyntax as any)._binding = binding;
        bindingToSyntax.toConstantValue(new Ninja());
        expect(binding.cache instanceof Ninja).eql(true);

        const f = () => "test";
        bindingToSyntax.toFunction(f);
        expect(binding.cache === f).eql(true);

    });

    it("Should prevent invalid function bindings", () => {

        interface Ninja {}

        @injectable()
        class Ninja implements Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        const bindingToSyntax = new BindingToSyntax<Ninja>(binding);

        const f = function () {
            bindingToSyntax.toFunction(5);
        };

        expect(f).to.throw(ERROR_MSGS.INVALID_FUNCTION_BINDING);

    });

});
