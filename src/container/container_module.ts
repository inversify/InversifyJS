import { interfaces } from '../interfaces/interfaces';
import { id } from '../utils/id';

export class ContainerModule implements interfaces.ContainerModule {

  public id: number;
  public registry: interfaces.ContainerModuleCallBack;

  public constructor(registry: interfaces.ContainerModuleCallBack) {
    this.id = id();
    this.registry = registry;
  }

}

export class AsyncContainerModule implements interfaces.AsyncContainerModule {

  public id: number;
  public registry: interfaces.AsyncContainerModuleCallBack;

  public constructor(registry: interfaces.AsyncContainerModuleCallBack) {
    this.id = id();
    this.registry = registry;
  }

}
