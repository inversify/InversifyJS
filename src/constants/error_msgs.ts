export const DUPLICATED_INJECTABLE_DECORATOR: string =
  'Cannot apply @injectable decorator multiple times.';
export const DUPLICATED_METADATA: string =
  'Metadata key was used more than once in a parameter:';
export const NULL_ARGUMENT: string = 'NULL argument';
export const KEY_NOT_FOUND: string = 'Key Not Found';
export const AMBIGUOUS_MATCH: string =
  'Ambiguous match found for serviceIdentifier:';
export const CANNOT_UNBIND: string = 'Could not unbind serviceIdentifier:';
export const NOT_REGISTERED: string =
  'No matching bindings found for serviceIdentifier:';
export const MISSING_INJECTABLE_ANNOTATION: string =
  'Missing required @injectable annotation in:';
export const MISSING_INJECT_ANNOTATION: string =
  'Missing required @inject or @multiInject annotation in:';
export const UNDEFINED_INJECT_ANNOTATION: (name: string) => string = (
  name: string,
) =>
  `@inject called with undefined this could mean that the class ${name} has ` +
  'a circular dependency problem. You can use a LazyServiceIdentifer to ' +
  'overcome this limitation.';
export const CIRCULAR_DEPENDENCY: string = 'Circular dependency found:';
export const NOT_IMPLEMENTED: string =
  'Sorry, this feature is not fully implemented yet.';
export const INVALID_BINDING_TYPE: string = 'Invalid binding type:';
export const NO_MORE_SNAPSHOTS_AVAILABLE: string =
  'No snapshot available to restore.';
export const INVALID_MIDDLEWARE_RETURN: string =
  'Invalid return type in middleware. Middleware must return!';
export const INVALID_FUNCTION_BINDING: string =
  'Value provided to function binding must be a function!';
export const LAZY_IN_SYNC: (key: unknown) => string = (key: unknown) =>
  `You are attempting to construct ${keyToString(key)} in a synchronous way ` +
  'but it has asynchronous dependencies.';

export const INVALID_TO_SELF_VALUE: string =
  'The toSelf function can only be applied when a constructor is ' +
  'used as service identifier';

export const INVALID_DECORATOR_OPERATION: string =
  'The @inject @multiInject @tagged and @named decorators ' +
  'must be applied to the parameters of a class constructor or a class property.';

export const ARGUMENTS_LENGTH_MISMATCH: (name: string) => string = (
  name: string,
) =>
  'The number of constructor arguments in the derived class ' +
  `${name} must be >= than the number of constructor arguments of its base class.`;

export const CONTAINER_OPTIONS_MUST_BE_AN_OBJECT: string =
  'Invalid Container constructor argument. Container options ' +
  'must be an object.';

export const CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE: string =
  'Invalid Container option. Default scope must ' +
  'be a string ("singleton" or "transient").';

export const CONTAINER_OPTIONS_INVALID_AUTO_BIND_INJECTABLE: string =
  'Invalid Container option. Auto bind injectable must ' + 'be a boolean';

export const CONTAINER_OPTIONS_INVALID_SKIP_BASE_CHECK: string =
  'Invalid Container option. Skip base check must ' + 'be a boolean';

export const MULTIPLE_PRE_DESTROY_METHODS: string =
  'Cannot apply @preDestroy decorator multiple times in the same class';
export const MULTIPLE_POST_CONSTRUCT_METHODS: string =
  'Cannot apply @postConstruct decorator multiple times in the same class';
export const ASYNC_UNBIND_REQUIRED: string =
  'Attempting to unbind dependency with asynchronous destruction (@preDestroy or onDeactivation)';
export const POST_CONSTRUCT_ERROR: (
  clazz: string,
  errorMessage: string,
) => string = (clazz: string, errorMessage: string): string =>
  `@postConstruct error in class ${clazz}: ${errorMessage}`;
export const PRE_DESTROY_ERROR: (
  clazz: string,
  errorMessage: string,
) => string = (clazz: string, errorMessage: string): string =>
  `@preDestroy error in class ${clazz}: ${errorMessage}`;
export const ON_DEACTIVATION_ERROR: (
  clazz: string,
  errorMessage: string,
) => string = (clazz: string, errorMessage: string): string =>
  `onDeactivation() error in class ${clazz}: ${errorMessage}`;

export const CIRCULAR_DEPENDENCY_IN_FACTORY: (
  factoryType: string,
  serviceIdentifier: string,
) => string = (factoryType: string, serviceIdentifier: string): string =>
  `It looks like there is a circular dependency in one of the '${factoryType}' bindings. Please investigate bindings with ` +
  `service identifier '${serviceIdentifier}'.`;

export const STACK_OVERFLOW: string = 'Maximum call stack size exceeded';

function keyToString(key: unknown): string {
  if (typeof key === 'function') {
    return `[function/class ${key.name || '<anonymous>'}]`;
  }
  if (typeof key === 'symbol') {
    return key.toString();
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `'${key}'`;
}
