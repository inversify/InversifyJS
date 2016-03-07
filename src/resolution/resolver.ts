///<reference path="../interfaces/interfaces.d.ts" />

import BindingScope from "../bindings/binding_scope";
import BindingType from "../bindings/binding_type";
import * as ERROR_MSGS from "../constants/error_msgs";

class Resolver implements IResolver {

    private _middleWare: IMiddleware[];

    public constructor(middleWare: IMiddleware[] = []) {
        this._middleWare = middleWare;
    }

    public resolve<Service>(context: IContext): Service {
        let rootRequest = context.plan.rootRequest;
        return this._inject(rootRequest);
    }

    private _inject(request) {

        let childRequests = request.childRequests;
        let binding = request.bindings[0]; // TODO handle multi-injection

        switch (binding.type) {
            case BindingType.Value:
                return binding.cache;

            case BindingType.Constructor:
                return binding.implementationType;

            case BindingType.Factory:
                return binding.factory;

            case BindingType.Provider:
                return binding.provider;

            case BindingType.Instance:
                let constr = binding.implementationType;
                let isSingleton = binding.scope === BindingScope.Singleton;

                if (isSingleton && binding.cache !== null) {
                    return binding.cache;
                }

                if (childRequests.length > 0) {
                    let injections = childRequests.map((childRequest) => {
                        return this._inject(childRequest);
                    });
                    let instance = this._createInstance(constr, injections);
                    if (isSingleton) { binding.cache = instance; }
                    return instance;
                } else {
                    let instance = new constr();
                    if (isSingleton) { binding.cache = instance; }
                    return instance;
                }

            case BindingType.Invalid:
            default:
                // The user probably created a binding but didn't finish it
                // e.g. kernel.bind<T>("ISomething"); missing BindingToSyntax
                throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${request.service}`);
        }
    }

    private _createInstance(Func: { new(...args: any[]) : any }, injections: Object[]) {
        return new Func(...injections);
    }

}

export default Resolver;
