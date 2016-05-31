interface PlanAndResolve<T> {
    (args: PlanAndResolveArgs): T[];
}

interface IMiddleware extends Function {
    (next: PlanAndResolve<any>): PlanAndResolve<any>;
}

interface PlanAndResolveArgs {
    multiInject: boolean;
    serviceIdentifier: (string|Symbol|INewable<any>);
    target: ITarget;
    contextInterceptor: (contexts: IContext) => IContext;
}
