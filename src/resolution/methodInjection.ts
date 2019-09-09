import { interfaces, METADATA_KEY } from "../inversify";

interface InjectableMethodParameter {
    index: number;
    metadata: interfaces.Metadata[];
}

function _resolveInjectableMethodParameter(
    injectableMethodParameter: InjectableMethodParameter,
    container: interfaces.Container): () => any {
        let metadata: interfaces.Metadata | undefined;
        let serviceIdentifier!: interfaces.ServiceIdentifier<any>;
        let isMulti = false;
        let isOptional = false;
        injectableMethodParameter.metadata.forEach((m) => {
            if (m.key === METADATA_KEY.MULTI_INJECT_TAG) {
                isMulti = true;
                serviceIdentifier = m.value;
            } else if (m.key === METADATA_KEY.INJECT_TAG) {
                serviceIdentifier = m.value;
            } else if (m.key === METADATA_KEY.OPTIONAL_TAG) {
                isOptional = true;
            } else {
                metadata = m;
            }
        });
        return _getContainerGet(serviceIdentifier, isMulti, isOptional, metadata, container);
}
function _getContainerGet(
    serviceIdentifier: interfaces.ServiceIdentifier<any>,
    isMulti: boolean,
    isOptional: boolean,
    metadata: interfaces.Metadata | undefined,
    container: interfaces.Container): () => any {
        let getFunction: () => any;
        if (isMulti) {
            if (metadata !== undefined) {
                getFunction = () => {
                    return container.getAllTagged(serviceIdentifier, metadata!.key, metadata!.value);
                };
            } else {
                getFunction = () => {
                    return container.getAll(serviceIdentifier);
                };
            }
        } else {
            if (metadata !== undefined) {
                getFunction = () => {
                    return container.getTagged(serviceIdentifier, metadata!.key, metadata!.value);
                };
            } else {
                getFunction = () => {
                    return container.get(serviceIdentifier);
                };
            }
        }
        if (isOptional) {
            getFunction = () => {
                let containerGot: any;
                try {
                    containerGot = getFunction();
                } catch (e) {
                    //
                }
                return containerGot;
            };
        }
        return getFunction;
}
function _getInjectableMethods(classPrototype: any, metadataReader: interfaces.MetadataReader): Map<string, InjectableMethodParameter[]> {
    const map: Map<string, InjectableMethodParameter[]> = new Map();
    if (metadataReader.getMethodMetadata) {
        const metadata = metadataReader.getMethodMetadata(classPrototype);
        Object.keys(metadata).forEach((k) => {
            if (k.startsWith("*!?_")) {
                const methodNameEnd = k.indexOf("_*!?_");
                const methodName = k.substring(4, methodNameEnd);
                const parameterIndex = Number.parseInt(k.substring(methodNameEnd + 5), 10);
                let injectableMethodParameters: InjectableMethodParameter[];
                if (map.has(methodName)) {
                    injectableMethodParameters = map.get(methodName)!;
                } else {
                    injectableMethodParameters = [];
                    map.set(methodName, injectableMethodParameters);
                }
                injectableMethodParameters.push({index: parameterIndex, metadata: metadata[k]});
            }
        });
    }
    return map;
}
function _mapInjectableMethodParameters(
    injectableMethodParameters: InjectableMethodParameter[],
    container: interfaces.Container) {
        let injectionsFirst = false;
        const parameterGets: (() => any)[] = injectableMethodParameters.reverse().map((imp, i) => {
            if (i === 0  && imp.index === 0) {
                injectionsFirst = true;
            }
            return _resolveInjectableMethodParameter(imp, container);
        });
        return {
            injectionsFirst,
            parameterGets
        };
}

function _injectMethod(instance: any, methodName: string, parameterGets: (() => any)[], injectionsFirst: boolean) {
    const originalMethod: Function = instance[methodName];
    instance[methodName] = function() {
        let args: any[] = Array.prototype.slice.call(arguments);
        const injectedParameters = parameterGets.map((pg) => pg());
        if (injectionsFirst) {
            args = injectedParameters.concat(args);
        } else {
            args = args.concat(injectedParameters);
        }
        return originalMethod.call(instance, ...args);
    }.bind(instance); //no need to bind
}
function methodInjection(container: interfaces.Container, ctor: interfaces.Newable<any>, instance: any) {
    const injectableMethods = _getInjectableMethods(ctor.prototype, (container as any)._metadataReader as interfaces.MetadataReader);
    injectableMethods.forEach((imps, methodName) => {
        const {parameterGets, injectionsFirst} = _mapInjectableMethodParameters(imps, container);
        _injectMethod(instance, methodName, parameterGets, injectionsFirst);
    });
}
function getMethodParameterKey(methodName: string, parameterIndex: number) {
    return `*!?_${methodName}_*!?_${parameterIndex!.toString()}`;
}

