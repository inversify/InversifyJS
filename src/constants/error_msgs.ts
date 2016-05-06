///<reference path="../interfaces/interfaces.d.ts" />

export const DUPLICATED_INJECTABLE_DECORATOR = "Cannot apply @injectable decorator multiple times.";
export const DUPLICATED_METADATA = "Metadadata key was used more than once in a parameter:";
export const NULL_ARGUMENT = "NULL argument";
export const KEY_NOT_FOUND = "Key Not Found";
export const AMBIGUOUS_MATCH = "Ambiguous match found for serviceIdentifier:";
export const CANNOT_UNBIND = "Could not unbind serviceIdentifier:";
export const NOT_REGISTERED = "No bindings found for serviceIdentifier:";
export const MISSING_INJECTABLE_ANNOTATION = "Missing required @injectable annotation in:";
export const MISSING_INJECT_ANNOTATION = "Missing required @inject or @multiInject annotation in:";
export const CIRCULAR_DEPENDENCY = "Circular dependency found between services:";
export const NOT_IMPLEMENTED = "Sorry, this feature is not fully implemented yet.";
export const INVALID_BINDING_TYPE = "Invalid binding type:";
export const MISSING_EXPLICIT_CONSTRUCTOR = "Derived class must explicitly declare its constructor:";
export const INVALID_DECORATOR_OPERATION = "The @inject @multiInject @tagged and @named decorators " +
    "must be applied to the parameters of a class constructor or a class property.";
