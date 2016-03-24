///<reference path="../interfaces/interfaces.d.ts" />

class Request implements IRequest {

        public service: (string|Symbol|INewable<any>);
        public parentContext: IContext;
        public parentRequest: IRequest;
        public bindings: IBinding<any>[];
        public childRequests: IRequest[];
        public target: ITarget;

        public constructor(
            service: (string|Symbol|INewable<any>),
            parentContext: IContext,
            parentRequest: IRequest,
            bindings: (IBinding<any>|IBinding<any>[]),
            target: ITarget = null) {

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
