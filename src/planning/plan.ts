///<reference path="../interfaces/interfaces.d.ts" />

// import { Context } from "./context";
// import { Request } from "./request";
// import { Target } from "./target";

class Plan implements IPlan {

    public parentContext: IContext;
    public rootRequest: IRequest;

    public constructor(parentContext: IContext, rootRequest: IRequest) {
        this.parentContext = parentContext;
        this.rootRequest = rootRequest;
    }
}

export { Plan };
