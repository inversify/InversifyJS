///<reference path="../interfaces/interfaces.d.ts" />

function _proxyGetter(
    kernel: any,
    serviceIdentifier: (string|Symbol|INewable<any>),
    proto: any,
    key: string,
    resolve: (kernel: IKernel, serviceIdentifier: (string|Symbol|INewable<any>)) => any
) {

    let globalInjectionMap: WeakMap<any, any> = kernel._injectedProperties;

    let getter = function () {

        let instanceInjections: Map<string, any> = globalInjectionMap.get(this);

        if (instanceInjections == null) {
            instanceInjections = new Map();
            globalInjectionMap.set(this, instanceInjections);
        }

        if (!instanceInjections.has(key)) {
            let val = resolve(kernel, serviceIdentifier);
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

    delete proto[key];

    Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: setter
    });

}

function makePropertyInjectDecorator(kernel: IKernel) {
    return function(serviceIdentifier: (string|Symbol|INewable<any>)) {
        return function(proto: any, key: string): void {

            let resolve = (krln: IKernel, srvId: (string|Symbol|INewable<any>)) => {
                return krln.get(srvId);
            };

            _proxyGetter(kernel, serviceIdentifier, proto, key, resolve);

        };
    };
}

function makePropertyInjectNamedDecorator(kernel: IKernel) {
    return function(serviceIdentifier: (string|Symbol|INewable<any>), named: string) {
        return function(proto: any, key: string): void {

            let resolve = (krln: IKernel, srvId: (string|Symbol|INewable<any>)) => {
                return krln.getNamed(srvId, named);
            };

            _proxyGetter(kernel, serviceIdentifier, proto, key, resolve);

        };
    };
}

function makePropertyInjectTaggedDecorator(kernel: IKernel) {
    return function(serviceIdentifier: (string|Symbol|INewable<any>), key: string, value: any) {
        return function(proto: any, propertyName: string): void {

            let resolve = (krln: IKernel, srvId: (string|Symbol|INewable<any>)) => {
                return krln.getTagged(srvId, key, value);
            };

            _proxyGetter(kernel, serviceIdentifier, proto, propertyName, resolve);

        };
    };
}

function makePropertyMultiInjectDecorator(kernel: IKernel) {
    return function(serviceIdentifier: (string|Symbol|INewable<any>)) {
        return function(proto: any, key: string): void {

            let resolve = (krln: IKernel, srvId: (string|Symbol|INewable<any>)) => {
                return krln.getAll(srvId);
            };

            _proxyGetter(kernel, serviceIdentifier, proto, key, resolve);

        };
    };
}

export {
    makePropertyInjectDecorator,
    makePropertyMultiInjectDecorator,
    makePropertyInjectTaggedDecorator,
    makePropertyInjectNamedDecorator
};
