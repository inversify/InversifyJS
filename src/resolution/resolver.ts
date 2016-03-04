///<reference path="../interfaces/interfaces.d.ts" />

import BindingScope from "../bindings/binding_scope";

class Resolver implements IResolver {

    private _middleWare: Middleware[];

    public constructor(middleWare: Middleware[] = []) {
        this._middleWare = middleWare;
    }

    public resolve<Service>(context: IContext): Service {
        let rootRequest = context.plan.rootRequest;
        return this._construct(rootRequest);
    }

    private _construct(request) {

        let childRequests = request.childRequests;
        let binding = request.bindings[0]; // TODO handle multi-injection
        let constr = binding.implementationType;
        let isSingleton = binding.scope === BindingScope.Singleton;

        if (isSingleton && binding.cache !== null) {
           return binding.cache;
        }

        if (childRequests.length > 0) {
            let injections = childRequests.map((childRequest) => {
                return this._construct(childRequest);
            });
            let instance = this._createInstance(constr, injections);
            if (isSingleton) { binding.cache = instance; }
            return instance;
        } else {
            let instance = new constr();
            if (isSingleton) { binding.cache = instance; }
            return instance;
        }
    }

    private _createInstance(Func: { new(...args: any[]) : any }, injections: Object[]) {
        return new Func(...injections);
    }

}

export default Resolver;
