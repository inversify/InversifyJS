/// <reference path="../interfaces.d.ts" />

interface IProviderCreator<T> extends Function {
    (context: IContext): IProvider<T>;
}
