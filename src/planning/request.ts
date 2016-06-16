///<reference path="../interfaces/interfaces.d.ts" />

import guid from "../utils/guid";

class Request implements IRequest {

    public guid: string;
    public serviceIdentifier: (string|Symbol|INewable<any>);
    public parentContext: IContext;
    public parentRequest: IRequest;
    public bindings: IBinding<any>[];
    public childRequests: IRequest[];
    public target: ITarget;

    public constructor(
        serviceIdentifier: (string|Symbol|INewable<any>),
        parentContext: IContext,
        parentRequest: IRequest,
        bindings: (IBinding<any>|IBinding<any>[]),
        target: ITarget = null) {

            this.guid = guid();
            this.serviceIdentifier = serviceIdentifier;
            this.parentContext = parentContext;
            this.parentRequest = parentRequest;
            this.target = target;
            this.childRequests = [];
            this.bindings = (Array.isArray(bindings) ? bindings : ((bindings) ? [bindings] : []));
    }

    public addChildRequest(
        serviceIdentifier: string,
        bindings: (IBinding<any>|IBinding<any>[]),
        target: ITarget): IRequest {

            let child = new Request(
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

export default Request;
