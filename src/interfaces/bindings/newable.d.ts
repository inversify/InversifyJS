/// <reference path="../interfaces.d.ts" />

interface INewable<T> {
    new(...args: any[]): T;
}
