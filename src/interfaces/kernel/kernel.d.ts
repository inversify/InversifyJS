///<reference path="../interfaces.d.ts" />

interface IKernel {
  bind<T>(runtimeIdentifier: string): IBindingToSyntax<T>;
  unbind(runtimeIdentifier: string): void;
  unbindAll(): void;
  get<Service>(runtimeIdentifier: string): Service;
  getAll<Service>(runtimeIdentifier: string): Service[];
}
