import interfaces from "../../src/interfaces/interfaces";
import { expect } from "chai";
import * as sinon from "sinon";
import Kernel from "../../src/kernel/kernel";
import injectable from "../../src/annotation/injectable";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

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

        function middleware1(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                log.push(`Middleware1: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        kernel.applyMiddleware(middleware1);
        let _kernel: any = kernel;
        expect(_kernel._middleware).not.to.eql(null);

    });

    it("Should support middleware", () => {

        interface Ninja {}

        @injectable()
        class Ninja implements Ninja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware1(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                log.push(`Middleware1: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        function middleware2(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                log.push(`Middleware2: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        // two middlewares applied at one single point in time
        kernel.applyMiddleware(middleware1, middleware2);

        kernel.bind<Ninja>("Ninja").to(Ninja);

        let ninja = kernel.get<Ninja>("Ninja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware2: Ninja`);
        expect(log[1]).eql(`Middleware1: Ninja`);

    });

    it("Should allow applyMiddleware at mutiple points in time", () => {

        interface Ninja {}

        @injectable()
        class Ninja implements Ninja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware1(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                log.push(`Middleware1: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        function middleware2(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                log.push(`Middleware2: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        kernel.applyMiddleware(middleware1); // one point in time 
        kernel.applyMiddleware(middleware2);  // another point in time 
        kernel.bind<Ninja>("Ninja").to(Ninja);

        let ninja = kernel.get<Ninja>("Ninja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware2: Ninja`);
        expect(log[1]).eql(`Middleware1: Ninja`);

    });

    it("Should use middleware", () => {

        interface Ninja {}

        @injectable()
        class Ninja implements Ninja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware1(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                log.push(`Middleware1: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        function middleware2(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                log.push(`Middleware2: ${args.serviceIdentifier}`);
                return planAndResolve(args);
            };
        }

        kernel.applyMiddleware(middleware1, middleware2);
        kernel.bind<Ninja>("Ninja").to(Ninja);

        let ninja = kernel.get<Ninja>("Ninja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware2: Ninja`);
        expect(log[1]).eql(`Middleware1: Ninja`);

    });

    it("Should be able to use middleware to catch errors during pre-planning phase", () => {

        interface Ninja {}

        @injectable()
        class Ninja implements Ninja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                try {
                    return planAndResolve(args);
                } catch (e) {
                    log.push(e.message);
                    return [];
                }
            };
        }

        kernel.applyMiddleware(middleware);
        kernel.bind<Ninja>("Ninja").to(Ninja);
        kernel.get<any>("SOME_NOT_REGISTERED_ID");
        expect(log.length).eql(1);
        expect(log[0]).eql(`${ERROR_MSGS.NOT_REGISTERED} SOME_NOT_REGISTERED_ID`);

    });

    it("Should be able to use middleware to catch errors during planning phase", () => {

        interface Warrior {}

        @injectable()
        class Ninja implements Warrior {}

        @injectable()
        class Samurai implements Warrior {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                try {
                    return planAndResolve(args);
                } catch (e) {
                    log.push(e.message);
                    return [];
                }
            };
        }

        kernel.applyMiddleware(middleware);
        kernel.bind<Warrior>("Warrior").to(Ninja);
        kernel.bind<Warrior>("Warrior").to(Samurai);

        kernel.get<any>("Warrior");
        expect(log.length).eql(1);
        expect(log[0]).to.contain(`${ERROR_MSGS.AMBIGUOUS_MATCH} Warrior`);

    });

    it("Should be able to use middleware to catch errors during resolution phase", () => {

        interface Warrior {}

        @injectable()
        class Ninja implements Warrior {}

        @injectable()
        class Samurai implements Warrior {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                try {
                    return planAndResolve(args);
                } catch (e) {
                    log.push(e.message);
                    return [];
                }
            };
        }

        kernel.applyMiddleware(middleware);
        kernel.bind<Warrior>("Warrior"); // Invalid binding missing BindingToSyntax

        kernel.get<any>("Warrior");
        expect(log.length).eql(1);
        expect(log[0]).eql(`${ERROR_MSGS.INVALID_BINDING_TYPE} Warrior`);

    });

    it("Should help users to identify problems with middleware", () => {

        interface Warrior {}

        @injectable()
        class Ninja implements Warrior {}

        @injectable()
        class Samurai implements Warrior {}

        let kernel = new Kernel();

        function middleware(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                try {
                    return planAndResolve(args);
                } catch (e) {
                    // missing return!
                }
            };
        }

        kernel.applyMiddleware(middleware);
        let throws = () => { kernel.get<any>("SOME_NOT_REGISTERED_ID"); };
        expect(throws).to.throw(ERROR_MSGS.INVALID_MIDDLEWARE_RETURN);

    });

    it("Should allow users to intercep a resolution context", () => {

        interface Ninja {}

        @injectable()
        class Ninja implements Ninja {}

        let kernel = new Kernel();

        let log: string[] = [];

        function middleware1(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                let nextContextInterceptor = args.contextInterceptor;
                args.contextInterceptor = (context: interfaces.Context) => {
                    log.push(`contextInterceptor1: ${args.serviceIdentifier}`);
                    return nextContextInterceptor(context);
                };
                return planAndResolve(args);
            };
        }

        function middleware2(planAndResolve: interfaces.Next): interfaces.Next {
            return (args: interfaces.NextArgs) => {
                let nextContextInterceptor = args.contextInterceptor;
                args.contextInterceptor = (context: interfaces.Context) => {
                    log.push(`contextInterceptor2: ${args.serviceIdentifier}`);
                    return nextContextInterceptor(context);
                };
                return planAndResolve(args);
            };
        }

        kernel.applyMiddleware(middleware1, middleware2);
        kernel.bind<Ninja>("Ninja").to(Ninja);

        let ninja = kernel.get<Ninja>("Ninja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`contextInterceptor1: Ninja`);
        expect(log[1]).eql(`contextInterceptor2: Ninja`);

    });

});
