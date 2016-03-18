///<reference path="../interfaces/interfaces.d.ts" />

import { guid } from "../utils/utils";

class Request implements IRequest {

        public guid: string;
        public service: string;
        public parentContext: IContext;
        public parentRequest: IRequest;
        public bindings: IBinding<any>[];
        public childRequests: IRequest[];
        public target: ITarget;

        public constructor(
            service: string,
            parentContext: IContext,
            parentRequest: IRequest,
            bindings: (IBinding<any>|IBinding<any>[]),
            target: ITarget = null) {

                this.guid = guid();
                this.service = service;
                this.parentContext = parentContext;
                this.parentRequest = parentRequest;
                this.target = target;
                this.childRequests = [];
                this.bindings = (Array.isArray(bindings) ? bindings : ((bindings) ? [bindings] : []));
        }

        public addChildRequest(
            service: string,
            bindings: (IBinding<any>|IBinding<any>[]),
            target: ITarget): IRequest {

                let child = new Request(
                    service,
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
