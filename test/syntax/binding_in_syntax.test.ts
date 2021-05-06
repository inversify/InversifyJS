import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import { BindingScopeEnum } from "../../src/constants/literal_types";
import { BindingInSyntax } from "../../src/syntax/binding_in_syntax";
import { BindingScopeScopeFactory } from "../../src/scope/binding-scope-scope-factory-interface";
import { SingletonScope } from "../../src/scope/singleton-scope";
import { TransientScope } from "../../src/scope/transient-scope";
import { RequestResolveScope } from "../../src/scope/request-resolve-scope";
import { RootRequestScope } from "../../src/scope/root-request-scope";

describe("BindingInSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier);
        const bindingInSyntax = new BindingInSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        const _bindingInSyntax: any = bindingInSyntax;

        expect(_bindingInSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure the scope of a binding", () => {

        interface Ninja {}
        const ninjaIdentifier = "Ninja";

        const binding = new Binding<Ninja>(ninjaIdentifier);
        const bindingInSyntax = new BindingInSyntax<Ninja>(binding);
        const singletonScope = new SingletonScope<Ninja>();
        const transientScope = new TransientScope<Ninja>();
        const requestScope = new RequestResolveScope<Ninja>();
        const rootRequestScope = new RootRequestScope<Ninja>();
        const bindingScopeScopeFactory:BindingScopeScopeFactory<Ninja> = {
            get(scope){
                switch(scope){
                    case BindingScopeEnum.Singleton:
                        return singletonScope;
                    case BindingScopeEnum.Transient:
                        return transientScope;
                    case BindingScopeEnum.RootRequest:
                        return rootRequestScope;
                    case BindingScopeEnum.Request:
                        return requestScope;
                    default:
                        throw new Error();
                }
            }
        }
        bindingInSyntax.bindingScopeScopeFactoryInterface = bindingScopeScopeFactory;

        // singleton scope
        bindingInSyntax.inSingletonScope();
        expect(binding.scope).to.equal(singletonScope);

        bindingInSyntax.inTransientScope();
        expect(binding.scope).to.equal(transientScope);

        bindingInSyntax.inRequestScope();
        expect(binding.scope).to.equal(requestScope);

        bindingInSyntax.inRootRequestScope();
        expect(binding.scope).to.equal(rootRequestScope);

        const customScope:any = {customScope:true};
        bindingInSyntax.inCustomScope(customScope);
        expect(binding.scope).to.equal(customScope);

    });

});
