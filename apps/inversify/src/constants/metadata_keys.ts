// Used for named bindings
export const NAMED_TAG = 'named';

// The name of the target at design time
export const NAME_TAG = 'name';

// The for unmanaged injections (in base classes when using inheritance)
export const UNMANAGED_TAG = 'unmanaged';

// The for optional injections
export const OPTIONAL_TAG = 'optional';

// The type of the binding at design time
export const INJECT_TAG = 'inject';

// The type of the binding at design type for multi-injections
export const MULTI_INJECT_TAG = 'multi_inject';

// used to store constructor arguments tags
export const TAGGED = 'inversify:tagged';

// used to store class properties tags
export const TAGGED_PROP = 'inversify:tagged_props';

// used to store types to be injected
export const PARAM_TYPES = 'inversify:paramtypes';

// used to access design time types
export const DESIGN_PARAM_TYPES = 'design:paramtypes';

// used to identify postConstruct functions
export const POST_CONSTRUCT = 'post_construct';

// used to identify preDestroy functions
export const PRE_DESTROY = 'pre_destroy';

function getNonCustomTagKeys(): string[] {
  return [
    INJECT_TAG,
    MULTI_INJECT_TAG,
    NAME_TAG,
    UNMANAGED_TAG,
    NAMED_TAG,
    OPTIONAL_TAG,
  ];
}

export const NON_CUSTOM_TAG_KEYS: string[] = getNonCustomTagKeys();
