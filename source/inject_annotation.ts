let Inject = function (typeIdentifier: string) {
    return function (target: InjectableConstructorInterface, propertyName: string, argumentIndex: number) {
        if (!target.argumentTypes) {
           // Regular expressions used to get a list containing
           // the names of the arguments of a function
           let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
           let ARGUMENT_NAMES = /([^\s,]+)/g;

           let fnStr = target.toString().replace(STRIP_COMMENTS, '');
           let argsInit = fnStr.indexOf('(') + 1;
           let argsEnd = fnStr.indexOf(')');

           target.argumentTypes = fnStr.slice(argsInit, argsEnd).match(ARGUMENT_NAMES);
        }

        target.argumentTypes[argumentIndex] = typeIdentifier;
    };
};

interface InjectableConstructorInterface {
    argumentTypes: Array<string>;
}

export { Inject };
