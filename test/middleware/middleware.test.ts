///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import * as sinon from "sinon";
import Kernel from "../../src/kernel/kernel";
import injectable from "../../src/annotation/injectable";

describe("Middleware", () => {

    let sandbox: sinon.SinonSandbox;
    let log: string[] = null;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        log = [];
    });

    afterEach(() => {
        sandbox.restore();
        log = null;
    });

    function middleware1(next: (context: IContext) => any) {
        return (context: IContext) => {
            let serviceIdentifier = context.kernel.getServiceIdentifierAsString(context.plan.rootRequest.serviceIdentifier);
            log.push(`Middleware1: ${serviceIdentifier}`);
            return next(context);
        };
    };

    function middleware2(next: (context: IContext) => any) {
        return (context: IContext) => {
            let serviceIdentifier = context.kernel.getServiceIdentifierAsString(context.plan.rootRequest.serviceIdentifier);
            log.push(`Middleware2: ${serviceIdentifier}`);
            return next(context);
        };
    };

    it("Should be able to use middleware as Kernel configuration", () => {

        let kernel = new Kernel();
        kernel.applyMiddleware(middleware1);
        let _kernel: any = kernel;
        expect(_kernel._middleware).not.to.eql(null);

    });

    it("Should support middleware", () => {

        interface INinja {}

        @injectable()
        class Ninja implements INinja {}

        let kernel = new Kernel();
        kernel.applyMiddleware(middleware1, middleware2);
        kernel.bind<INinja>("INinja").to(Ninja);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware1: INinja`);
        expect(log[1]).eql(`Middleware2: INinja`);

    });

    it("Should use middleware", () => {

        interface INinja {}

        @injectable()
        class Ninja implements INinja {}

        let kernel = new Kernel();
        kernel.applyMiddleware(middleware1, middleware2);
        kernel.bind<INinja>("INinja").to(Ninja);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware1: INinja`);
        expect(log[1]).eql(`Middleware2: INinja`);

    });

});
