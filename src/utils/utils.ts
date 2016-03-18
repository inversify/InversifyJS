///<reference path="../interfaces/interfaces.d.ts" />

// Composes single-argument functions from right to left. The rightmost
// function can take multiple arguments as it provides the signature for
// the resulting composite function.
function compose(...funcs: ((...args: any[]) => any)[]): ((...args: any[]) => any) {
    return (...args: any[]) => {

        if (funcs.length === 0) {
            return args[0];
        }

        const last = funcs[funcs.length - 1];
        const rest = funcs.slice(0, -1);

        return rest.reduceRight((composed, f) => f(composed), last(...args));
    };
}

function _s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function guid() {
    return `${_s4()}${_s4()}-${_s4()}-${_s4()}-${_s4()}-${_s4()}${_s4()}${_s4()}`;
}

export { compose, guid };
