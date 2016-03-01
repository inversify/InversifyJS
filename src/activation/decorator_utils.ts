///<reference path="../interfaces/interfaces.d.ts" />

import "reflect-metadata";

function tagParameter(target: any, targetKey: string, index: number, metadata: IMetadata) {
    let metadataKey = "inversify:tagged";
    let paramsMetadata: Object = null;

    // this decorator can be used in a constructor not a method
    if (targetKey !== undefined) {
        let msg = "The @tagged and @named decorator must be applied to the parameters of a constructor.";
        throw new Error(msg);
    }

    // read metadata if avalible
    if (Reflect.hasOwnMetadata(metadataKey, target) !== true) {
        paramsMetadata = {};
    } else {
        paramsMetadata = Reflect.getMetadata(metadataKey, target);
    }

    // get metadata for the decorated parameter by its index
    let paramMetadata: IMetadata[] = paramsMetadata[index.toString()];
    if (Array.isArray(paramMetadata) !== true) {
        paramMetadata = [];
    } else {
        for (let i = 0; i < paramMetadata.length; i++) {
            let m: IMetadata = paramMetadata[i];
            if (m.key === metadata.key) {
                throw new Error(`Metadadata key ${m.key} was used more than once in a parameter.`);
            }
        }
    }

    // set metadata
    paramMetadata.push(metadata);
    paramsMetadata[index.toString()] = paramMetadata;
    Reflect.defineMetadata(metadataKey, paramsMetadata, target);
    return target;
}

function _decorate(decorators, target) {
    Reflect.decorate(decorators, target);
}

function _param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); };
}

// Allows VanillaJS developers to use decorators:
// decorate(Inject("IFoo", "IBar"), FooBar);
// decorate(ParamNames("foo", "bar"), FooBar);
// decorate(Named("foo"), FooBar, 0);
// decorate(Tagged("bar"), FooBar, 1);
function decorate(
    decorator: (ClassDecorator|ParameterDecorator),
    target: any,
    parameterIndex?: number): void {

    if (typeof parameterIndex === "number") {
        _decorate([_param(parameterIndex, decorator)], target);
    } else {
        _decorate([decorator], target);
    }
}

export { decorate, tagParameter };
