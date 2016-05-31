interface IKernelSnapshot {
    bindings: ILookup<IBinding<any>>;
    middleware: PlanAndResolve<any>;
}
