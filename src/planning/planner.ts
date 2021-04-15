import { BindingCount } from '../bindings/binding_count';
import { Context } from './context';
import { Metadata } from './metadata';
import { Plan } from './plan';
import { Request } from './request';
import { Target } from './target';

import { circularDependencyToException, getServiceIdentifierAsString, listMetadataForTarget, listRegisteredBindingsForServiceIdentifier } from '../utils/serialization';
import { isStackOverflowExeption } from '../utils/exceptions';
import { getBaseClassDependencyCount, getDependencies, getFunctionName } from './reflection_utils';

import { BindingTypeEnum, TargetTypeEnum } from '../constants/literal_types';
import { INJECT_TAG, MULTI_INJECT_TAG } from '../constants/metadata_keys';
import { NOT_REGISTERED, AMBIGUOUS_MATCH, ARGUMENTS_LENGTH_MISMATCH } from '../constants/error_msgs';

import { Binding, Container, Lookup, MetadataReader, ServiceIdentifier, TargetType } from '../interfaces/interfaces';

function getBindingDictionary<T>(
  container: Container
): Lookup<Binding<T>> {
  return container.getBindingDictionary<T>();
}

function _createTarget(
  isMultiInject: boolean,
  targetType: TargetType,
  serviceIdentifier: ServiceIdentifier<string | symbol>,
  name: string,
  key?: string | number | symbol,
  value?: unknown
): Target {
  const injectMetadata = new Metadata(
    isMultiInject ? MULTI_INJECT_TAG : INJECT_TAG,
    serviceIdentifier
  );

  const target = new Target(
    targetType,
    name,
    serviceIdentifier,
    injectMetadata
  );

  if (key !== undefined) {
    const tagMetadata = new Metadata(key, value);
    target.metadata.push(tagMetadata);
  }

  return target;
}

function _getActiveBindings(
  metadataReader: MetadataReader,
  avoidConstraints: boolean,
  context: Context,
  parentRequest: Request | null,
  target: Target
): Binding<ServiceIdentifier<string | symbol>>[] {
  let bindings = getBindings(
    context.container,
    target.serviceIdentifier
  );
  let activeBindings = [];

  // automatic binding
  if (
    bindings.length === BindingCount.NoBindingsAvailable &&
    context.container.options.autoBindInjectable &&
    typeof target.serviceIdentifier === 'function' &&
    metadataReader.getConstructorMetadata(target.serviceIdentifier).
      compilerGeneratedMetadata
  ) {
    context.container.bind(target.serviceIdentifier).toSelf();
    bindings = getBindings(
      context.container,
      target.serviceIdentifier
    );
  }

  // multiple bindings available
  if (!avoidConstraints) {
    // apply constraints if available to reduce the number of active bindings
    activeBindings = bindings.filter((binding) => {
      const request = new Request(
        binding.serviceIdentifier,
        context,
        parentRequest,
        binding,
        target
      );

      return binding.constraint(request);
    });
  } else {
    // simple injection or multi-injection without constraints
    activeBindings = bindings;
  }

  // validate active bindings
  _validateActiveBindingCount(
    target.serviceIdentifier,
    activeBindings,
    target,
    context.container
  );

  return activeBindings;
}

function _validateActiveBindingCount(
  serviceIdentifier: ServiceIdentifier<unknown>,
  bindings: Binding<unknown>[],
  target: Target,
  container: Container
): Binding<unknown>[] {
  switch (bindings.length) {
    case BindingCount.NoBindingsAvailable:
      if (target.isOptional()) {
        return bindings;
      } else {
        const serviceIdentifierString = getServiceIdentifierAsString(
          serviceIdentifier)
          ;
        let msg = NOT_REGISTERED;
        msg += listMetadataForTarget(serviceIdentifierString, target);
        msg += listRegisteredBindingsForServiceIdentifier(
          container,
          serviceIdentifierString,
          getBindings
        );
        throw new Error(msg);
      }

    case BindingCount.OnlyOneBindingAvailable:
      if (!target.isArray()) {
        return bindings;
      }

    case BindingCount.MultipleBindingsAvailable:
    default:
      if (!target.isArray()) {
        const serviceIdentifierString = getServiceIdentifierAsString(
          serviceIdentifier
        );
        let msg = `${AMBIGUOUS_MATCH} ${serviceIdentifierString}`;
        msg += listRegisteredBindingsForServiceIdentifier(
          container,
          serviceIdentifierString,
          getBindings
        );
        throw new Error(msg);
      } else {
        return bindings;
      }
  }
}

