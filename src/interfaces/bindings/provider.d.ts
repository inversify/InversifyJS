/// <reference path="../interfaces.d.ts" />

interface IProvider<T> extends Function {
    (context: IContext): Promise<T>;
}
