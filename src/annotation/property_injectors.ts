///<reference path="../interfaces/interfaces.d.ts" />

import Target from "../planning/target";

function proxyGetter(
    kernel: any,
    serviceIdentifier: (string|Symbol|INewable<any>),
    proto: any,
    key: string,
    target: ITarget,
    resolve: (kernel: IKernel, serviceIdentifier: (string|Symbol|INewable<any>), target: ITarget) => any,
    value?: any
) {

    let getter = function () {

        // First time we access the property it is undefined
        // We create a hidden property __${key}__ to store the value
        // and override the getter the second time we access it
        // the value is defined.
        let val: any = value || this[`__${key}__`];

        if (val === undefined) {
            val = resolve(kernel, serviceIdentifier, target);
            proxyGetter(kernel, serviceIdentifier, this, key, target, resolve, val);
        }

        return val;
    };

    if (delete proto[key]) {
        Object.defineProperty(proto, key, {
            get: getter
        });
    }
}

function getPropertyTarget(proto: any, key: string, serviceIdentifier: (string|Symbol|INewable<any>)): ITarget {

    let targetName: string = null;                // TODO read metadata
    let namedOrTagged: (string|IMetadata) = null; // TODO read metadata

    return new Target(targetName, serviceIdentifier, namedOrTagged);
}

function makePropertyInjectDecorator(kernel: IKernel) {
    return function(serviceIdentifier: (string|Symbol|INewable<any>)) {
        return function(proto: any, key: string): void {

            let target: ITarget = getPropertyTarget(proto, key, serviceIdentifier);

            let resolve = (krln: IKernel, srvId: (string|Symbol|INewable<any>), trgt: ITarget) => {
                return (<any>krln)._get(srvId, trgt);
            };

            // First time we proxyGetter property is undefined
            proxyGetter(kernel, serviceIdentifier, proto, key, target, resolve);
        };
    };
}

function makePropertyMultiInjectDecorator(kernel: IKernel) {
    return function(serviceIdentifier: (string|Symbol|INewable<any>)) {
        return function(proto: any, key: string): void {

            let target: ITarget = getPropertyTarget(proto, key, serviceIdentifier);

            let resolve = (krln: IKernel, srvId: (string|Symbol|INewable<any>), trgt: ITarget) => {
                return krln.getAll(srvId);
            };

            // First time we proxyGetter property is undefined
            proxyGetter(kernel, serviceIdentifier, proto, key, target, resolve);
        };
    };
}

export { makePropertyInjectDecorator, makePropertyMultiInjectDecorator };
