/// <reference path="../interfaces.d.ts" />

interface IFactoryCreator<T> extends Function {
    (context: IContext): IFactory<T>;
}
