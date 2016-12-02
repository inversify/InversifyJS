import { interfaces } from "../../src/interfaces/interfaces";
import { expect } from "chai";
import { Binding } from "../../src/bindings/binding";
import { Request } from "../../src/planning/request";
import { Target } from "../../src/planning/target";
import { Metadata } from "../../src/planning/metadata";
import { BindingWhenSyntax } from "../../src/syntax/binding_when_syntax";
import { typeConstraint } from "../../src/syntax/constraint_helpers";
import { BindingScopeEnum, TargetTypeEnum } from "../../src/constants/literal_types";
import { Context } from "../../src/planning/context";
import { Container } from "../../src/container/container";

describe("BindingWhenSyntax", () => {

    it("Should set its own properties correctly", () => {

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        let bindingWhenSyntax = new BindingWhenSyntax<Ninja>(binding);

        // cast to any to be able to access private props
        let _bindingWhenSyntax: any = bindingWhenSyntax;

        expect(_bindingWhenSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

    });

    it("Should be able to configure custom constraint of a binding", () => {

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        let bindingWhenSyntax = new BindingWhenSyntax<Ninja>(binding);

        bindingWhenSyntax.when((request: interfaces.Request) => {
            return request.target.name.equals("ninja");
        });

        let target = new Target(TargetTypeEnum.ConstructorArgument, "ninja", ninjaIdentifier);
        let context = new Context(new Container());
        let request = new Request(ninjaIdentifier, context, null, binding, target);
        expect(binding.constraint(request)).eql(true);

    });

    it("Should be able to constraint a binding to a named target", () => {

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        let bindingWhenSyntax = new BindingWhenSyntax<Ninja>(binding);

        let named = "primary";

        bindingWhenSyntax.whenTargetNamed(named);
        expect(binding.constraint).not.to.eql(null);

        let context = new Context(new Container());

        let target = new Target(TargetTypeEnum.ConstructorArgument, "ninja", ninjaIdentifier, named);
        let request = new Request(ninjaIdentifier, context, null, binding, target);
        expect(binding.constraint(request)).eql(true);

        let target2 = new Target(TargetTypeEnum.ConstructorArgument, "ninja", ninjaIdentifier);
        let request2 = new Request(ninjaIdentifier, context, null, binding, target2);
        expect(binding.constraint(request2)).eql(false);

    });

    it("Should be able to constraint a binding to a tagged target", () => {

        interface Ninja {}
        let ninjaIdentifier = "Ninja";

        let binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
        let bindingWhenSyntax = new BindingWhenSyntax<Ninja>(binding);

        bindingWhenSyntax.whenTargetTagged("canSwim", true);
        expect(binding.constraint).not.to.eql(null);

        let context = new Context(new Container());

        let target = new Target(TargetTypeEnum.ConstructorArgument, "ninja", ninjaIdentifier, new Metadata("canSwim", true));
        let request = new Request(ninjaIdentifier, context, null, binding, target);
        expect(binding.constraint(request)).eql(true);

        let target2 = new Target(TargetTypeEnum.ConstructorArgument, "ninja", ninjaIdentifier, new Metadata("canSwim", false));
        let request2 = new Request(ninjaIdentifier, context, null, binding, target2);
        expect(binding.constraint(request2)).eql(false);

    });

    it("Should be able to constraint a binding to its parent", () => {

        interface Weapon {
            name: string;
        }

        interface JaponeseWarrior {
            katana: Weapon;
        }

        interface ChineseWarrior {
            shuriken: Weapon;
        }

        class Ninja implements ChineseWarrior {
            public shuriken: Weapon;
            public constructor(shuriken: Weapon) {
                this.shuriken = shuriken;
            }
        }

        class Samurai implements JaponeseWarrior {
            public katana: Weapon;
            public constructor(katana: Weapon) {
                this.katana = katana;
            }
        }

        let context = new Context(new Container());

        let samuraiBinding = new Binding<Samurai>("Samurai", BindingScopeEnum.Transient);
        samuraiBinding.implementationType = Samurai;
        let samuraiTarget = new Target(TargetTypeEnum.Variable, "", "Samurai");
        let samuraiRequest = new Request("Samurai", context, null, samuraiBinding, samuraiTarget);

        let ninjaBinding = new Binding<Ninja>("Ninja", BindingScopeEnum.Transient);
        ninjaBinding.implementationType = Ninja;
        let ninjaTarget = new Target(TargetTypeEnum.Variable, "", "Ninja");
        let ninjaRequest = new Request("Ninja", context, null, ninjaBinding, ninjaTarget);

        let katanaBinding = new Binding<Weapon>("Weapon", BindingScopeEnum.Transient);
        let katanaBindingWhenSyntax = new BindingWhenSyntax<Weapon>(katanaBinding);
        let katanaTarget = new Target(TargetTypeEnum.ConstructorArgument, "katana", "Weapon");
        let katanaRequest = new Request("Weapon", context, samuraiRequest, katanaBinding, katanaTarget);

        let shurikenBinding = new Binding<Weapon>("Weapon", BindingScopeEnum.Transient);
        let shurikenBindingWhenSyntax = new BindingWhenSyntax<Weapon>(shurikenBinding);
        let shurikenTarget = new Target(TargetTypeEnum.ConstructorArgument, "shuriken", "Weapon");
        let shurikenRequest = new Request("Weapon", context, ninjaRequest, shurikenBinding, shurikenTarget);

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

        katanaBindingWhenSyntax.whenInjectedInto("Samurai");
        expect(katanaBinding.constraint(katanaRequest)).eql(true);
        expect(katanaBinding.constraint(shurikenRequest)).eql(false);

        katanaBindingWhenSyntax.whenInjectedInto("Ninja");
        expect(katanaBinding.constraint(katanaRequest)).eql(false);
        expect(katanaBinding.constraint(shurikenRequest)).eql(true);

        shurikenBindingWhenSyntax.whenInjectedInto("Samurai");
        expect(shurikenBinding.constraint(katanaRequest)).eql(true);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(false);

        shurikenBindingWhenSyntax.whenInjectedInto("Ninja");
        expect(shurikenBinding.constraint(katanaRequest)).eql(false);
        expect(shurikenBinding.constraint(shurikenRequest)).eql(true);

    });

    it("Should be able to constraint a binding to a named parent", () => {

        interface Weapon {
            name: string;
        }

        interface JaponeseWarrior {
            katana: Weapon;
        }

        interface ChineseWarrior {
            shuriken: Weapon;
        }

        class Ninja implements ChineseWarrior {
            public shuriken: Weapon;
            public constructor(shuriken: Weapon) {
                this.shuriken = shuriken;
            }
        }

        class Samurai implements JaponeseWarrior {
            public katana: Weapon;
            public constructor(katana: Weapon) {
                this.katana = katana;
            }
        }

        let samuraiBinding = new Binding<Samurai>("Samurai", BindingScopeEnum.Transient);
        samuraiBinding.implementationType = Samurai;

        let context = new Context(new Container());

        let samuraiTarget = new Target(TargetTypeEnum.ConstructorArgument, "", "Samurai", "japonese");
        let samuraiRequest = new Request("Samurai", context, null, samuraiBinding, samuraiTarget);
        let ninjaBinding = new Binding<Ninja>("Ninja", BindingScopeEnum.Transient);

        ninjaBinding.implementationType = Ninja;

        let ninjaTarget = new Target(TargetTypeEnum.ConstructorArgument, "", "Ninja", "chinese");
        let ninjaRequest = new Request("Ninja", context, null, ninjaBinding, ninjaTarget);

        let katanaBinding = new Binding<Weapon>("Weapon", BindingScopeEnum.Transient);
        let katanaBindingWhenSyntax = new BindingWhenSyntax<Weapon>(katanaBinding);
        let katanaTarget = new Target(TargetTypeEnum.ConstructorArgument, "katana", "Weapon");
        let katanaRequest = new Request("Weapon", context, samuraiRequest, katanaBinding, katanaTarget);

        let shurikenBinding = new Binding<Weapon>("Weapon", BindingScopeEnum.Transient);
        let shurikenBindingWhenSyntax = new BindingWhenSyntax<Weapon>(shurikenBinding);
        let shurikenTarget = new Target(TargetTypeEnum.ConstructorArgument, "shuriken", "Weapon");
        let shurikenRequest = new Request("Weapon", context, ninjaRequest, shurikenBinding, shurikenTarget);

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

        interface Weapon {
            name: string;
        }

        interface JaponeseWarrior {
            katana: Weapon;
        }

        interface ChineseWarrior {
            shuriken: Weapon;
        }

        class Ninja implements ChineseWarrior {
            public shuriken: Weapon;
            public constructor(shuriken: Weapon) {
                this.shuriken = shuriken;
            }
        }

        class Samurai implements JaponeseWarrior {
            public katana: Weapon;
            public constructor(katana: Weapon) {
                this.katana = katana;
            }
        }

        let context = new Context(new Container());

        let samuraiBinding = new Binding<Samurai>("Samurai", BindingScopeEnum.Transient);
        samuraiBinding.implementationType = Samurai;

        let samuraiTarget = new Target(TargetTypeEnum.ConstructorArgument, "", "Samurai", new Metadata("sneaky", false));
        let samuraiRequest = new Request("Samurai", context, null, samuraiBinding, samuraiTarget);

        let ninjaBinding = new Binding<Ninja>("Ninja", BindingScopeEnum.Transient);
        ninjaBinding.implementationType = Ninja;
        let ninjaTarget = new Target(TargetTypeEnum.ConstructorArgument, "", "Ninja", new Metadata("sneaky", true));
        let ninjaRequest = new Request("Ninja", context, null, ninjaBinding, ninjaTarget);

        let katanaBinding = new Binding<Weapon>("Weapon", BindingScopeEnum.Transient);
        let katanaBindingWhenSyntax = new BindingWhenSyntax<Weapon>(katanaBinding);
        let katanaTarget = new Target(TargetTypeEnum.ConstructorArgument, "katana", "Weapon");
        let katanaRequest = new Request("Weapon", context, samuraiRequest, katanaBinding, katanaTarget);

        let shurikenBinding = new Binding<Weapon>("Weapon", BindingScopeEnum.Transient);
        let shurikenBindingWhenSyntax = new BindingWhenSyntax<Weapon>(shurikenBinding);
        let shurikenTarget = new Target(TargetTypeEnum.ConstructorArgument, "shuriken", "Weapon");
        let shurikenRequest = new Request("Weapon", context, ninjaRequest, shurikenBinding, shurikenTarget);

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

        interface Material {
            name: string;
        }

        interface Weapon {
            name: string;
            material: Material;
        }

        class Katana implements Weapon {
            public name = "Katana";
            public material: Material;
            public contructor(material: Material) {
                this.material = material;
            }
        }

        class Shuriken implements Weapon {
            public name = "Shuriken";
            public material: Material;
            public contructor(material: Material) {
                this.material = material;
            }
        }

        interface Samurai {
            katana: Weapon;
        }

        interface Ninja {
            shuriken: Weapon;
        }

        class NinjaMaster implements Ninja {
            public shuriken: Weapon;
            public constructor(shuriken: Weapon) {
                this.shuriken = shuriken;
            }
        }

        class SamuraiMaster implements Samurai {
            public katana: Weapon;
            public constructor(katana: Weapon) {
                this.katana = katana;
            }
        }

        class NinjaStudent implements Ninja {
            public shuriken: Weapon;
            public constructor(shuriken: Weapon) {
                this.shuriken = shuriken;
            }
        }

        class SamuraiStudent implements Samurai {
            public katana: Weapon;
            public constructor(katana: Weapon) {
                this.katana = katana;
            }
        }

        let context = new Context(new Container());

        // Samurai
        let samuraiMasterBinding = new Binding<Samurai>("Samurai", BindingScopeEnum.Transient);
        samuraiMasterBinding.implementationType = SamuraiMaster;

        let samuraiStudentBinding = new Binding<Samurai>("Samurai", BindingScopeEnum.Transient);
        samuraiStudentBinding.implementationType = SamuraiStudent;

        let samuraiTarget = new Target(TargetTypeEnum.ConstructorArgument, "", "Samurai", new Metadata("sneaky", false));
        let samuraiMasterRequest = new Request("Samurai", context, null, samuraiMasterBinding, samuraiTarget);
        let samuraiStudentRequest = new Request("Samurai", context, null, samuraiStudentBinding, samuraiTarget);

        // Ninja
        let ninjaMasterBinding = new Binding<Ninja>("Ninja", BindingScopeEnum.Transient);
        ninjaMasterBinding.implementationType = NinjaMaster;

        let ninjaStudentBinding = new Binding<Ninja>("Ninja", BindingScopeEnum.Transient);
        ninjaStudentBinding.implementationType = NinjaStudent;

        let ninjaTarget = new Target(TargetTypeEnum.ConstructorArgument, "", "Ninja", new Metadata("sneaky", true));
        let ninjaMasterRequest = new Request("Ninja", context, null, ninjaMasterBinding, ninjaTarget);
        let ninjaStudentRequest = new Request("Ninja", context, null, ninjaStudentBinding, ninjaTarget);

        // Katana
        let katanaBinding = new Binding<Weapon>("Weapon", BindingScopeEnum.Transient);
        katanaBinding.implementationType = Katana;
        let katanaBindingWhenSyntax = new BindingWhenSyntax<Weapon>(katanaBinding);
        let katanaTarget = new Target(TargetTypeEnum.ConstructorArgument, "katana", "Weapon");
        let ironKatanaRequest = new Request("Weapon", context, samuraiMasterRequest, katanaBinding, katanaTarget);
        let woodKatanaRequest = new Request("Weapon", context, samuraiStudentRequest, katanaBinding, katanaTarget);

        // Shuriken
        let shurikenBinding = new Binding<Weapon>("Weapon", BindingScopeEnum.Transient);
        shurikenBinding.implementationType = Shuriken;
        let shurikenBindingWhenSyntax = new BindingWhenSyntax<Weapon>(shurikenBinding);
        let shurikenTarget = new Target(TargetTypeEnum.ConstructorArgument, "shuriken", "Weapon");
        let ironShurikenRequest = new Request("Weapon", context, ninjaMasterRequest, shurikenBinding, shurikenTarget);
        let woodShurikenRequest = new Request("Weapon", context, ninjaStudentRequest, shurikenBinding, shurikenTarget);

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
