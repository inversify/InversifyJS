import { interfaces } from '../inversify';

export const multiBindToService = (container: interfaces.Container) => (
	service: interfaces.ServiceIdentifier<unknown>
) => (...types: interfaces.ServiceIdentifier<unknown>[]) => types.forEach((t) => container.bind(t).toService(service));
