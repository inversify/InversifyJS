///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import Binding from "../../src/bindings/binding";
import Request from "../../src/planning/request";
import Target from "../../src/planning/target";
import Metadata from "../../src/planning/metadata";
import BindingWhenSyntax from "../../src/syntax/binding_when_syntax";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import { typeConstraint } from "../../src/syntax/constraint_helpers";

describe("BindingWhenSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingWhenSyntax = new BindingWhenSyntax<INinja>(binding);

        // cast to any to be able to access private props
        let _bindingWhenSyntax: any = bindingWhenSyntax;

        expect(_bindingWhenSyntax._binding.runtimeIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure custom constraint of a binding", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingWhenSyntax = new BindingWhenSyntax<INinja>(binding);

        bindingWhenSyntax.when((request: IRequest) => {
            return request.target.name.equals("ninja");
        });

        let target = new Target("ninja", ninjaIdentifier);
        let request = new Request(ninjaIdentifier, null, null, binding, target);
        expect(binding.constraint(request)).eql(true);

    });

    it("Should be able to constraint a binding to a named target", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingWhenSyntax = new BindingWhenSyntax<INinja>(binding);

        let named = "primary";

        bindingWhenSyntax.whenTargetNamed(named);
        expect(binding.constraint).not.to.eql(null);

        let target = new Target("ninja", ninjaIdentifier, named);
        let request = new Request(ninjaIdentifier, null, null, binding, target);
        expect(binding.constraint(request)).eql(true);

        let target2 = new Target("ninja", ninjaIdentifier);
        let request2 = new Request(ninjaIdentifier, null, null, binding, target2);
        expect(binding.constraint(request2)).eql(false);

    });

    it("Should be able to constraint a binding to a tagged target", () => {

        interface INinja {}
        let ninjaIdentifier = "INinja";

        let binding = new Binding<INinja>(ninjaIdentifier);
        let bindingWhenSyntax = new BindingWhenSyntax<INinja>(binding);

        bindingWhenSyntax.whenTargetTagged("canSwim", true);
        expect(binding.constraint).not.to.eql(null);

        let target = new Target("ninja", ninjaIdentifier, new Metadata("canSwim", true));
        let request = new Request(ninjaIdentifier, null, null, binding, target);
        expect(binding.constraint(request)).eql(true);

        let target2 = new Target("ninja", ninjaIdentifier, new Metadata("canSwim", false));
        let request2 = new Request(ninjaIdentifier, null, null, binding, target2);
        expect(binding.constraint(request2)).eql(false);

    });

    it("Should be able to constraint a binding to its parent", () => {

        interface IWeapon {
            name: string;
        }

        class Katana implements IWeapon {
            public name = "Katana";
        }

        class Shuriken implements IWeapon {
            public name = "Shuriken";
        }

        interface ISamurai {
            katana: IWeapon;
        }

        interface INinja {
            shuriken: IWeapon;
        }

        class Ninja implements INinja {
            public shuriken: IWeapon;
            public constructor(shuriken: IWeapon) {
                this.shuriken = shuriken;
            }
        }

        class Samurai implements ISamurai {
            public katana: IWeapon;
            public constructor(katana: IWeapon) {
                this.katana = katana;
            }
        }

        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Ninja);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Samurai);

        let samuraiBinding = new Binding<ISamurai>("ISamurai");
        samuraiBinding.implementationType = Samurai;
        let samuraiRequest = new Request("ISamurai", null, null, samuraiBinding, null);

        let ninjaBinding = new Binding<INinja>("INinja");
        ninjaBinding.implementationType = Ninja;
        let ninjaRequest = new Request("INinja", null, null, ninjaBinding, null);

        let katanaBinding = new Binding<IWeapon>("IWeapon");
        let katanaBindingWhenSyntax = new BindingWhenSyntax<IWeapon>(katanaBinding);
        let katanaTarget = new Target("katana", "IWeapon");
        let katanaRequest = new Request("IWeapon", null, samuraiRequest, katanaBinding, katanaTarget);

        let shurikenBinding = new Binding<IWeapon>("IWeapon");
        let shurikenBindingWhenSyntax = new BindingWhenSyntax<IWeapon>(shurikenBinding);
        let shurikenTarget = new Target("shuriken", "IWeapon");
        let shurikenRequest = new Request("IWeapon", null, ninjaRequest, shurikenBinding, shurikenTarget);

        katanaBindingWhenSyntax.whenInjectedInto(Samurai);
        expect(katanaBinding.constraint(katanaRequest)).eql(true);
        expect(katanaBinding.constraint(shurikenRequest)).eql(false);

        katanaBindingWhenSyntax.whenInjectedInto(Ninja);
        expect(katanaBinding.constraint(katanaRequest)).eql(false);
        expect(katanaBinding.constraint(shurikenRequest)).eql(true);

        shurikenBindingWhenSyntax.whenInjectedInto(Samurai);
        expect(shurikenBinding.constraint(katanaRequest)).eql(true);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(false);

        shurikenBindingWhenSyntax.whenInjectedInto(Ninja);
        expect(shurikenBinding.constraint(katanaRequest)).eql(false);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(true);

        katanaBindingWhenSyntax.whenInjectedInto("ISamurai");
        expect(katanaBinding.constraint(katanaRequest)).eql(true);
        expect(katanaBinding.constraint(shurikenRequest)).eql(false);

        katanaBindingWhenSyntax.whenInjectedInto("INinja");
        expect(katanaBinding.constraint(katanaRequest)).eql(false);
        expect(katanaBinding.constraint(shurikenRequest)).eql(true);

        shurikenBindingWhenSyntax.whenInjectedInto("ISamurai");
        expect(shurikenBinding.constraint(katanaRequest)).eql(true);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(false);

        shurikenBindingWhenSyntax.whenInjectedInto("INinja");
        expect(shurikenBinding.constraint(katanaRequest)).eql(false);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(true);

    });

    it("Should be able to constraint a binding to a named parent", () => {

        interface IWeapon {
            name: string;
        }

        class Katana implements IWeapon {
            public name = "Katana";
        }

        class Shuriken implements IWeapon {
            public name = "Shuriken";
        }

        interface ISamurai {
            katana: IWeapon;
        }

        interface INinja {
            shuriken: IWeapon;
        }

        class Ninja implements INinja {
            public shuriken: IWeapon;
            public constructor(shuriken: IWeapon) {
                this.shuriken = shuriken;
            }
        }

        class Samurai implements ISamurai {
            public katana: IWeapon;
            public constructor(katana: IWeapon) {
                this.katana = katana;
            }
        }

        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Ninja);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Samurai);

        let samuraiBinding = new Binding<ISamurai>("ISamurai");
        samuraiBinding.implementationType = Samurai;
        let samuraiRequest = new Request("ISamurai", null, null, samuraiBinding, new Target(null, "ISamurai", "japonese"));

        let ninjaBinding = new Binding<INinja>("INinja");
        ninjaBinding.implementationType = Ninja;
        let ninjaRequest = new Request("INinja", null, null, ninjaBinding, new Target(null, "INinja", "chinese"));

        let katanaBinding = new Binding<IWeapon>("IWeapon");
        let katanaBindingWhenSyntax = new BindingWhenSyntax<IWeapon>(katanaBinding);
        let katanaTarget = new Target("katana", "IWeapon");
        let katanaRequest = new Request("IWeapon", null, samuraiRequest, katanaBinding, katanaTarget);

        let shurikenBinding = new Binding<IWeapon>("IWeapon");
        let shurikenBindingWhenSyntax = new BindingWhenSyntax<IWeapon>(shurikenBinding);
        let shurikenTarget = new Target("shuriken", "IWeapon");
        let shurikenRequest = new Request("IWeapon", null, ninjaRequest, shurikenBinding, shurikenTarget);

        katanaBindingWhenSyntax.whenParentNamed("chinese");
        shurikenBindingWhenSyntax.whenParentNamed("chinese");
        expect(katanaBinding.constraint(katanaRequest)).eql(false);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(true);

        katanaBindingWhenSyntax.whenParentNamed("japonese");
        shurikenBindingWhenSyntax.whenParentNamed("japonese");
        expect(katanaBinding.constraint(katanaRequest)).eql(true);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(false);

    });

    it("Should be able to constraint a binding to a tagged parent", () => {

        interface IWeapon {
            name: string;
        }

        class Katana implements IWeapon {
            public name = "Katana";
        }

        class Shuriken implements IWeapon {
            public name = "Shuriken";
        }

        interface ISamurai {
            katana: IWeapon;
        }

        interface INinja {
            shuriken: IWeapon;
        }

        class Ninja implements INinja {
            public shuriken: IWeapon;
            public constructor(shuriken: IWeapon) {
                this.shuriken = shuriken;
            }
        }

        class Samurai implements ISamurai {
            public katana: IWeapon;
            public constructor(katana: IWeapon) {
                this.katana = katana;
            }
        }

        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Ninja);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Samurai);

        let samuraiBinding = new Binding<ISamurai>("ISamurai");
        samuraiBinding.implementationType = Samurai;
        let samuraiTarget = new Target(null, "ISamurai", new Metadata("sneaky", false));
        let samuraiRequest = new Request("ISamurai", null, null, samuraiBinding, samuraiTarget);

        let ninjaBinding = new Binding<INinja>("INinja");
        ninjaBinding.implementationType = Ninja;
        let ninjaTarget = new Target(null, "INinja", new Metadata("sneaky", true));
        let ninjaRequest = new Request("INinja", null, null, ninjaBinding, ninjaTarget);

        let katanaBinding = new Binding<IWeapon>("IWeapon");
        let katanaBindingWhenSyntax = new BindingWhenSyntax<IWeapon>(katanaBinding);
        let katanaTarget = new Target("katana", "IWeapon");
        let katanaRequest = new Request("IWeapon", null, samuraiRequest, katanaBinding, katanaTarget);

        let shurikenBinding = new Binding<IWeapon>("IWeapon");
        let shurikenBindingWhenSyntax = new BindingWhenSyntax<IWeapon>(shurikenBinding);
        let shurikenTarget = new Target("shuriken", "IWeapon");
        let shurikenRequest = new Request("IWeapon", null, ninjaRequest, shurikenBinding, shurikenTarget);

        katanaBindingWhenSyntax.whenParentTagged("sneaky", true);
        shurikenBindingWhenSyntax.whenParentTagged("sneaky", true);
        expect(katanaBinding.constraint(katanaRequest)).eql(false);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(true);

        katanaBindingWhenSyntax.whenParentTagged("sneaky", false);
        shurikenBindingWhenSyntax.whenParentTagged("sneaky", false);
        expect(katanaBinding.constraint(katanaRequest)).eql(true);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(false);

    });

    describe("BindingWhenSyntax.when*Ancestor*()", () => {

        interface IMaterial {
            name: string;
        }

        class Wood implements IMaterial {
            public name = "Wood";
        }

        class Iron implements IMaterial {
            public name = "Wood";
        }

        interface IWeapon {
            name: string;
            material: IMaterial;
        }

        class Katana implements IWeapon {
            public name = "Katana";
            public material: IMaterial;
            public contructor(material: IMaterial) {
                this.material = material;
            }
        }

        class Shuriken implements IWeapon {
            public name = "Shuriken";
            public material: IMaterial;
            public contructor(material: IMaterial) {
                this.material = material;
            }
        }

        interface ISamurai {
            katana: IWeapon;
        }

        interface INinja {
            shuriken: IWeapon;
        }

        class NinjaMaster implements INinja {
            public shuriken: IWeapon;
            public constructor(shuriken: IWeapon) {
                this.shuriken = shuriken;
            }
        }

        class SamuraiMaster implements ISamurai {
            public katana: IWeapon;
            public constructor(katana: IWeapon) {
                this.katana = katana;
            }
        }

        class NinjaStudent implements INinja {
            public shuriken: IWeapon;
            public constructor(shuriken: IWeapon) {
                this.shuriken = shuriken;
            }
        }

        class SamuraiStudent implements ISamurai {
            public katana: IWeapon;
            public constructor(katana: IWeapon) {
                this.katana = katana;
            }
        }

        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), NinjaMaster);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), SamuraiMaster);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), NinjaStudent);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), SamuraiStudent);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Katana);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Shuriken);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Wood);
        Reflect.defineMetadata(METADATA_KEY.TYPE_ID, Symbol(), Iron);

        // Samurai
        let samuraiMasterBinding = new Binding<ISamurai>("ISamurai");
        samuraiMasterBinding.implementationType = SamuraiMaster;

        let samuraiStudentBinding = new Binding<ISamurai>("ISamurai");
        samuraiStudentBinding.implementationType = SamuraiStudent;

        let samuraiTarget = new Target(null, "ISamurai", new Metadata("sneaky", false));
        let samuraiMasterRequest = new Request("ISamurai", null, null, samuraiMasterBinding, samuraiTarget);
        let samuraiStudentRequest = new Request("ISamurai", null, null, samuraiStudentBinding, samuraiTarget);

        // Ninja
        let ninjaMasterBinding = new Binding<INinja>("INinja");
        ninjaMasterBinding.implementationType = NinjaMaster;

        let ninjaStudentBinding = new Binding<INinja>("INinja");
        ninjaStudentBinding.implementationType = NinjaStudent;

        let ninjaTarget = new Target(null, "INinja", new Metadata("sneaky", true));
        let ninjaMasterRequest = new Request("INinja", null, null, ninjaMasterBinding, ninjaTarget);
        let ninjaStudentRequest = new Request("INinja", null, null, ninjaStudentBinding, ninjaTarget);

        // Katana
        let katanaBinding = new Binding<IWeapon>("IWeapon");
        katanaBinding.implementationType = Katana;
        let katanaBindingWhenSyntax = new BindingWhenSyntax<IWeapon>(katanaBinding);
        let katanaTarget = new Target("katana", "IWeapon");
        let ironKatanaRequest = new Request("IWeapon", null, samuraiMasterRequest, katanaBinding, katanaTarget);
        let woodKatanaRequest = new Request("IWeapon", null, samuraiStudentRequest, katanaBinding, katanaTarget);

        // Shuriken
        let shurikenBinding = new Binding<IWeapon>("IWeapon");
        shurikenBinding.implementationType = Shuriken;
        let shurikenBindingWhenSyntax = new BindingWhenSyntax<IWeapon>(shurikenBinding);
        let shurikenTarget = new Target("shuriken", "IWeapon");
        let ironShurikenRequest = new Request("IWeapon", null, ninjaMasterRequest, shurikenBinding, shurikenTarget);
        let woodShurikenRequest = new Request("IWeapon", null, ninjaStudentRequest, shurikenBinding, shurikenTarget);

        it("Should be able to apply a type constraint to some of its ancestors", () => {

            shurikenBindingWhenSyntax.whenAnyAncestorIs(NinjaMaster);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

            shurikenBindingWhenSyntax.whenAnyAncestorIs(NinjaStudent);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

            katanaBindingWhenSyntax.whenAnyAncestorIs(SamuraiMaster);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

            katanaBindingWhenSyntax.whenAnyAncestorIs(SamuraiStudent);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

        });

        it("Should be able to apply a type constraint to none of its ancestors", () => {

            shurikenBindingWhenSyntax.whenNoAncestorIs(NinjaMaster);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

            shurikenBindingWhenSyntax.whenNoAncestorIs(NinjaStudent);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

            katanaBindingWhenSyntax.whenNoAncestorIs(SamuraiMaster);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

            katanaBindingWhenSyntax.whenNoAncestorIs(SamuraiStudent);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

        });

        it("Should be able to apply a named constraint to some of its ancestors", () => {

            shurikenBindingWhenSyntax.whenAnyAncestorNamed("chinese");
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

            shurikenBindingWhenSyntax.whenAnyAncestorNamed("chinese");
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

            katanaBindingWhenSyntax.whenAnyAncestorNamed("japonese");
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

            katanaBindingWhenSyntax.whenAnyAncestorNamed("japonese");
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

        });

        it("Should be able to apply a named constraint to none of its ancestors", () => {

            shurikenBindingWhenSyntax.whenNoAncestorNamed("chinese");
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

            shurikenBindingWhenSyntax.whenNoAncestorNamed("chinese");
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

            katanaBindingWhenSyntax.whenNoAncestorNamed("japonese");
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

            katanaBindingWhenSyntax.whenNoAncestorNamed("japonese");
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

        });

        it("Should be able to apply a tagged constraint to some of its ancestors", () => {

            shurikenBindingWhenSyntax.whenAnyAncestorTagged("sneaky", true);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

            shurikenBindingWhenSyntax.whenAnyAncestorTagged("sneaky", false);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

            katanaBindingWhenSyntax.whenAnyAncestorTagged("sneaky", true);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

            katanaBindingWhenSyntax.whenAnyAncestorTagged("sneaky", false);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

        });

        it("Should be able to apply a tagged constraint to none of its ancestors", () => {

            shurikenBindingWhenSyntax.whenNoAncestorTagged("sneaky", true);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

            shurikenBindingWhenSyntax.whenNoAncestorTagged("sneaky", false);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

            katanaBindingWhenSyntax.whenNoAncestorTagged("sneaky", true);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

            katanaBindingWhenSyntax.whenNoAncestorTagged("sneaky", false);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

        });

        it("Should be able to apply a custom constraint to some of its ancestors", () => {

            let anyAncestorIsNinjaMasterConstraint = typeConstraint(NinjaMaster);
            let anyAncestorIsNinjaStudentConstraint = typeConstraint(NinjaStudent);

            shurikenBindingWhenSyntax.whenAnyAncestorMatches(anyAncestorIsNinjaMasterConstraint);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

            shurikenBindingWhenSyntax.whenAnyAncestorMatches(anyAncestorIsNinjaStudentConstraint);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

            let anyAncestorIsSamuraiMasterConstraint = typeConstraint(SamuraiMaster);
            let anyAncestorIsSamuraiStudentConstraint = typeConstraint(SamuraiStudent);

            katanaBindingWhenSyntax.whenAnyAncestorMatches(anyAncestorIsSamuraiMasterConstraint);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

            katanaBindingWhenSyntax.whenAnyAncestorMatches(anyAncestorIsSamuraiStudentConstraint);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

        });

        it("Should be able to apply a custom constraint to none of its ancestors", () => {

            let anyAncestorIsNinjaMasterConstraint = typeConstraint(NinjaMaster);
            let anyAncestorIsNinjaStudentConstraint = typeConstraint(NinjaStudent);

            shurikenBindingWhenSyntax.whenNoAncestorMatches(anyAncestorIsNinjaMasterConstraint);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

            shurikenBindingWhenSyntax.whenNoAncestorMatches(anyAncestorIsNinjaStudentConstraint);
            expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
            expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

            let anyAncestorIsSamuraiMasterConstraint = typeConstraint(SamuraiMaster);
            let anyAncestorIsSamuraiStudentConstraint = typeConstraint(SamuraiStudent);

            katanaBindingWhenSyntax.whenNoAncestorMatches(anyAncestorIsSamuraiMasterConstraint);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

            katanaBindingWhenSyntax.whenNoAncestorMatches(anyAncestorIsSamuraiStudentConstraint);
            expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
            expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);
        });

    });

});
