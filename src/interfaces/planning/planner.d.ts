///<reference path="../bindings/binding.d.ts" />
///<reference path="./plan.d.ts" />
///<reference path="../kernel/lookup.d.ts" />áá

interface IPlanner {
    createContext(kernel: IKernel): IContext;
    createPlan(parentContext: IContext, binding: IBinding<any>, target: ITarget): IPlan;
    getBindings<T>(kernel: IKernel, service: (string|Symbol|INewable<T>)): IBinding<T>[];
    getActiveBindings(parentRequest: IRequest, target: ITarget): IBinding<any>[];
}
