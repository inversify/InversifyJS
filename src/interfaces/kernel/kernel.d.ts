///<reference path="../interfaces.d.ts" />

interface IKernel {
  bind(typeBinding: IBinding<any>): void;
  unbind(runtimeIdentifier: string): void;
  unbindAll(): void;
  get<Service>(runtimeIdentifier: string): Service;
  getAll<Service>(runtimeIdentifier: string): Service[];
}
