/// <reference path="../interfaces.d.ts" />

interface IProvider<T> extends Function {
    (): Promise<T>;
}
