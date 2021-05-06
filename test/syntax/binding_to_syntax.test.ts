import { expect } from "chai";
import { injectable } from "../../src/annotation/injectable";
import { Binding } from "../../src/bindings/binding";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { interfaces } from "../../src/interfaces/interfaces";
import { BindingToSyntax } from "../../src/syntax/binding_to_syntax";
import * as sinon from 'sinon';
import { BindingInWhenOnSyntax } from "../../src/syntax/binding_in_when_on_syntax";
import { ValueProviderFactory } from "../../src/bindings/value-provider-factory";
import { ValueProviderFactory as ValueProviderFactoryInterface } from "../../src/bindings/value-provider-factory"


describe("BindingToSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier);
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
            type:"ConstantValue",
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            clone(){
                return null as any;
            }
        }

        const constructorValueProvider:interfaces.ConstructorValueProvider<unknown> = {
            type:"Constructor",
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            clone(){
                return null as any;
            }
        }

        const dynamicValueProvider:interfaces.DynamicValueProvider<unknown> = {
            type:"DynamicValue",
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
            type:"Factory",
            factoryType:"toFactory",
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            clone(){
                return null as any;
            }
        }

        const providerValueProvider:interfaces.ProviderValueProvider<unknown> = {
            type:"Provider",
            factoryType:"toProvider",
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            clone(){
                return null as any;
            }
        }

        const instanceValueProvider:interfaces.InstanceValueProvider<unknown> = {
            type:"Instance",
            valueFrom:null as any,
            provideValue(){
                return null as any;
            },
            clone(){
                return null as any;
            }
        }

        const mockValueProviderFactory:ValueProviderFactoryInterface<unknown> = {
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

        const binding = new Binding(irrelevant);
        const syntax = new BindingToSyntax(binding);
        syntax.valueProviderFactory = mockValueProviderFactory;

        const constantValue = new Ninja();
        syntax.toConstantValue(constantValue);
        expect(binding.valueProvider === constantValueProvider);
        expect(constantValueProvider.valueFrom === constantValue).to.equal(true);

        const dynamicValue:interfaces.DynamicValue<unknown> = () => new Ninja();
        syntax.toDynamicValue(dynamicValue);
        expect(binding.valueProvider === dynamicValueProvider);
        expect(dynamicValueProvider.valueFrom === dynamicValue).to.equal(true);

        syntax.toConstructor(Ninja);
        expect(binding.valueProvider === constructorValueProvider);
        expect(constructorValueProvider.valueFrom === Ninja).to.equal(true);

        const factoryCreator:interfaces.FactoryCreator<any> = (context:interfaces.Context) => () => new Ninja();
        syntax.toFactory(factoryCreator);
        expect(binding.valueProvider === factoryValueProvider);
        expect(factoryValueProvider.valueFrom === factoryCreator).to.equal(true);

        const providerCreator:interfaces.ProviderCreator<any> = (context:interfaces.Context) => () => Promise.resolve(new Ninja());
        syntax.toProvider(providerCreator);
        expect(binding.valueProvider === providerValueProvider);
        expect(providerValueProvider.valueFrom === providerCreator).to.equal(true);

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

    it("Should use instanceof ValueProviderFactory", () => {
        const bindingToSyntax = new BindingToSyntax(null as any);
        expect(bindingToSyntax.valueProviderFactory).to.be.instanceOf(ValueProviderFactory);
    })

    function expectSetsSingletonScope(toCallback:(bindingTo:interfaces.BindingToSyntax<unknown>) => void): void {
        const binding = new Binding<unknown>("");
        const setScopeSpy = sinon.spy(binding.scopeManager,"setScope");
        const bindingToSyntax = new BindingToSyntax(binding);
        toCallback(bindingToSyntax);
        expect(setScopeSpy.calledWithExactly("Singleton")).to.equal(true);
    }
    it("Should set singletonscope for toConstantValue ( and toFunction )", () => {
        expectSetsSingletonScope(bindingTo => bindingTo.toConstantValue("constant"));
    });

    it("Should set singletonscope for toFactory ( and toAutoFactory )", () => {
        expectSetsSingletonScope(bindingTo => bindingTo.toFactory(()=>()=>"value"));
    });

    it("Should set singletonscope for toProvider", () => {
        expectSetsSingletonScope(bindingTo => bindingTo.toProvider(()=>()=>Promise.resolve("value")));
    });

    it("Should set singletonscope for toConstructor", () => {
        expectSetsSingletonScope(bindingTo => bindingTo.toConstructor(Boolean));
    });

    it("Should return BindingInWhenOnSyntax<T>(this._binding)", () => {
        class Sid {}
        const binding = new Binding(Sid);
        const bindingToSyntax = new BindingToSyntax(binding);

        function expectBindingInWhenOnSyntax(bindingInWhenOn:any){
            expect(bindingInWhenOn).to.be.instanceOf(BindingInWhenOnSyntax);
            expect(bindingInWhenOn._binding === binding).to.equal(true);
        }
        expectBindingInWhenOnSyntax(bindingToSyntax.to(Sid));
    })

    it("Should prevent invalid function bindings", () => {

        interface Ninja {}

        @injectable()
        class Ninja implements Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier);
        const bindingToSyntax = new BindingToSyntax<Ninja>(binding);

        const f = function () {
            bindingToSyntax.toFunction(5);
        };

        expect(f).to.throw(ERROR_MSGS.INVALID_FUNCTION_BINDING);

    });

});