function _createSubRequests(
  metadataReader: MetadataReader,
  avoidConstraints: boolean,
  serviceIdentifier: ServiceIdentifier<unknown>,
  context: Context,
  parentRequest: Request | null,
  target: Target
) {
  let activeBindings = [];
  let childRequest: Request;

  if (parentRequest === null) {
    activeBindings = _getActiveBindings(
      metadataReader,
      avoidConstraints,
      context,
      null,
      target
    );

    childRequest = new Request(
      serviceIdentifier,
      context, null,
      activeBindings,
      target
    );

    const thePlan = new Plan(context, childRequest);
    context.addPlan(thePlan);
  } else {
    activeBindings = _getActiveBindings(
      metadataReader,
      avoidConstraints,
      context,
      parentRequest,
      target
    );
    childRequest = parentRequest.addChildRequest(
      target.serviceIdentifier,
      activeBindings,
      target
    );
  }

  activeBindings.forEach((binding) => {
    let subChildRequest: Request | null = null;

    if (target.isArray()) {
      subChildRequest = childRequest.addChildRequest(
        binding.serviceIdentifier,
        binding,
        target
      );
    } else {
      if (binding.cache) {
        return;
      }
      subChildRequest = childRequest;
    }

    if (
      binding.type === BindingTypeEnum.Instance &&
      binding.implementationType !== null
    ) {
      const dependencies = getDependencies(
        metadataReader,
        binding.implementationType
      );

      if (!context.container.options.skipBaseClassChecks) {
        // Throw if a derived class does not implement its constructor explicitly
        // We do this to prevent errors when a base class (parent) has dependencies
        // and one of the derived classes (children) has no dependencies
        const baseClassDependencyCount = getBaseClassDependencyCount(
          metadataReader,
          binding.implementationType
        );

        if (dependencies.length < baseClassDependencyCount) {
          const error = ARGUMENTS_LENGTH_MISMATCH(
            getFunctionName(binding.implementationType)
          );
          throw new Error(error);
        }
      }

      dependencies.forEach((dependency: Target) => {
        _createSubRequests(
          metadataReader,
          false,
          dependency.serviceIdentifier,
          context,
          subChildRequest,
          dependency
        );
      });
    }
  });
}

function getBindings<T>(
  container: Container,
  serviceIdentifier: ServiceIdentifier<T>
): Binding<T>[] {
  let bindings: Binding<T>[] = [];
  const bindingDictionary = getBindingDictionary<T>(container);

  if (bindingDictionary.hasKey(serviceIdentifier)) {
    bindings = bindingDictionary.get(serviceIdentifier);
  } else if (container.parent !== null) {
    // recursively try to get bindings from parent container
    bindings = getBindings<T>(container.parent, serviceIdentifier);
  }

  return bindings;
}

function plan(
  metadataReader: MetadataReader,
  container: Container,
  isMultiInject: boolean,
  targetType: TargetType,
  serviceIdentifier: ServiceIdentifier<string | symbol>,
  key?: string | number | symbol,
  value?: unknown,
  avoidConstraints = false
): Context {
  const context = new Context(container);
  const target = _createTarget(
    isMultiInject,
    targetType,
    serviceIdentifier,
    '',
    key,
    value
  );

  try {
    _createSubRequests(
      metadataReader,
      avoidConstraints,
      serviceIdentifier,
      context,
      null,
      target
    );
    return context;
  } catch (error) {
    if (isStackOverflowExeption(error)) {
      if (context.plan) {
        circularDependencyToException(context.plan.rootRequest);
      }
    }
    throw error;
  }
}

function createMockRequest(
  container: Container,
  serviceIdentifier: ServiceIdentifier<string | symbol>,
  key: string | number | symbol,
  value: unknown
): Request {
  const target = new Target(
    TargetTypeEnum.Variable, '',
    serviceIdentifier,
    new Metadata(key, value)
  );
  const context = new Context(container);
  const request = new Request(serviceIdentifier, context, null, [], target);
  return request;
}

export { plan, createMockRequest, getBindingDictionary };
