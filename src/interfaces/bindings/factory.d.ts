/// <reference path="../interfaces.d.ts" />

interface IFactory<T> extends Function {
    (): T;
}
