import * as interfaces from '../interfaces/interfaces';
import { id } from '../utils/id';

class Request implements interfaces.Request {
  public id: number;
  public serviceIdentifier: interfaces.ServiceIdentifier<unknown>;
  public parentContext: interfaces.Context;
  public parentRequest: interfaces.Request | null;
  public bindings: interfaces.Binding<interfaces.IndexObject>[];
  public childRequests: interfaces.Request[];
  public target: interfaces.Target;
  public requestScope: interfaces.RequestScope;

  public constructor(
    serviceIdentifier: interfaces.ServiceIdentifier<unknown>,
    parentContext: interfaces.Context,
    parentRequest: interfaces.Request | null,
    bindings: interfaces.Binding<interfaces.IndexObject> |
      interfaces.Binding<interfaces.IndexObject>[],
    target: interfaces.Target
  ) {
    this.id = id();
    this.serviceIdentifier = serviceIdentifier;
    this.parentContext = parentContext;
    this.parentRequest = parentRequest;
    this.target = target;
    this.childRequests = [];
    this.bindings = Array.isArray(bindings) ? bindings : [bindings];

    // Set requestScope if Request is the root request
    this.requestScope = parentRequest === null ? new Map<unknown, unknown>() : null;
  }

  public addChildRequest(
    serviceIdentifier: interfaces.ServiceIdentifier<unknown>,
    bindings: interfaces.Binding<interfaces.IndexObject> |
      interfaces.Binding<interfaces.IndexObject>[],
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
