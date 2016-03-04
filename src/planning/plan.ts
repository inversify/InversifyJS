///<reference path="../interfaces/interfaces.d.ts" />

class Plan implements IPlan {

    public parentContext: IContext;
    public rootRequest: IRequest;

    public constructor(parentContext: IContext, rootRequest: IRequest) {
        this.parentContext = parentContext;
        this.rootRequest = rootRequest;
    }
}

export default Plan;
