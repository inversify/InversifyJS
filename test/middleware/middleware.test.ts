///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import * as sinon from "sinon";
import Kernel from "../../src/kernel/kernel";
import injectable from "../../src/annotation/injectable";

describe("Middleware", () => {

    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("Should be able to use middleware as Kernel configuration", () => {

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                log.push(`Middleware1: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        kernel.applyMiddleware(middleware1);
        let _kernel: any = kernel;
        expect(_kernel._middleware).not.to.eql(null);

    });

    it("Should support middleware", () => {

        interface INinja {}

        @injectable()
        class Ninja implements INinja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                log.push(`Middleware1: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        function middleware2(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                log.push(`Middleware2: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        // two middlewares applied at one single point in time
        kernel.applyMiddleware(middleware1, middleware2);

        kernel.bind<INinja>("INinja").to(Ninja);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware2: INinja`);
        expect(log[1]).eql(`Middleware1: INinja`);

    });

    it("Should allow applyMiddleware at mutiple points in time", () => {

        interface INinja {}

        @injectable()
        class Ninja implements INinja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                log.push(`Middleware1: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        function middleware2(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                log.push(`Middleware2: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        kernel.applyMiddleware(middleware1); // one point in time 
        kernel.applyMiddleware(middleware2);  // another point in time 
        kernel.bind<INinja>("INinja").to(Ninja);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware2: INinja`);
        expect(log[1]).eql(`Middleware1: INinja`);

    });

    it("Should use middleware", () => {

        interface INinja {}

        @injectable()
        class Ninja implements INinja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                log.push(`Middleware1: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        function middleware2(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                log.push(`Middleware2: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        kernel.applyMiddleware(middleware1, middleware2);
        kernel.bind<INinja>("INinja").to(Ninja);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware2: INinja`);
        expect(log[1]).eql(`Middleware1: INinja`);

    });

    it("Should be able to use middleware to catch errors during pre-planning phase", () => {

        interface INinja {}

        @injectable()
        class Ninja implements INinja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                try {
                    return planAndResolve(args);
                } catch (e) {
                    log.push(e.message);
                    return [];
                }
            };
        }

        kernel.applyMiddleware(middleware);
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.get<any>("SOME_NOT_REGISTERED_ID");
        expect(log.length).eql(1);
        expect(log[0]).eql(`No bindings found for serviceIdentifier: SOME_NOT_REGISTERED_ID`);

    });

    it("Should be able to use middleware to catch errors during planning phase", () => {

        interface IWarrior {}

        @injectable()
        class Ninja implements IWarrior {}

        @injectable()
        class Samurai implements IWarrior {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                try {
                    return planAndResolve(args);
                } catch (e) {
                    log.push(e.message);
                    return [];
                }
            };
        }

        kernel.applyMiddleware(middleware);
        kernel.bind<IWarrior>("IWarrior").to(Ninja);
        kernel.bind<IWarrior>("IWarrior").to(Samurai);

        kernel.get<any>("IWarrior");
        expect(log.length).eql(1);
        expect(log[0]).eql(`Ambiguous match found for serviceIdentifier: IWarrior`);

    });

    it("Should be able to use middleware to catch errors during resolution phase", () => {

        interface IWarrior {}

        @injectable()
        class Ninja implements IWarrior {}

        @injectable()
        class Samurai implements IWarrior {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                try {
                    return planAndResolve(args);
                } catch (e) {
                    log.push(e.message);
                    return [];
                }
            };
        }

        kernel.applyMiddleware(middleware);
        kernel.bind<IWarrior>("IWarrior"); // Invalid binding missing BindingToSyntax

        kernel.get<any>("IWarrior");
        expect(log.length).eql(1);
        expect(log[0]).eql(`Invalid binding type: IWarrior`);

    });

    it("Should help users to identify problems with middleware", () => {

        interface IWarrior {}

        @injectable()
        class Ninja implements IWarrior {}

        @injectable()
        class Samurai implements IWarrior {}

        let kernel = new Kernel();

        function middleware(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                try {
                    return planAndResolve(args);
                } catch (e) {
                    // missing return!
                }
            };
        }

        kernel.applyMiddleware(middleware);
        let throws = () => { kernel.get<any>("SOME_NOT_REGISTERED_ID"); };
        expect(throws).to.throw(`Invalid return type in middleware. Return must be an Array!`);

    });

    it("Should allow users to intercep a resolution context", () => {

        /*
        interface INinja {}

        @injectable()
        class Ninja implements INinja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                args.contextInterceptor = (contexts: IContext[]) => {
                    log.push(`contextInterceptor1: ${args.serviceIdentifier}`);
                    return contexts;
                };
                return planAndResolve(args);
            };
        }

        function middleware2(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (args: PlanAndResolveArgs) => {
                args.contextInterceptor = (contexts: IContext[]) => {
                    log.push(`contextInterceptor2: ${args.serviceIdentifier}`);
                    return args.contextInterceptor(contexts);
                };
                return planAndResolve(args);
            };
        }

        kernel.applyMiddleware(middleware1, middleware2);
        kernel.bind<INinja>("INinja").to(Ninja);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`contextInterceptor2: INinja`);
        expect(log[1]).eql(`contextInterceptor1: INinja`);
        */

    });

});
