import interfaces from "../interfaces/interfaces";
import { getFunctionName } from "./utils";

function getServiceIdentifierAsString(serviceIdentifier: interfaces.ServiceIdentifier<any>): string {
    let type = typeof serviceIdentifier;
    if (type === "function") {
        let _serviceIdentifier: any = serviceIdentifier;
        return _serviceIdentifier.name;
    } else if (type === "symbol") {
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

export { getServiceIdentifierAsString, listRegisteredBindingsForServiceIdentifier};
