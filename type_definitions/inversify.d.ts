// Type definitions for inversify 1.2.2
// Project: https://github.com/inversify/InversifyJS
// Definitions by: inversify <https://github.com/inversify>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare namespace __inversify {

  interface BindingInterface<TServiceType> {
    runtimeIdentifier: string;
    implementationType: { new(): TServiceType ; };
    cache: TServiceType;
    scope: number; // TypeBindingScopeEnum
  }

  interface KernelInterface {
    bind(typeBinding: BindingInterface<any>): void;
    unbind(runtimeIdentifier: string): void;
    unbindAll(): void;
    get<Service>(runtimeIdentifier: string): Service;
  }

  export enum BindingScope {
      Transient = 0,
      Singleton = 1,
  }

  export class Binding<TServiceType> implements BindingInterface<TServiceType> {
      public runtimeIdentifier: string;
      public implementationType: {
          new (): TServiceType;
      };
      public cache: TServiceType;
      public scope: BindingScope;
      constructor(runtimeIdentifier: string, implementationType: {
          new (...args: any[]): TServiceType;
      }, scopeType?: BindingScope);
  }

  export class Kernel implements KernelInterface {
      public bind(typeBinding: BindingInterface<any>): void;
      public unbind(runtimeIdentifier: string): void;
      public unbindAll(): void;
      public get<Service>(runtimeIdentifier: string): Service;
      constructor();
  }

  export function Inject(...typeIdentifiers: string[]): (typeConstructor: any) => void;

}

declare module "inversify" {
  export = __inversify;
}
