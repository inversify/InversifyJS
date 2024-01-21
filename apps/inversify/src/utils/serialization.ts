import * as ERROR_MSGS from '../constants/error_msgs';
import { interfaces } from '../interfaces/interfaces';

function getServiceIdentifierAsString(serviceIdentifier: interfaces.ServiceIdentifier): string {
  if (typeof serviceIdentifier === 'function') {
    const _serviceIdentifier = serviceIdentifier;
    return _serviceIdentifier.name;
  } else if (typeof serviceIdentifier === 'symbol') {
    return serviceIdentifier.toString();
  } else { // string
    const _serviceIdentifier = serviceIdentifier;
    return _serviceIdentifier as string;
  }
}

function listRegisteredBindingsForServiceIdentifier(
  container: interfaces.Container,
  serviceIdentifier: string,
  getBindings: <T>(
    container: interfaces.Container,
    serviceIdentifier: interfaces.ServiceIdentifier<T>
  ) => interfaces.Binding<T>[]
): string {

  let registeredBindingsList = '';
  const registeredBindings = getBindings(container, serviceIdentifier);

  if (registeredBindings.length !== 0) {

    registeredBindingsList = '\nRegistered bindings:';

    registeredBindings.forEach((binding: interfaces.Binding<unknown>) => {

      // Use 'Object as name of constant value injections'
      let name = 'Object';

      // Use function name if available
      if (binding.implementationType !== null) {
        name = getFunctionName(binding.implementationType as { name: string | null });
      }

      registeredBindingsList = `${registeredBindingsList}\n ${name}`;

      if (binding.constraint.metaData) {
        registeredBindingsList = `${registeredBindingsList} - ${binding.constraint.metaData}`;
      }

    });

  }

  return registeredBindingsList;
}

function alreadyDependencyChain(
  request: interfaces.Request,
  serviceIdentifier: interfaces.ServiceIdentifier
): boolean {
  if (request.parentRequest === null) {
    return false;
  } else if (request.parentRequest.serviceIdentifier === serviceIdentifier) {
    return true;
  } else {
    return alreadyDependencyChain(request.parentRequest, serviceIdentifier);
  }
}

function dependencyChainToString(
  request: interfaces.Request
) {

  function _createStringArr(
    req: interfaces.Request,
    result: string[] = []
  ): string[] {
    const serviceIdentifier = getServiceIdentifierAsString(req.serviceIdentifier);
    result.push(serviceIdentifier);
    if (req.parentRequest !== null) {
      return _createStringArr(req.parentRequest, result);
    }
    return result;
  }

  const stringArr = _createStringArr(request);
  return stringArr.reverse().join(' --> ');

}

function circularDependencyToException(
  request: interfaces.Request
) {
  request.childRequests.forEach((childRequest) => {
    if (alreadyDependencyChain(childRequest, childRequest.serviceIdentifier)) {
      const services = dependencyChainToString(childRequest);
      throw new Error(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${services}`);
    } else {
      circularDependencyToException(childRequest);
    }
  });
}

function listMetadataForTarget(serviceIdentifierString: string, target: interfaces.Target): string {
  if (target.isTagged() || target.isNamed()) {

    let m = '';

    const namedTag = target.getNamedTag();
    const otherTags = target.getCustomTags();

    if (namedTag !== null) {
      m += namedTag.toString() + '\n';
    }

    if (otherTags !== null) {
      otherTags.forEach((tag) => {
        m += tag.toString() + '\n';
      });
    }

    return ` ${serviceIdentifierString}\n ${serviceIdentifierString} - ${m}`;

  } else {
    return ` ${serviceIdentifierString}`;
  }
}


function getFunctionName(func: { name: string | null }): string {
  if (func.name) {
    return func.name;
  } else {
    const name = func.toString();
    const match = name.match(/^function\s*([^\s(]+)/);
    return match ? (match[1] as string) : `Anonymous function: ${name}`;
  }
}

function getSymbolDescription(symbol: Symbol) {
  return symbol.toString().slice(7, -1);
}

export {
  getFunctionName,
  getServiceIdentifierAsString,
  listRegisteredBindingsForServiceIdentifier,
  listMetadataForTarget,
  circularDependencyToException,
  getSymbolDescription
};
