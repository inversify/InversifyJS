interface IMiddleware extends Function {
    (next: (context: IContext) => any): (context: IContext) => any;
}
