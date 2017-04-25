import { expect } from "chai";
import { Container, injectable, inject, MetadataReader } from "../../src/inversify";
import { interfaces } from "../../src/interfaces/interfaces";
import { Metadata } from "../../src/planning/metadata";
import * as METADATA_KEY from "../../src/constants/metadata_keys";

describe("Custom Metadata Reader", () => {

    interface FunctionWithMetadata extends Function {
        constructorInjections: interfaces.ServiceIdentifier<any>[];
        propertyInjections: PropertyInjectionMetadata[];
    }

    interface PropertyInjectionMetadata {
        propName: string;
        injection: interfaces.ServiceIdentifier<any>;
    }

    class StaticPropsMetadataReader implements interfaces.MetadataReader {

        public getConstructorMetadata(constructorFunc: FunctionWithMetadata): interfaces.ConstructorMetadata {

            const formatMetadata = (injections: interfaces.ServiceIdentifier<any>[]) => {
                let userGeneratedMetadata: interfaces.MetadataMap = {};
                injections.forEach((injection, index) => {
                    let metadata = new Metadata(METADATA_KEY.INJECT_TAG, injection);
                    if (Array.isArray(userGeneratedMetadata[index])) {
                        userGeneratedMetadata[index].push(metadata);
                    } else {
                        userGeneratedMetadata[index] = [metadata];
                    }
                });
                return userGeneratedMetadata;
            };

            let constructorInjections = constructorFunc.constructorInjections;

            if (Array.isArray(constructorInjections) === false) {
                throw new Error("Missing constructorInjections annotation!");
            }

            let userGeneratedConsturctorMetadata = formatMetadata(constructorInjections);

            return {
                // compilerGeneratedMetadata lenght must match userGeneratedMetadata
                // we expose compilerGeneratedMetadata because if your custom annotation
                // system is powered by decorators. The TypeScript compiler could generate
                // some metadata when the emitDecoratorMetadata flag is enabled.
                compilerGeneratedMetadata: new Array(constructorInjections.length),
                userGeneratedMetadata: userGeneratedConsturctorMetadata
            };

        }

        public getPropertiesMetadata(constructorFunc: FunctionWithMetadata): interfaces.MetadataMap {

            const formatMetadata = (injections: PropertyInjectionMetadata[]) => {
                let userGeneratedMetadata: interfaces.MetadataMap = {};
                injections.forEach((propInjection, index) => {
                    let metadata = new Metadata(METADATA_KEY.INJECT_TAG, propInjection.injection);
                    if (Array.isArray(userGeneratedMetadata[propInjection.propName])) {
                        userGeneratedMetadata[propInjection.propName].push(metadata);
                    } else {
                        userGeneratedMetadata[propInjection.propName] = [metadata];
                    }
                });
                return userGeneratedMetadata;
            };

            let propertyInjections = constructorFunc.propertyInjections;

            if (Array.isArray(propertyInjections) === false) {
                throw new Error("Missing propertyInjections annotation!");
            }

            let userGeneratedPropertyMetadata = formatMetadata(propertyInjections);
            return userGeneratedPropertyMetadata;

        }

    }

    it("Should be able to use custom constructor injection metadata", () => {

        interface Ninja {
            fight(): string;
            sneak(): string;
        }

        interface Katana {
            hit(): string;
        }

        interface Shuriken {
            throw(): string;
        }

        class Katana implements Katana {
            public static readonly constructorInjections = [];
            public static readonly propertyInjections = [];
            public hit() {
                return "cut!";
            }
        }

        class Shuriken implements Shuriken {
            public static readonly constructorInjections = [];
            public static readonly propertyInjections = [];
            public throw() {
                return "hit!";
            }
        }

        class Ninja implements Ninja {

            public static readonly constructorInjections = ["Katana", "Shuriken"];
            public static readonly propertyInjections = [];

            private _katana: Katana;
            private _shuriken: Shuriken;

            public constructor(
                katana: Katana,
                shuriken: Shuriken
            ) {
                this._katana = katana;
                this._shuriken = shuriken;
            }

            public fight() { return this._katana.hit(); }
            public sneak() { return this._shuriken.throw(); }

        }

        let container = new Container();
        container.applyCustomMetadataReader(new StaticPropsMetadataReader());

        container.bind<Ninja>("Ninja").to(Ninja);
        container.bind<Katana>("Katana").to(Katana);
        container.bind<Shuriken>("Shuriken").to(Shuriken);

        let ninja = container.get<Ninja>("Ninja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

    });

    it("Should be able to use custom prop injection metadata", () => {

        interface Ninja {
            fight(): string;
            sneak(): string;
        }

        interface Katana {
            hit(): string;
        }

        interface Shuriken {
            throw(): string;
        }

        class Katana implements Katana {
            public static readonly constructorInjections = [];
            public static readonly propertyInjections = [];
            public static readonly __brk = 1; // TEMP
            public hit() {
                return "cut!";
            }
        }

        class Shuriken implements Shuriken {
            public static readonly constructorInjections = [];
            public static readonly propertyInjections = [];
            public static readonly __brk = 1; // TEMP
            public throw() {
                return "hit!";
            }
        }

        class Ninja implements Ninja {

            public static readonly constructorInjections = [];

            public static readonly propertyInjections = [
                { propName: "_katana", injection: "Katana" },
                { propName: "_shuriken", injection: "Shuriken" }
            ];

            public static readonly __brk = 1; // TEMP

            private _katana: Katana;
            private _shuriken: Shuriken;
            public fight() { return this._katana.hit(); }
            public sneak() { return this._shuriken.throw(); }

        }

        let container = new Container();
        container.applyCustomMetadataReader(new StaticPropsMetadataReader());
        container.bind<Ninja>("Ninja").to(Ninja);
        container.bind<Katana>("Katana").to(Katana);
        container.bind<Shuriken>("Shuriken").to(Shuriken);

        let ninja = container.get<Ninja>("Ninja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

    });


    it("Should be able to use extend the default metadata reader", () => {

        const constructorMetadataLog: interfaces.ConstructorMetadata[] = [];
        const propertyMetadataLog: interfaces.MetadataMap[] = [];

        class CustomMetadataReader extends MetadataReader {
            public getConstructorMetadata(constructorFunc: Function): interfaces.ConstructorMetadata {
                const constructorMetadata = super.getConstructorMetadata(constructorFunc);
                constructorMetadataLog.push(constructorMetadata);
                return constructorMetadata;
            }
            public getPropertiesMetadata(constructorFunc: Function): interfaces.MetadataMap {
                const propertyMetadata = super.getPropertiesMetadata(constructorFunc);
                propertyMetadataLog.push(propertyMetadata);
                return propertyMetadata;
            }
        }

        interface Ninja {
            fight(): string;
            sneak(): string;
        }

        interface Katana {
            hit(): string;
        }

        interface Shuriken {
            throw(): string;
        }

        @injectable()
        class Katana implements Katana {
            public hit() {
                return "cut!";
            }
        }

        @injectable()
        class Shuriken implements Shuriken {
            public throw() {
                return "hit!";
            }
        }

        @injectable()
        class Ninja implements Ninja {

            private _katana: Katana;
            private _shuriken: Shuriken;

            public constructor(
                @inject("Katana") katana: Katana,
                @inject("Shuriken") shuriken: Shuriken
            ) {
                this._katana = katana;
                this._shuriken = shuriken;
            }

            public fight() {return this._katana.hit(); }
            public sneak() { return this._shuriken.throw(); }

        }

        let container = new Container();
        container.applyCustomMetadataReader(new CustomMetadataReader());

        container.bind<Ninja>("Ninja").to(Ninja);
        container.bind<Katana>("Katana").to(Katana);
        container.bind<Shuriken>("Shuriken").to(Shuriken);

        let ninja = container.get<Ninja>("Ninja");

        expect(ninja.fight()).eql("cut!");
        expect(ninja.sneak()).eql("hit!");

        expect(Array.isArray(constructorMetadataLog)).eq(true);
        expect(constructorMetadataLog.length).eq(3);

        let compilerGeneratedMetadata0 = constructorMetadataLog[0].compilerGeneratedMetadata;

        if (compilerGeneratedMetadata0) {
            expect(compilerGeneratedMetadata0[0]).eq(Katana);
            expect(compilerGeneratedMetadata0[1]).eq(Shuriken);
        }

        expect(constructorMetadataLog[0].userGeneratedMetadata["0"][0].key).eq("inject");
        expect(constructorMetadataLog[0].userGeneratedMetadata["0"][0].value).eq("Katana");
        expect(constructorMetadataLog[0].userGeneratedMetadata["1"][0].key).eq("inject");
        expect(constructorMetadataLog[0].userGeneratedMetadata["1"][0].value).eq("Shuriken");

        expect(JSON.stringify(constructorMetadataLog[1].compilerGeneratedMetadata)).eq(JSON.stringify([]));
        expect(JSON.stringify(constructorMetadataLog[2].compilerGeneratedMetadata)).eq(JSON.stringify([]));
        expect(JSON.stringify(constructorMetadataLog[1].userGeneratedMetadata)).eq(JSON.stringify({}));
        expect(JSON.stringify(constructorMetadataLog[2].userGeneratedMetadata)).eq(JSON.stringify({}));

        expect(propertyMetadataLog.length).eq(3);
        expect(propertyMetadataLog[0].length).eq(0);
        expect(propertyMetadataLog[1].length).eq(0);
        expect(propertyMetadataLog[2].length).eq(0);

    });

});
