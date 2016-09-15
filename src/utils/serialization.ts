import interfaces from "../interfaces/interfaces";
import { getFunctionName } from "./utils";
import * as ERROR_MSGS from "../constants/error_msgs";

function getServiceIdentifierAsString(serviceIdentifier: interfaces.ServiceIdentifier<any>): string {
    if (typeof serviceIdentifier === "function") {
        let _serviceIdentifier: any = serviceIdentifier;
        return _serviceIdentifier.name;
    } else if (typeof serviceIdentifier === "symbol") {
        return serviceIdentifier.toString();
    } else { // string
        let _serviceIdentifier: any = serviceIdentifier;
        return _serviceIdentifier;
    }
}

function listRegisteredBindingsForServiceIdentifier(
    kernel: interfaces.Kernel,
    serviceIdentifier: string
): string {

    let registeredBindingsList = "";
    let registeredBindings = (<any>kernel)._planner.getBindings(kernel, serviceIdentifier);

    if (registeredBindings.length !== 0) {

        registeredBindingsList = `\nRegistered bindings:`;

        registeredBindings.forEach((binding: interfaces.Binding<any>) => {

            // Use "Object as name of constant value injections"
            let name = "Object";

            // Use function name if available
            if (binding.implementationType !== null) {
                name = getFunctionName(binding.implementationType);
            }

            registeredBindingsList = `${registeredBindingsList}\n ${name}`;

            if (binding.constraint.metaData) {
                registeredBindingsList = `${registeredBindingsList} - ${binding.constraint.metaData}`;
            }

        });

    }

    return registeredBindingsList;
}

function circularDependencyToException(
    request: interfaces.Request,
    previousServiceIdentifiers: interfaces.ServiceIdentifier<any>[] = []
) {

    // Add to list so we know that we have already visit this node in the request tree
    let parentServiceIdentifier = getServiceIdentifierAsString(request.serviceIdentifier);
    previousServiceIdentifiers.push(parentServiceIdentifier);

    // iterate child requests
    request.childRequests.forEach((childRequest) => {

        // the service identifier of a child request
        let childServiceIdentifier = getServiceIdentifierAsString(childRequest.serviceIdentifier);

        // check if the child request has been already visited
        if (previousServiceIdentifiers.indexOf(childServiceIdentifier) === -1) {

            if (childRequest.childRequests.length > 0) {
                // use recursion to continue traversing the request tree
                circularDependencyToException(childRequest, previousServiceIdentifiers);
            } else {
                // the node has no child so we add it to list to know that we have already visit this node
                previousServiceIdentifiers.push(childServiceIdentifier);
            }

        } else {

            // create description of circular dependency
            previousServiceIdentifiers.push(childServiceIdentifier);

            let services = previousServiceIdentifiers.reduce((prev, curr) => {
                return (prev !== "") ? `${prev} -> ${curr}` : `${curr}`;
            }, "");

            // throw when we have already visit this node in the request tree
            throw new Error(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${services}`);

        }

    });

}

export { getServiceIdentifierAsString, listRegisteredBindingsForServiceIdentifier, circularDependencyToException };
