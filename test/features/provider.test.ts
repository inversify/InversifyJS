import { expect } from "chai";
import { Container, injectable } from "../../src/inversify";

describe("Provider", () => {

    it("Should support complex asynchronous initialization processes", (done) => {

        @injectable()
        class Ninja {
            public level: number;
            public rank: string;
            public constructor() {
                this.level = 0;
                this.rank = "Ninja";
            }
            public train(): Promise<number> {
                return new Promise<number>((resolve) => {
                    setTimeout(() => {
                        this.level += 10;
                        resolve(this.level);
                    }, 100);
                });
            }
        }

        @injectable()
        class NinjaMaster {
            public rank: string;
            public constructor() {
                this.rank = "NinjaMaster";
            }
        }

        type NinjaMasterProvider = () => Promise<NinjaMaster>;

        let container = new Container();

        container.bind<Ninja>("Ninja").to(Ninja).inSingletonScope();
        container.bind<NinjaMasterProvider>("Provider<NinjaMaster>").toProvider((context) => {
            return () => {
                return new Promise<NinjaMaster>((resolve, reject) => {
                    let ninja = context.container.get<Ninja>("Ninja");
                    ninja.train().then((level) => {
                        if (level >= 20) {
                            resolve(new NinjaMaster());
                        } else {
                            reject("Not enough training");
                        }
                    });
                });
            };
        });

        let ninjaMasterProvider = container.get<NinjaMasterProvider>("Provider<NinjaMaster>");

        // helper
        function valueOrDefault<T>(provider: () => Promise<T>, defaultValue: T) {
            return new Promise<T>((resolve, reject) => {
                provider().then((value) => {
                    resolve(value);
                }).catch(() => {
                    resolve(defaultValue);
                });
            });
        }

        valueOrDefault(ninjaMasterProvider, { rank: "DefaultNinjaMaster" }).then((ninjaMaster) => {
            expect(ninjaMaster.rank).to.eql("DefaultNinjaMaster");
        });

        valueOrDefault(ninjaMasterProvider, { rank: "DefaultNinjaMaster" }).then((ninjaMaster) => {
            expect(ninjaMaster.rank).to.eql("NinjaMaster");
            done();
        });

    });

    it("Should support custom arguments", (done) => {
        // TODO
        done();
    });

    it("Should support partial application of custom arguments", (done) => {
        // TODO
        done();
    });

    it("Should support the declaration of singletons", (done) => {
        // TODO
        done();
    });

});
