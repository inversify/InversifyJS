///<reference path="./interfaces.d.ts" />
// Inject (Annotation)
// ------

// To allow developers using Inversify to mark arguments with the
// type they should resolve to we need to provide a way for them to do
// this so that they can name their arguments as they please
// and inject multiple dependencies of the same type

// This should be used in the following way where "IB" has
// been bound to the kernel to a class that extends IB
// import { Inject } from "inversify";
// class A {
//    constructor (@Inject("IB") be: IB) { ... }
// }
let Inject = function (typeIdentifier: string) {

  //return a argument annotation resolver to mark
  //the constructor with the types that should
  //be resolved by Inversify
  return (typeConstructor: InjectableConstructorInterface, propertyName: string, argumentIndex: number) => {

      //if the pre-annotation argument types have not been resolved
      //then resolve them to the argument names
      if (!typeConstructor.argumentTypes) {
         // Regular expressions used to get a list containing
         // the names of the arguments of a function
         let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
         let ARGUMENT_NAMES = /([^\s,]+)/g;

         let constructorString = typeConstructor.toString().replace(STRIP_COMMENTS, "");
         let argumentsStartIndex = constructorString.indexOf("(") + 1;
         let argumentsEndIndex = constructorString.indexOf(")");

         //attach information to the constructor
         typeConstructor.argumentTypes = constructorString.slice(argumentsStartIndex, argumentsEndIndex).match(ARGUMENT_NAMES);
      }

      //replace the argument name with the annotated type
      typeConstructor.argumentTypes[argumentIndex] = typeIdentifier;
  };
};

export { Inject };
