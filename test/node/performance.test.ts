import { expect } from "chai";
import { Container } from "../../src/inversify";
import * as now from "performance-now";

describe("Performance", () => {

    function registerN(times: number) {

        let result = {
            container: new Container(),
            register: -1
        };

        let i = 0;

        for (i = 0; i < times; i++) {
            let start = now();
            result.container.bind<any>(`SOME_ID_${i}`).toConstantValue({ test: i });
            let end = now();
            result.register = end - start;
        }

        return result;
    }

    function resolveN(container: Container, times: number) {

        let result = {
            avg: -1,
            max: -1,
            min: 9999999999999999
        };

        let items: number[] = [];
        let i = 0;

        for (i = 0; i < times; i++) {

            let start = now();
            container.get(`SOME_ID_${times}`);
            let end = now();
            let total = end - start;

            if (total < result.min) {
                result.min = total;
            }
            if (total > result.max) {
                result.max = total;
            }

            items.push(total);
        }

        result.avg = items.reduce((p, c) => p + c, 0) / items.length;

        return result;
    }

    it("Should be able to register 1 binding in less than 1 ms", () => {
        let result1 = registerN(1);
        expect(result1.register).to.below(1);
        expect(result1.register).to.below(1);
    });

    it("Should be able to register 5 bindings in less than 1 ms", () => {
        let result5 = registerN(5);
        expect(result5.register).to.below(1);
    });

    it("Should be able to register 1K bindings in less than 1 ms", () => {
        let result1K = registerN(1000);
        expect(result1K.register).to.below(1);
    });

    it("Should be able to register 5K bindings in less than 1 ms", () => {
        let result5K = registerN(5000);
        expect(result5K.register).to.below(1);
    });

    it("Should be able to register 1 bindings in less than 1 ms", () => {
        let container1 = registerN(1000).container;
        let result1 = resolveN(container1, 5);
        expect(result1.avg).to.below(1);
    });

    it("Should be able to register 5 bindings in less than 1 ms", () => {
        let container5 = registerN(1000).container;
        let result5 = resolveN(container5, 5);
        expect(result5.avg).to.below(1);
    });

    it("Should be able to register 1K bindings in less than 1 ms", () => {
        let container1K = registerN(1000).container;
        let result1K = resolveN(container1K, 5);
        expect(result1K.avg).to.below(1);
    });

    it("Should be able to register 5K bindings in less than 1 ms", () => {
        let container5K = registerN(5000).container;
        let result5K = resolveN(container5K, 5);
        expect(result5K.avg).to.below(1);
    });

    it("Should be able to register 10K bindings in less than 1 ms", () => {
        let container10K = registerN(10000).container;
        let result10K = resolveN(container10K, 5);
        expect(result10K.avg).to.below(1);
    });

});
