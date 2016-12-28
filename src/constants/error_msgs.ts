export const DUPLICATED_INJECTABLE_DECORATOR = "Cannot apply @injectable decorator multiple times.";
export const DUPLICATED_METADATA = "Metadata key was used more than once in a parameter:";
export const NULL_ARGUMENT = "NULL argument";
export const KEY_NOT_FOUND = "Key Not Found";
export const AMBIGUOUS_MATCH = "Ambiguous match found for serviceIdentifier:";
export const CANNOT_UNBIND = "Could not unbind serviceIdentifier:";
export const NOT_REGISTERED = "No matching bindings found for serviceIdentifier:";
export const MISSING_INJECTABLE_ANNOTATION = "Missing required @injectable annotation in:";
export const MISSING_INJECT_ANNOTATION = "Missing required @inject or @multiInject annotation in:";
export const CIRCULAR_DEPENDENCY = "Circular dependency found:";
export const NOT_IMPLEMENTED = "Sorry, this feature is not fully implemented yet.";
export const INVALID_BINDING_TYPE = "Invalid binding type:";
export const NO_MORE_SNAPSHOTS_AVAILABLE = "No snapshot available to restore.";
export const INVALID_MIDDLEWARE_RETURN = "Invalid return type in middleware. Middleware must return!";
export const INVALID_FUNCTION_BINDING = "Value provided to function binding must be a function!";

export const INVALID_TO_SELF_VALUE = "The toSelf function can only be applied when a constructor is " +
    "used as service identifier";

export const INVALID_DECORATOR_OPERATION = "The @inject @multiInject @tagged and @named decorators " +
    "must be applied to the parameters of a class constructor or a class property.";

export const ARGUMENTS_LENGTH_MISMATCH_1 = "The number of constructor arguments in the derived class ";
export const ARGUMENTS_LENGTH_MISMATCH_2 = " must be >= than the number of constructor arguments of its base class.";

export const CONTAINER_OPTIONS_MUST_BE_AN_OBJECT = "Invalid Container constructor argument. Container options " +
    "must be an object.";

export const CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE = "Invalid Container option. Default scope must " +
    "be a string ('singleton' or 'transient').";

export const INVALID_BINDING_PROPERTY = "TODO";
