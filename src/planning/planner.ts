import {
  ClassElementMetadataKind,
  getClassElementMetadataFromLegacyMetadata,
  LegacyTarget as Target,
  LegacyTargetImpl as TargetImpl,
} from '@inversifyjs/core';
import { ClassElementMetadata } from '@inversifyjs/core';

import { BindingCount } from '../bindings/binding_count';
import * as ERROR_MSGS from '../constants/error_msgs';
import { BindingTypeEnum } from '../constants/literal_types';
import * as METADATA_KEY from '../constants/metadata_keys';
import { interfaces } from '../interfaces/interfaces';
import { isStackOverflowException } from '../utils/exceptions';
import {
  circularDependencyToException,
  getServiceIdentifierAsString,
  listMetadataForTarget,
  listRegisteredBindingsForServiceIdentifier,
} from '../utils/serialization';
import { Context } from './context';
import { Metadata } from './metadata';
import { Plan } from './plan';
import {
  getBaseClassDependencyCount,
  getDependencies,
  getFunctionName,
} from './reflection_utils';
import { Request } from './request';

export function getBindingDictionary(
  cntnr: interfaces.Container,
): interfaces.Lookup<interfaces.Binding<unknown>> {
  return (
    cntnr as unknown as {
      _bindingDictionary: interfaces.Lookup<interfaces.Binding<unknown>>;
    }
  )._bindingDictionary;
}

function _createTarget(
  targetType: interfaces.TargetType,
  serviceIdentifier: interfaces.ServiceIdentifier,
  metadata: PlanMetadata,
): interfaces.Target {
  const metadataList: Metadata[] = _getTargetMetadata(
    serviceIdentifier,
    metadata,
  );

  const classElementMetadata: ClassElementMetadata =
    getClassElementMetadataFromLegacyMetadata(metadataList);

  if (classElementMetadata.kind === ClassElementMetadataKind.unmanaged) {
    throw new Error('Unexpected metadata when creating target');
  }

  const target: Target = new TargetImpl('', classElementMetadata, targetType);

  return target;
}

