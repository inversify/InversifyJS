interface IKernelSnapshot {
    bindings: ILookup<IBinding<any>>;
    middleware: (context: IContext) => void;
}
