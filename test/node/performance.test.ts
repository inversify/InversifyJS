import { expect } from "chai";
import { Kernel } from "../../src/inversify";
import * as now from "performance-now";

describe("Performance", () => {

    function registerN(times: number) {

        let result = {
            kernel: new Kernel(),
            register: -1
        };

        let i = 0;

        for (i = 0; i < times; i++) {
            let start = now();
            result.kernel.bind<any>(`SOME_ID_${i}`).toConstantValue({ test: i });
            let end = now();
            result.register = end - start;
        }

        return result;
    }

    function resolveN(kernel: Kernel, times: number) {

        let result = {
            avg: -1,
            max: -1,
            min: 9999999999999999
        };

        let items: number[] = [];
        let i = 0;

        for (i = 0; i < times; i++) {

            let start = now();
            kernel.get(`SOME_ID_${times}`);
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

    it("Registring 1 binding should be doen in less than 1 ms", () => {
        let result1 = registerN(1);
        expect(result1.register).to.below(1);
        expect(result1.register).to.below(1);
    });

    it("Registring 5 bindings should be doen in less than 1 ms", () => {
        let result5 = registerN(5);
        expect(result5.register).to.below(1);
    });

    it("Registring 1K bindings should be doen in less than 1 ms", () => {
        let result1K = registerN(1000);
        expect(result1K.register).to.below(1);
    });

    it("Registring 5K bindings should be doen in less than 1 ms", () => {
        let result5K = registerN(5000);
        expect(result5K.register).to.below(1);
    });

    it("Resolving 1 binding should be done in less than 1 ms", () => {
        let kernel1 = registerN(1000).kernel;
        let result1 = resolveN(kernel1, 5);
        expect(result1.avg).to.below(1);
    });

    it("Resolving 5 bindings should be done in less than 1 ms", () => {
        let kernel5 = registerN(1000).kernel;
        let result5 = resolveN(kernel5, 5);
        expect(result5.avg).to.below(1);
    });

    it("Resolving 1K bindings should be done in less than 1 ms", () => {
        let kernel1K = registerN(1000).kernel;
        let result1K = resolveN(kernel1K, 5);
        expect(result1K.avg).to.below(1);
    });

    it("Resolving 5K bindings should be done in less than 1 ms", () => {
        let kernel5K = registerN(5000).kernel;
        let result5K = resolveN(kernel5K, 5);
        expect(result5K.avg).to.below(1);
    });

    it("Resolving 10K bindings should be done in less than 1 ms", () => {
        let kernel10K = registerN(10000).kernel;
        let result10K = resolveN(kernel10K, 5);
        expect(result10K.avg).to.below(1);
    });

});
