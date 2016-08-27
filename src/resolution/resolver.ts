import interfaces from "../interfaces/interfaces";
import BindingScope from "../bindings/binding_scope";
import BindingType from "../bindings/binding_type";
import TargetType from "../planning/target_type";
import * as ERROR_MSGS from "../constants/error_msgs";

class Resolver implements interfaces.Resolver {

    public resolve<T>(context: interfaces.Context): T {
        let rootRequest = context.plan.rootRequest;
        return this._resolve(rootRequest);
    }

    private _resolve(request: interfaces.Request): any {

        let bindings = request.bindings;
        let childRequests = request.childRequests;

        if (
            request.target && request.target.isArray() &&
            (!request.parentRequest.target || !request.parentRequest.target.matchesArray(request.target.serviceIdentifier))
        ) {

            // Create an array instead of creating an instance
            return childRequests.map((childRequest: interfaces.Request) => { return this._resolve(childRequest); });

        } else {

            let result: any = null;
            let binding = bindings[0];
            let isSingleton = binding.scope === BindingScope.Singleton;

            if (isSingleton && binding.activated === true) {
                return binding.cache;
            }

            switch (binding.type) {

                case BindingType.ConstantValue:
                    result = binding.cache;
                    break;

                case BindingType.DynamicValue:
                    result = binding.dynamicValue();
                    break;

                case BindingType.Constructor:
                    result = binding.implementationType;
                    break;

                case BindingType.Factory:
                    result = binding.factory(request.parentContext);
                    break;

                 case BindingType.Function:
                    result = binding.cache;
                    break;

                case BindingType.Provider:
                    result = binding.provider(request.parentContext);
                    break;

                case BindingType.Instance:

                    let constr = binding.implementationType;

                    if (childRequests.length > 0) {

                        let constructorInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) => {
                            return childRequest.target.type === TargetType.ConstructorArgument;
                        });

                        let constructorInjections = constructorInjectionsRequests.map((childRequest: interfaces.Request) => {
                            return this._resolve(childRequest);
                        });

                        result = this._createInstance(constr, constructorInjections);
                        result = this._injectProperties(result, childRequests);

                    } else {
                        result = new constr();
                    }

                    break;

                case BindingType.Invalid:
                default:
                    // The user probably created a binding but didn't finish it
                    // e.g. kernel.bind<T>("Something"); missing BindingToSyntax
                    let serviceIdentifier = request.parentContext.kernel.getServiceIdentifierAsString(request.serviceIdentifier);
                    throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifier}`);
            }

            // use activation handler if available
            if (typeof binding.onActivation === "function") {
                result = binding.onActivation(request.parentContext, result);
            }

            // store in cache if scope is singleton
            if (isSingleton) {
                binding.cache = result;
                binding.activated = true;
            }

            return result;
        }

    }

    private _injectProperties(instance: any, childRequests: interfaces.Request[]) {

        let propertyInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) => {
            return childRequest.target.type === TargetType.ClassProperty;
        });

        let propertyInjections = propertyInjectionsRequests.map((childRequest: interfaces.Request) => {
            return this._resolve(childRequest);
        });

        propertyInjectionsRequests.forEach((r: interfaces.Request, index: number) => {
            let injection = propertyInjections[index];
            instance[r.target.name.value()] = injection;
        });

        return instance;

    }

    private _createInstance(Func: { new(...args: any[]) : any }, injections: Object[]) {
        return new Func(...injections);
    }

}

export default Resolver;
