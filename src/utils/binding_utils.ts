import { interfaces } from "../inversify";

export const multiBindToService = (container: interfaces.Container) =>
    (service: interfaces.ServiceIdentifier<any>) =>
        (...types: interfaces.ServiceIdentifier<any>[]) =>
            types.forEach((t) => container.bind(t).toService(service));
