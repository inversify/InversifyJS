///<reference path="../interfaces/interfaces.d.ts" />

import Target from "../planning/target";

function proxyGetter(
    kernel: any,
    serviceIdentifier: (string|Symbol|INewable<any>),
    proto: any,
    key: string,
    target: ITarget,
    resolve: (kernel: IKernel, serviceIdentifier: (string|Symbol|INewable<any>), target: ITarget) => any
) {

    let globalInjectionMap: WeakMap<any, any> = kernel._injectedProperties;

    let getter = function () {

        let instanceInjections: Map<string, any> = globalInjectionMap.get(this);

        if (instanceInjections == null) {
            instanceInjections = new Map();
            globalInjectionMap.set(this, instanceInjections);
        }

        if (!instanceInjections.has(key)) {
            let val = resolve(kernel, serviceIdentifier, target);
            instanceInjections.set(key, val);
        }

        return instanceInjections.get(key);

    };

    let  setter = function(newVal: any) {

        let instanceInjections: Map<string, any> = globalInjectionMap.get(this);

        if (instanceInjections == null) {
            instanceInjections = new Map();
            globalInjectionMap.set(this, instanceInjections);
        }

        instanceInjections.set(key, newVal);

    };

    if (delete proto[key]) {
        Object.defineProperty(proto, key, {
            configurable: true,
            enumerable: true,
            get: getter,
            set: setter
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