function _getActiveBindings(
  metadataReader: interfaces.MetadataReader,
  avoidConstraints: boolean,
  context: interfaces.Context,
  parentRequest: interfaces.Request | null,
  target: interfaces.Target,
): interfaces.Binding<unknown>[] {
  let bindings: interfaces.Binding[] = getBindings(
    context.container,
    target.serviceIdentifier,
  );
  let activeBindings: interfaces.Binding<unknown>[] = [];

  // automatic binding
  if (
    bindings.length === BindingCount.NoBindingsAvailable &&
    context.container.options.autoBindInjectable === true &&
    typeof target.serviceIdentifier === 'function' &&
    metadataReader.getConstructorMetadata(target.serviceIdentifier)
      .compilerGeneratedMetadata
  ) {
    context.container.bind(target.serviceIdentifier).toSelf();
    bindings = getBindings(context.container, target.serviceIdentifier);
  }

  // multiple bindings available
  if (!avoidConstraints) {
    // apply constraints if available to reduce the number of active bindings
    activeBindings = bindings.filter((binding: interfaces.Binding) => {
      const request: Request = new Request(
        binding.serviceIdentifier,
        context,
        parentRequest,
        binding,
        target,
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
    parentRequest,
    target,
    context.container,
  );

  return activeBindings;
}

function _getTargetMetadata(
  serviceIdentifier: interfaces.ServiceIdentifier,
  metadata: PlanMetadata,
): Metadata[] {
  const metadataKey: string = metadata.isMultiInject
    ? METADATA_KEY.MULTI_INJECT_TAG
    : METADATA_KEY.INJECT_TAG;

  const metadataList: Metadata[] = [
    new Metadata(metadataKey, serviceIdentifier),
  ];

  if (metadata.customTag !== undefined) {
    metadataList.push(
      new Metadata(metadata.customTag.key, metadata.customTag.value),
    );
  }

  if (metadata.isOptional === true) {
    metadataList.push(new Metadata(METADATA_KEY.OPTIONAL_TAG, true));
  }

  return metadataList;
}

function _validateActiveBindingCount(
  serviceIdentifier: interfaces.ServiceIdentifier,
  bindings: interfaces.Binding<unknown>[],
  parentRequest: interfaces.Request | null,
  target: interfaces.Target,
  container: interfaces.Container,
): interfaces.Binding<unknown>[] {
  switch (bindings.length) {
    case BindingCount.NoBindingsAvailable:
      if (target.isOptional()) {
        return bindings;
      } else {
        const serviceIdentifierString: string =
          getServiceIdentifierAsString(serviceIdentifier);
        let msg: string = ERROR_MSGS.NOT_REGISTERED;
        msg += listMetadataForTarget(serviceIdentifierString, target);
        msg += listRegisteredBindingsForServiceIdentifier(
          container,
          serviceIdentifierString,
          getBindings,
        );

        if (parentRequest !== null) {
          msg += `\n${ERROR_MSGS.TRYING_TO_RESOLVE_BINDINGS(getServiceIdentifierAsString(parentRequest.serviceIdentifier))}`;
        }

        throw new Error(msg);
      }

    case BindingCount.OnlyOneBindingAvailable:
      return bindings;
    case BindingCount.MultipleBindingsAvailable:
    default:
      if (!target.isArray()) {
        const serviceIdentifierString: string =
          getServiceIdentifierAsString(serviceIdentifier);
        let msg: string = `${ERROR_MSGS.AMBIGUOUS_MATCH} ${serviceIdentifierString}`;
        msg += listRegisteredBindingsForServiceIdentifier(
          container,
          serviceIdentifierString,
          getBindings,
        );
        throw new Error(msg);
      } else {
        return bindings;
      }
  }
}

function _createSubRequests(
  metadataReader: interfaces.MetadataReader,
  avoidConstraints: boolean,
  serviceIdentifier: interfaces.ServiceIdentifier,
  context: interfaces.Context,
  parentRequest: interfaces.Request | null,
  target: interfaces.Target,
) {
  let activeBindings: interfaces.Binding<unknown>[];
  let childRequest: interfaces.Request;

  if (parentRequest === null) {
    activeBindings = _getActiveBindings(
      metadataReader,
      avoidConstraints,
      context,
      null,
      target,
    );

    childRequest = new Request(
      serviceIdentifier,
      context,
      null,
      activeBindings,
      target,
    );

    const thePlan: Plan = new Plan(context, childRequest);
    context.addPlan(thePlan);
  } else {
    activeBindings = _getActiveBindings(
      metadataReader,
      avoidConstraints,
      context,
      parentRequest,
      target,
    );
    childRequest = parentRequest.addChildRequest(
      target.serviceIdentifier,
      activeBindings,
      target,
    );
  }

  activeBindings.forEach((binding: interfaces.Binding) => {
    let subChildRequest: interfaces.Request | null = null;

    if (target.isArray()) {
      subChildRequest = childRequest.addChildRequest(
        binding.serviceIdentifier,
        binding,
        target,
      );
    } else {
      if (binding.cache !== null) {
        return;
      }
      subChildRequest = childRequest;
    }

    if (
      binding.type === BindingTypeEnum.Instance &&
      binding.implementationType !== null
    ) {
      const dependencies: interfaces.Target[] = getDependencies(
        metadataReader,
        binding.implementationType as NewableFunction,
      );

      if (context.container.options.skipBaseClassChecks !== true) {
        // Throw if a derived class does not implement its constructor explicitly
        // We do this to prevent errors when a base class (parent) has dependencies
        // and one of the derived classes (children) has no dependencies
        const baseClassDependencyCount: number = getBaseClassDependencyCount(
          metadataReader,
          binding.implementationType as NewableFunction,
        );

        if (dependencies.length < baseClassDependencyCount) {
          const error: string = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH(
            getFunctionName(binding.implementationType as NewableFunction),
          );
          throw new Error(error);
        }
      }

      dependencies.forEach((dependency: interfaces.Target) => {
        _createSubRequests(
          metadataReader,
          false,
          dependency.serviceIdentifier,
          context,
          subChildRequest,
          dependency,
        );
      });
    }
  });
}

function getBindings<T>(
  container: interfaces.Container,
  serviceIdentifier: interfaces.ServiceIdentifier<T>,
): interfaces.Binding<T>[] {
  let bindings: interfaces.Binding<T>[] = [];
  const bindingDictionary: interfaces.Lookup<interfaces.Binding> =
    getBindingDictionary(container);

  if (bindingDictionary.hasKey(serviceIdentifier)) {
    bindings = bindingDictionary.get(
      serviceIdentifier,
    ) as interfaces.Binding<T>[];
  } else if (container.parent !== null) {
    // recursively try to get bindings from parent container
    bindings = getBindings<T>(container.parent, serviceIdentifier);
  }

  return bindings;
}

export interface PlanMetadata {
  isMultiInject: boolean;
  isOptional?: boolean;
  customTag?: {
    key: string | number | symbol;
    value?: unknown;
  };
}

export function plan(
  metadataReader: interfaces.MetadataReader,
  container: interfaces.Container,
  targetType: interfaces.TargetType,
  serviceIdentifier: interfaces.ServiceIdentifier,
  metadata: PlanMetadata,
  avoidConstraints: boolean = false,
): interfaces.Context {
  const context: Context = new Context(container);
  const target: interfaces.Target = _createTarget(
    targetType,
    serviceIdentifier,
    metadata,
  );

  try {
    _createSubRequests(
      metadataReader,
      avoidConstraints,
      serviceIdentifier,
      context,
      null,
      target,
    );
    return context;
  } catch (error) {
    if (isStackOverflowException(error)) {
      circularDependencyToException(context.plan.rootRequest);
    }
    throw error;
  }
}

export function createMockRequest(
  container: interfaces.Container,
  serviceIdentifier: interfaces.ServiceIdentifier,
  metadata: PlanMetadata,
): interfaces.Request {
  const metadataList: Metadata[] = _getTargetMetadata(
    serviceIdentifier,
    metadata,
  );

  const classElementMetadata: ClassElementMetadata =
    getClassElementMetadataFromLegacyMetadata(metadataList);

  if (classElementMetadata.kind === ClassElementMetadataKind.unmanaged) {
    throw new Error('Unexpected metadata when creating target');
  }

  const target: Target = new TargetImpl('', classElementMetadata, 'Variable');

  const context: Context = new Context(container);
  const request: Request = new Request(
    serviceIdentifier,
    context,
    null,
    [],
    target,
  );
  return request;
}
