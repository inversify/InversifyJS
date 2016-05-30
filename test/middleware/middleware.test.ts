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
            return (multiInject: boolean, serviceIdentifier: (string|Symbol|INewable<any>), target: ITarget) => {
                log.push(`Middleware1: ${serviceIdentifier}`);
                return planAndResolve(multiInject, serviceIdentifier, target);
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
            return (multiInject: boolean, serviceIdentifier: (string|Symbol|INewable<any>), target: ITarget) => {
                log.push(`Middleware1: ${serviceIdentifier}`);
                return planAndResolve(multiInject, serviceIdentifier, target);
            };
        }

        function middleware2(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (multiInject: boolean, serviceIdentifier: (string|Symbol|INewable<any>), target: ITarget) => {
                log.push(`Middleware2: ${serviceIdentifier}`);
                return planAndResolve(multiInject, serviceIdentifier, target);
            };
        }

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

        let log: string[] = [];

        function middleware1(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (multiInject: boolean, serviceIdentifier: (string|Symbol|INewable<any>), target: ITarget) => {
                log.push(`Middleware1: ${serviceIdentifier}`);
                return planAndResolve(multiInject, serviceIdentifier, target);
            };
        }

        function middleware2(planAndResolve: PlanAndResolve<any>): PlanAndResolve<any> {
            return (multiInject: boolean, serviceIdentifier: (string|Symbol|INewable<any>), target: ITarget) => {
                log.push(`Middleware2: ${serviceIdentifier}`);
                return planAndResolve(multiInject, serviceIdentifier, target);
            };
        }

        kernel.applyMiddleware(middleware1, middleware2);
        kernel.bind<INinja>("INinja").to(Ninja);

        let ninja = kernel.get<INinja>("INinja");

        expect(ninja instanceof Ninja).eql(true);
        expect(log.length).eql(2);
        expect(log[0]).eql(`Middleware1: INinja`);
        expect(log[1]).eql(`Middleware2: INinja`);

    });

});
