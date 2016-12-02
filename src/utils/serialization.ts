import { interfaces } from "../interfaces/interfaces";
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
    container: interfaces.Container,
    serviceIdentifier: string,
    getBindings: <T>(
        container: interfaces.Container,
        serviceIdentifier: interfaces.ServiceIdentifier<T>
    ) => interfaces.Binding<T>[]
): string {

    let registeredBindingsList = "";
    let registeredBindings = getBindings(container, serviceIdentifier);

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

function listMetadataForTarget(serviceIdentifierString: string, target: interfaces.Target): string {
    if (target.isTagged() || target.isNamed()) {

        let m = "";

        let namedTag = target.getNamedTag();
        let otherTags = target.getCustomTags();

        if (namedTag !== null) {
            m += namedTag.toString() + "\n";
        }

        if (otherTags !== null) {
            otherTags.forEach((tag) => {
                m += tag.toString() + "\n";
            });
        }

        return ` ${serviceIdentifierString}\n ${serviceIdentifierString} - ${m}`;

    } else {
        return ` ${serviceIdentifierString}`;
    }
}

function getFunctionName(v: any): string {
    if (v.name) {
        return v.name;
    } else {
        let name = v.toString();
        let match = name.match(/^function\s*([^\s(]+)/);
        return match ? match[1] : `Anonymous function: ${name}`;
    }
}

export {
    getFunctionName,
    getServiceIdentifierAsString,
    listRegisteredBindingsForServiceIdentifier,
    listMetadataForTarget,
    circularDependencyToException
};
