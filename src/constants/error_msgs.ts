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
export const NO_MORE_SNAPSHOTS_AVAILABLE = "No snapshot available to restore.";
export const INVALID_MIDDLEWARE_RETURN = "Invalid return type in middleware. Return must be an Array!";
export const INVALID_FUNCTION_BINDING = "Value provided to function binding must be a function!";

export const INVALID_DECORATOR_OPERATION = "The @inject @multiInject @tagged and @named decorators " +
    "must be applied to the parameters of a class constructor or a class property.";

export const ARGUMENTS_LENGTH_MISMATCH_1 = "The number of constructor arguments in the derived class ";
export const ARGUMENTS_LENGTH_MISMATCH_2 = " must be >= than the number of constructor arguments of its base class.";

// TODO REMOVE
export const MISSING_EXPLICIT_CONSTRUCTOR = "Derived class must explicitly declare its constructor:";
