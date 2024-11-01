import * as ERROR_MSGS from '../constants/error_msgs';
import { interfaces } from '../interfaces/interfaces';

function getServiceIdentifierAsString(
  serviceIdentifier: interfaces.ServiceIdentifier,
): string {
  if (typeof serviceIdentifier === 'function') {
    return serviceIdentifier.name;
  } else if (typeof serviceIdentifier === 'symbol') {
    return serviceIdentifier.toString();
  } else {
    return serviceIdentifier as string;
  }
}

function listRegisteredBindingsForServiceIdentifier(
  container: interfaces.Container,
  serviceIdentifier: string,
  getBindings: <T>(
    container: interfaces.Container,
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
  ) => interfaces.Binding<T>[],
): string {
  let registeredBindingsList: string = '';
  const registeredBindings: interfaces.Binding<unknown>[] = getBindings(
    container,
    serviceIdentifier,
  );

  if (registeredBindings.length !== 0) {
    registeredBindingsList = '\nRegistered bindings:';

    registeredBindings.forEach((binding: interfaces.Binding<unknown>) => {
      // Use 'Object as name of constant value injections'
      let name: string = 'Object';

      // Use function name if available
      if (binding.implementationType !== null) {
        name = getFunctionName(
          binding.implementationType as { name: string | null },
        );
      }

      registeredBindingsList = `${registeredBindingsList}\n ${name}`;

      if (binding.constraint.metaData) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        registeredBindingsList = `${registeredBindingsList} - ${binding.constraint.metaData}`;
      }
    });
  }

  return registeredBindingsList;
}

function alreadyDependencyChain(
  request: interfaces.Request,
  serviceIdentifier: interfaces.ServiceIdentifier,
): boolean {
  if (request.parentRequest === null) {
    return false;
  } else if (request.parentRequest.serviceIdentifier === serviceIdentifier) {
    return true;
  } else {
    return alreadyDependencyChain(request.parentRequest, serviceIdentifier);
  }
}

function dependencyChainToString(request: interfaces.Request) {
  function _createStringArr(
    req: interfaces.Request,
    result: string[] = [],
  ): string[] {
    const serviceIdentifier: string = getServiceIdentifierAsString(
      req.serviceIdentifier,
    );
    result.push(serviceIdentifier);
    if (req.parentRequest !== null) {
      return _createStringArr(req.parentRequest, result);
    }
    return result;
  }

  const stringArr: string[] = _createStringArr(request);
  return stringArr.reverse().join(' --> ');
}

function circularDependencyToException(request: interfaces.Request) {
  request.childRequests.forEach((childRequest: interfaces.Request) => {
    if (alreadyDependencyChain(childRequest, childRequest.serviceIdentifier)) {
      const services: string = dependencyChainToString(childRequest);
      throw new Error(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${services}`);
    } else {
      circularDependencyToException(childRequest);
    }
  });
}

function listMetadataForTarget(
  serviceIdentifierString: string,
  target: interfaces.Target,
): string {
  if (target.isTagged() || target.isNamed()) {
    let m: string = '';

    const namedTag: interfaces.Metadata<string> | null = target.getNamedTag();
    const otherTags: interfaces.Metadata<unknown>[] | null =
      target.getCustomTags();

    if (namedTag !== null) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      m += namedTag.toString() + '\n';
    }

    if (otherTags !== null) {
      otherTags.forEach((tag: interfaces.Metadata) => {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        m += tag.toString() + '\n';
      });
    }

    return ` ${serviceIdentifierString}\n ${serviceIdentifierString} - ${m}`;
  } else {
    return ` ${serviceIdentifierString}`;
  }
}

function getFunctionName(func: { name: string | null | undefined }): string {
  if (func.name != null && func.name !== '') {
    return func.name;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const name: string = func.toString();
    const match: RegExpMatchArray | null = name.match(/^function\s*([^\s(]+)/);
    return match === null
      ? `Anonymous function: ${name}`
      : (match[1] as string);
  }
}

function getSymbolDescription(symbol: symbol) {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return symbol.toString().slice(7, -1);
}

export {
  getFunctionName,
  getServiceIdentifierAsString,
  listRegisteredBindingsForServiceIdentifier,
  listMetadataForTarget,
  circularDependencyToException,
  getSymbolDescription,
};
