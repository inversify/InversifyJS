/// <reference path="../interfaces.d.ts" />

interface IFactory<T> extends Function {
    (context: IContext): T;
}