type InjectedMethod1<T extends (...args: any[]) => any, TInjected> =
            (injected: TInjected, ...args: Parameters<T>) => ReturnType<T>;
type InjectedMethod2<T extends (...args: any[]) => any, TInjected1, TInjected2> =
    (injected: TInjected1, injected2: TInjected2, ...args: Parameters<T>) => ReturnType<T>;
type InjectedMethod3<T extends (...args: any[]) => any, TInjected1, TInjected2, TInjected3> =
    (injected: TInjected1, injected2: TInjected2, injected3: TInjected3, ...args: Parameters<T>) => ReturnType<T>;
type InjectedMethod4<T extends (...args: any[]) => any, TInjected1, TInjected2, TInjected3, TInjected4> =
    (injected: TInjected1, injected2: TInjected2, injected3: TInjected3, injected4: TInjected4, ...args: Parameters<T>) => ReturnType<T>;
type InjectedMethod5<T extends (...args: any[]) => any, TInjected1, TInjected2, TInjected3, TInjected4, TInjected5> =
    (
        injected: TInjected1,
        injected2: TInjected2,
        injected3: TInjected3,
        injected4: TInjected4,
        injected5: TInjected5,
        ...args: Parameters<T>
    ) => ReturnType<T>;
type InjectedMethod6<T extends (...args: any[]) => any, TInjected1, TInjected2, TInjected3, TInjected4, TInjected5, TInjected6> =
    (
        injected: TInjected1,
        injected2: TInjected2,
        injected3: TInjected3,
        injected4: TInjected4,
        injected5: TInjected5,
        injected6: TInjected6,
        ...args: Parameters<T>
    ) => ReturnType<T>;
type MethodInjectedType1<T extends { [ P in TProperty]: (...args: any[]) => any}, TProperty extends keyof T,  TInjected> = {
    [P in TProperty]: InjectedMethod1<T[TProperty], TInjected>
};
type MethodInjectedType2<T extends { [ P in TProperty]: (...args: any[]) => any}, TProperty extends keyof T,  TInjected1, TInjected2> = {
    [P in TProperty]: InjectedMethod2<T[TProperty], TInjected1, TInjected2>
};
type MethodInjectedType3<
    T extends { [ P in TProperty]: (...args: any[]) => any},
    TProperty extends keyof T,
    TInjected1,
    TInjected2,
    TInjected3
> = {
    [P in TProperty]: InjectedMethod3<T[TProperty], TInjected1, TInjected2, TInjected3>
};
type MethodInjectedType4<
    T extends { [ P in TProperty]: (...args: any[]) => any},
    TProperty extends keyof T,
    TInjected1,
    TInjected2,
    TInjected3,
    TInjected4
> = {
    [P in TProperty]: InjectedMethod4<T[TProperty], TInjected1, TInjected2, TInjected3, TInjected4>
};
type MethodInjectedType5<
    T extends { [ P in TProperty]: (...args: any[]) => any},
    TProperty extends keyof T,
    TInjected1,
    TInjected2,
    TInjected3,
    TInjected4,
    TInjected5
> = {
    [P in TProperty]: InjectedMethod5<T[TProperty], TInjected1, TInjected2, TInjected3, TInjected4, TInjected5>
};
type MethodInjectedType6<
    T extends { [ P in TProperty]: (...args: any[]) => any},
    TProperty extends keyof T,
    TInjected1,
    TInjected2,
    TInjected3,
    TInjected4,
    TInjected5,
    TInjected6
> = {
    [P in TProperty]: InjectedMethod6<T[TProperty], TInjected1, TInjected2, TInjected3, TInjected4, TInjected5, TInjected6>
};
type HasPropertyNamesOf<T> = {
    [P in keyof T]: any
};

export { methodInjection, getMethodParameterKey, HasPropertyNamesOf, MethodInjectedType1,
    MethodInjectedType2, MethodInjectedType3, MethodInjectedType4, MethodInjectedType5, MethodInjectedType6 };
