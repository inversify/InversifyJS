/// <reference path="../interfaces.d.ts" />

interface IFactory<T> extends Function {
    (...args: any[]): (((...args: any[]) => T)|T);
}
