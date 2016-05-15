///<reference path="../interfaces/interfaces.d.ts" />

const INJECTION = Symbol();

function _proxyGetter(
    proto: any,
    key: string,
    resolve: () => any
) {
    function getter() {
        if (!Reflect.hasMetadata(INJECTION, this, key)) {
            Reflect.defineMetadata(INJECTION, resolve(), this, key);
        }
        return Reflect.getMetadata(INJECTION, this, key);
    }

    function setter(newVal: any) {
        Reflect.defineMetadata(INJECTION, newVal, this, key);
    }

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

            let resolve = () => {
                return kernel.get(serviceIdentifier);
            };

            _proxyGetter(proto, key, resolve);

        };
    };
}

function makePropertyInjectNamedDecorator(kernel: IKernel) {
    return function(serviceIdentifier: (string|Symbol|INewable<any>), named: string) {
        return function(proto: any, key: string): void {

            let resolve = () => {
                return kernel.getNamed(serviceIdentifier, named);
            };

            _proxyGetter(proto, key, resolve);

        };
    };
}

function makePropertyInjectTaggedDecorator(kernel: IKernel) {
    return function(serviceIdentifier: (string|Symbol|INewable<any>), key: string, value: any) {
        return function(proto: any, propertyName: string): void {

            let resolve = () => {
                return kernel.getTagged(serviceIdentifier, key, value);
            };

            _proxyGetter(proto, propertyName , resolve);

        };
    };
}

function makePropertyMultiInjectDecorator(kernel: IKernel) {
    return function(serviceIdentifier: (string|Symbol|INewable<any>)) {
        return function(proto: any, key: string): void {

            let resolve = () => {
                return kernel.getAll(serviceIdentifier);
            };

            _proxyGetter(proto, key, resolve);

        };
    };
}

export {
    makePropertyInjectDecorator,
    makePropertyMultiInjectDecorator,
    makePropertyInjectTaggedDecorator,
    makePropertyInjectNamedDecorator
};
