///<reference path="../interfaces/interfaces.d.ts" />

import BindingScope from "../bindings/binding_scope";
import BindingType from "../bindings/binding_type";
import * as ERROR_MSGS from "../constants/error_msgs";

class Resolver implements IResolver {

    public resolve<Service>(context: IContext): Service {
        let rootRequest = context.plan.rootRequest;
        return this._inject(rootRequest);
    }

    private _inject(request: IRequest): any {

        let bindings = request.bindings;
        let childRequests = request.childRequests;

        if (request.target && request.target.isArray() && bindings.length > 1) {

            // Create an array instead of creating an instance
            return childRequests.map((childRequest) => { return this._inject(childRequest); });

        } else {

            let result: any = null;
            let binding = bindings[0];
            let isSingleton = binding.scope === BindingScope.Singleton;

            if (isSingleton && binding.activated === true) {
                return binding.cache;
            }

            switch (binding.type) {

                case BindingType.Value:
                    result = binding.cache;
                    break;

                case BindingType.Constructor:
                    result = binding.implementationType;
                    break;

                case BindingType.Factory:
                    result = binding.factory(request.parentContext);
                    break;

                case BindingType.Provider:
                    result = binding.provider(request.parentContext);
                    break;

                case BindingType.Instance:

                    let constr = binding.implementationType;

                    if (childRequests.length > 0) {
                        let injections = childRequests.map((childRequest) => {
                            return this._inject(childRequest);
                        });
                        result = this._createInstance(constr, injections);
                    } else {
                        result = new constr();
                    }

                    break;

                case BindingType.Invalid:
                default:
                    // The user probably created a binding but didn't finish it
                    // e.g. kernel.bind<T>("ISomething"); missing BindingToSyntax
                    throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${request.service}`);
            }

            // use activation handler if available
            if (typeof binding.onActivation === "function") {
                result = binding.onActivation(result);
            }

            // store in cache if scope is singleton
            if (isSingleton) {
                binding.cache = result;
                binding.activated = true;
            }

            return result;
        }

    }

    private _createInstance(Func: { new(...args: any[]) : any }, injections: Object[]) {
        return new Func(...injections);
    }

}

export default Resolver;
