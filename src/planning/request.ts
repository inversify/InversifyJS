import * as interfaces from '../interfaces/interfaces';
import { id } from '../utils/id';


// @dcavanagh @notaphplover What do you guys think of
// import { Request as RequestInterface, ServiceIdentifier ...} from '../interfaces/interfaces;
// and make the same for all the files where you need to implement the interface
// this way we can make sure we don't just split random things just because eslint complains
// we can also just increase the max-length but i went with 80 ( default ) and kinda everybody uses that
class Request implements interfaces.Request {
  public id: number;
  public serviceIdentifier: interfaces.ServiceIdentifier<unknown>;
  public parentContext: interfaces.Context;
  public parentRequest: interfaces.Request | null;
  public bindings:
    interfaces.Binding<interfaces.ServiceIdentifier<string | symbol>>[];
  public childRequests: interfaces.Request[];
  public target: interfaces.Target;
  public requestScope: interfaces.RequestScope;

  public constructor(
    serviceIdentifier: interfaces.ServiceIdentifier<unknown>,
    parentContext: interfaces.Context,
    parentRequest: interfaces.Request | null,
    bindings:
      interfaces.Binding<interfaces.ServiceIdentifier<string | symbol>>[],
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
    this.requestScope = parentRequest === null ? new Map() : null;
  }

  public addChildRequest(
    serviceIdentifier: interfaces.ServiceIdentifier<unknown>,
    bindings:
      interfaces.Binding<interfaces.ServiceIdentifier<string | symbol>>[],
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
