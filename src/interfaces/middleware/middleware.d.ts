interface PlanAndResolve<T> {
    (multiInject: boolean, serviceIdentifier: (string|Symbol|INewable<T>), target: ITarget): T[];
}

interface IMiddleware extends Function {
    (next: PlanAndResolve<any>): PlanAndResolve<any>;
}
