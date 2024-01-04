import { interfaces } from '../interfaces/interfaces';
import { id } from '../utils/id';

class Request implements interfaces.Request {

  public id: number;
  public serviceIdentifier: interfaces.ServiceIdentifier;
  public parentContext: interfaces.Context;
  public parentRequest: interfaces.Request | null;
  public bindings: interfaces.Binding<unknown>[];
  public childRequests: interfaces.Request[];
  public target: interfaces.Target;
  public requestScope: interfaces.RequestScope | null;

  public constructor(
    serviceIdentifier: interfaces.ServiceIdentifier,
    parentContext: interfaces.Context,
    parentRequest: interfaces.Request | null,
    bindings: (interfaces.Binding<any> | interfaces.Binding<any>[]),
    target: interfaces.Target
  ) {
    this.id = id();
    this.serviceIdentifier = serviceIdentifier;
    this.parentContext = parentContext;
    this.parentRequest = parentRequest;
    this.target = target;
    this.childRequests = [];
    this.bindings = (Array.isArray(bindings) ? bindings : [bindings]);

    // Set requestScope if Request is the root request
    this.requestScope = parentRequest === null
      ? new Map()
      : null;
  }

  public addChildRequest(
    serviceIdentifier: interfaces.ServiceIdentifier,
    bindings: (interfaces.Binding<unknown> | interfaces.Binding<unknown>[]),
    target: interfaces.Target
  ): interfaces.Request {

    const child = new Request(
      serviceIdentifier,
      this.parentContext,
      this,
      bindings,
      target
    );
    this.childRequests.push(child);
    return child;
  }
}

export { Request };
