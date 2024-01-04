import { interfaces } from '../interfaces/interfaces';

class Plan implements interfaces.Plan {

  public parentContext: interfaces.Context;
  public rootRequest: interfaces.Request;

  public constructor(parentContext: interfaces.Context, rootRequest: interfaces.Request) {
    this.parentContext = parentContext;
    this.rootRequest = rootRequest;
  }
}

export { Plan };
