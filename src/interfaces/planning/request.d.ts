interface IRequest {

        /// The service that was requested.
        serviceIdentifier: (string|Symbol|INewable<any>);

        /// The parent context.
        parentContext: IContext;

        /// The parent request.
        parentRequest: IRequest;

        // The child requests
        childRequests: IRequest[];

        /// Gets the target that will receive the injection, if any.
        target: ITarget;

        /// Gets the stack of bindings which have been activated by this request.
        bindings: IBinding<any>[];

        // Adds a child request to the request
        addChildRequest(
            serviceIdentifier: (string|Symbol|INewable<any>),
            bindings: (IBinding<any>|IBinding<any>[]),
            target: ITarget): IRequest;
}
