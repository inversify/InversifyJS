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
        injectableMethodParameter.metadata.forEach((m) => {
            if (m.key === METADATA_KEY.MULTI_INJECT_TAG) {
                isMulti = true;
                serviceIdentifier = m.value;
            } else if (m.key === METADATA_KEY.INJECT_TAG) {
                serviceIdentifier = m.value;
            } else {
                metadata = m;
            }
        });
        return _getContainerGet(serviceIdentifier, isMulti, metadata, container);
}
function _getContainerGet(
    serviceIdentifier: interfaces.ServiceIdentifier<any>,
    isMulti: boolean,
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
function _mapInjectableMethodParametersToContainerGets(
    injectableMethodParameters: InjectableMethodParameter[],
    container: interfaces.Container) {
    const parameterGets: (() => any)[] = injectableMethodParameters.reverse().map((imp) => {
        return _resolveInjectableMethodParameter(imp, container);
    });
    return parameterGets;
}

function _injectMethod(instance: any, methodName: string, parameterGets: (() => any)[]) {
    const originalMethod: Function = instance[methodName];
    instance[methodName] = function() {
        let args: any[] = Array.prototype.slice.call(arguments);
        args = args.concat(parameterGets.map((pg) => pg()));
        return originalMethod.call(instance, ...args);
    }.bind(instance); //no need to bind
}
function methodInjection(container: interfaces.Container, ctor: interfaces.Newable<any>, instance: any) {
    const injectableMethods = _getInjectableMethods(ctor.prototype, (container as any)._metadataReader as interfaces.MetadataReader);
    injectableMethods.forEach((imps, methodName) => {
        const parameterGets: (() => any)[] = _mapInjectableMethodParametersToContainerGets(imps, container);
        _injectMethod(instance, methodName, parameterGets);
    });
}
function getMethodParameterKey(methodName: string, parameterIndex: number) {
    return `*!?_${methodName}_*!?_${parameterIndex!.toString()}`;
}
export { methodInjection, getMethodParameterKey };
