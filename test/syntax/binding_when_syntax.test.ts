import { expect } from 'chai';

import { Binding } from '../../src/bindings/binding';
import {
  BindingScopeEnum,
  TargetTypeEnum,
} from '../../src/constants/literal_types';
import { Container } from '../../src/container/container';
import { interfaces } from '../../src/interfaces/interfaces';
import { Context } from '../../src/planning/context';
import { Metadata } from '../../src/planning/metadata';
import { Request } from '../../src/planning/request';
import { Target } from '../../src/planning/target';
import { BindingWhenSyntax } from '../../src/syntax/binding_when_syntax';
import { typeConstraint } from '../../src/syntax/constraint_helpers';

describe('BindingWhenSyntax', () => {
  it('Should set its own properties correctly', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );
    const bindingWhenSyntax: BindingWhenSyntax<unknown> = new BindingWhenSyntax(
      binding,
    );
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _bindingWhenSyntax: {
      _binding: Binding<unknown>;
    } = bindingWhenSyntax as unknown as {
      _binding: Binding<unknown>;
    };

    expect(_bindingWhenSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);
  });

  it('Should be able to configure custom constraint of a binding', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );
    const bindingWhenSyntax: BindingWhenSyntax<unknown> = new BindingWhenSyntax(
      binding,
    );

    bindingWhenSyntax.when((theRequest: interfaces.Request) =>
      theRequest.target.name.equals('ninja'),
    );

    const target: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'ninja',
      ninjaIdentifier,
    );
    const context: Context = new Context(new Container());
    const request: Request = new Request(
      ninjaIdentifier,
      context,
      null,
      binding,
      target,
    );
    expect(binding.constraint(request)).eql(true);
  });

  it('Should have false constraint binding null request whenTargetIsDefault', () => {
    interface Weapon {
      name: string;
    }

    const shurikenBinding: Binding<Weapon> = new Binding(
      'Weapon',
      BindingScopeEnum.Transient,
    );
    const shurikenBindingWhenSyntax: BindingWhenSyntax<Weapon> =
      new BindingWhenSyntax<Weapon>(shurikenBinding);

    shurikenBindingWhenSyntax.whenTargetIsDefault();
    expect(shurikenBinding.constraint(null)).eql(false);
  });

  it('Should be able to constraint a binding to a named target', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );
    const bindingWhenSyntax: BindingWhenSyntax<unknown> = new BindingWhenSyntax(
      binding,
    );

    const named: string = 'primary';

    bindingWhenSyntax.whenTargetNamed(named);
    expect(binding.constraint).not.to.eql(null);

    const context: Context = new Context(new Container());

    const target: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'ninja',
      ninjaIdentifier,
      named,
    );
    const request: Request = new Request(
      ninjaIdentifier,
      context,
      null,
      binding,
      target,
    );
    expect(binding.constraint(request)).eql(true);

    const target2: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'ninja',
      ninjaIdentifier,
    );
    const request2: Request = new Request(
      ninjaIdentifier,
      context,
      null,
      binding,
      target2,
    );
    expect(binding.constraint(request2)).eql(false);
  });

  it('Should be able to constraint a binding to a tagged target', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );
    const bindingWhenSyntax: BindingWhenSyntax<unknown> = new BindingWhenSyntax(
      binding,
    );

    bindingWhenSyntax.whenTargetTagged('canSwim', true);
    expect(binding.constraint).not.to.eql(null);

    const context: Context = new Context(new Container());

    const target: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'ninja',
      ninjaIdentifier,
      new Metadata('canSwim', true),
    );
    const request: Request = new Request(
      ninjaIdentifier,
      context,
      null,
      binding,
      target,
    );
    expect(binding.constraint(request)).eql(true);

    const target2: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'ninja',
      ninjaIdentifier,
      new Metadata('canSwim', false),
    );
    const request2: Request = new Request(
      ninjaIdentifier,
      context,
      null,
      binding,
      target2,
    );
    expect(binding.constraint(request2)).eql(false);
  });

  it('Should be able to constraint a binding to its parent', () => {
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
      constructor(shuriken: Weapon) {
        this.shuriken = shuriken;
      }
    }

    class Samurai implements JaponeseWarrior {
      public katana: Weapon;
      constructor(katana: Weapon) {
        this.katana = katana;
      }
    }

    const context: Context = new Context(new Container());

    const samuraiBinding: Binding<Samurai> = new Binding<Samurai>(
      'Samurai',
      BindingScopeEnum.Transient,
    );
    samuraiBinding.implementationType = Samurai;
    const samuraiTarget: Target = new Target(
      TargetTypeEnum.Variable,
      '',
      'Samurai',
    );
    const samuraiRequest: Request = new Request(
      'Samurai',
      context,
      null,
      samuraiBinding,
      samuraiTarget,
    );

    const ninjaBinding: Binding<Ninja> = new Binding(
      'Ninja',
      BindingScopeEnum.Transient,
    );
    ninjaBinding.implementationType = Ninja;
    const ninjaTarget: Target = new Target(
      TargetTypeEnum.Variable,
      '',
      'Ninja',
    );
    const ninjaRequest: Request = new Request(
      'Ninja',
      context,
      null,
      ninjaBinding,
      ninjaTarget,
    );

    const katanaBinding: Binding<Weapon> = new Binding<Weapon>(
      'Weapon',
      BindingScopeEnum.Transient,
    );
    const katanaBindingWhenSyntax: BindingWhenSyntax<Weapon> =
      new BindingWhenSyntax<Weapon>(katanaBinding);
    const katanaTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'katana',
      'Weapon',
    );
    const katanaRequest: Request = new Request(
      'Weapon',
      context,
      samuraiRequest,
      katanaBinding,
      katanaTarget,
    );

    const shurikenBinding: Binding<Weapon> = new Binding<Weapon>(
      'Weapon',
      BindingScopeEnum.Transient,
    );
    const shurikenBindingWhenSyntax: BindingWhenSyntax<Weapon> =
      new BindingWhenSyntax<Weapon>(shurikenBinding);
    const shurikenTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'shuriken',
      'Weapon',
    );
    const shurikenRequest: Request = new Request(
      'Weapon',
      context,
      ninjaRequest,
      shurikenBinding,
      shurikenTarget,
    );

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

    katanaBindingWhenSyntax.whenInjectedInto('Samurai');
    expect(katanaBinding.constraint(katanaRequest)).eql(true);
    expect(katanaBinding.constraint(shurikenRequest)).eql(false);

    katanaBindingWhenSyntax.whenInjectedInto('Ninja');
    expect(katanaBinding.constraint(katanaRequest)).eql(false);
    expect(katanaBinding.constraint(shurikenRequest)).eql(true);

    shurikenBindingWhenSyntax.whenInjectedInto('Samurai');
    expect(shurikenBinding.constraint(katanaRequest)).eql(true);
    expect(shurikenBinding.constraint(shurikenRequest)).eql(false);

    shurikenBindingWhenSyntax.whenInjectedInto('Ninja');
    expect(shurikenBinding.constraint(katanaRequest)).eql(false);
    expect(shurikenBinding.constraint(shurikenRequest)).eql(true);
  });

  it('Should be able to constraint a binding to a named parent', () => {
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
      constructor(shuriken: Weapon) {
        this.shuriken = shuriken;
      }
    }

    class Samurai implements JaponeseWarrior {
      public katana: Weapon;
      constructor(katana: Weapon) {
        this.katana = katana;
      }
    }

    const samuraiBinding: Binding<Samurai> = new Binding<Samurai>(
      'Samurai',
      BindingScopeEnum.Transient,
    );
    samuraiBinding.implementationType = Samurai;

    const context: Context = new Context(new Container());

    const samuraiTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      '',
      'Samurai',
      'japonese',
    );
    const samuraiRequest: Request = new Request(
      'Samurai',
      context,
      null,
      samuraiBinding,
      samuraiTarget,
    );
    const ninjaBinding: Binding<Ninja> = new Binding<Ninja>(
      'Ninja',
      BindingScopeEnum.Transient,
    );

    ninjaBinding.implementationType = Ninja;

    const ninjaTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      '',
      'Ninja',
      'chinese',
    );
    const ninjaRequest: Request = new Request(
      'Ninja',
      context,
      null,
      ninjaBinding,
      ninjaTarget,
    );

    const katanaBinding: Binding<Weapon> = new Binding<Weapon>(
      'Weapon',
      BindingScopeEnum.Transient,
    );
    const katanaBindingWhenSyntax: BindingWhenSyntax<Weapon> =
      new BindingWhenSyntax<Weapon>(katanaBinding);
    const katanaTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'katana',
      'Weapon',
    );
    const katanaRequest: Request = new Request(
      'Weapon',
      context,
      samuraiRequest,
      katanaBinding,
      katanaTarget,
    );

    const shurikenBinding: Binding<Weapon> = new Binding<Weapon>(
      'Weapon',
      BindingScopeEnum.Transient,
    );
    const shurikenBindingWhenSyntax: BindingWhenSyntax<Weapon> =
      new BindingWhenSyntax<Weapon>(shurikenBinding);
    const shurikenTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'shuriken',
      'Weapon',
    );
    const shurikenRequest: Request = new Request(
      'Weapon',
      context,
      ninjaRequest,
      shurikenBinding,
      shurikenTarget,
    );

    katanaBindingWhenSyntax.whenParentNamed('chinese');
    shurikenBindingWhenSyntax.whenParentNamed('chinese');
    expect(katanaBinding.constraint(katanaRequest)).eql(false);
    expect(shurikenBinding.constraint(shurikenRequest)).eql(true);

    katanaBindingWhenSyntax.whenParentNamed('japonese');
    shurikenBindingWhenSyntax.whenParentNamed('japonese');
    expect(katanaBinding.constraint(katanaRequest)).eql(true);
    expect(shurikenBinding.constraint(shurikenRequest)).eql(false);
  });

  it('Should be able to constraint a binding to a tagged parent', () => {
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
      constructor(shuriken: Weapon) {
        this.shuriken = shuriken;
      }
    }

    class Samurai implements JaponeseWarrior {
      public katana: Weapon;
      constructor(katana: Weapon) {
        this.katana = katana;
      }
    }

    const context: Context = new Context(new Container());

    const samuraiBinding: Binding<Samurai> = new Binding<Samurai>(
      'Samurai',
      BindingScopeEnum.Transient,
    );
    samuraiBinding.implementationType = Samurai;

    const samuraiTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      '',
      'Samurai',
      new Metadata('sneaky', false),
    );
    const samuraiRequest: Request = new Request(
      'Samurai',
      context,
      null,
      samuraiBinding,
      samuraiTarget,
    );

    const ninjaBinding: Binding<Ninja> = new Binding<Ninja>(
      'Ninja',
      BindingScopeEnum.Transient,
    );
    ninjaBinding.implementationType = Ninja;
    const ninjaTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      '',
      'Ninja',
      new Metadata('sneaky', true),
    );
    const ninjaRequest: Request = new Request(
      'Ninja',
      context,
      null,
      ninjaBinding,
      ninjaTarget,
    );

    const katanaBinding: Binding<Weapon> = new Binding<Weapon>(
      'Weapon',
      BindingScopeEnum.Transient,
    );
    const katanaBindingWhenSyntax: BindingWhenSyntax<Weapon> =
      new BindingWhenSyntax<Weapon>(katanaBinding);
    const katanaTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'katana',
      'Weapon',
    );
    const katanaRequest: Request = new Request(
      'Weapon',
      context,
      samuraiRequest,
      katanaBinding,
      katanaTarget,
    );

    const shurikenBinding: Binding<Weapon> = new Binding<Weapon>(
      'Weapon',
      BindingScopeEnum.Transient,
    );
    const shurikenBindingWhenSyntax: BindingWhenSyntax<Weapon> =
      new BindingWhenSyntax<Weapon>(shurikenBinding);
    const shurikenTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'shuriken',
      'Weapon',
    );
    const shurikenRequest: Request = new Request(
      'Weapon',
      context,
      ninjaRequest,
      shurikenBinding,
      shurikenTarget,
    );

    katanaBindingWhenSyntax.whenParentTagged('sneaky', true);
    shurikenBindingWhenSyntax.whenParentTagged('sneaky', true);
    expect(katanaBinding.constraint(katanaRequest)).eql(false);
    expect(shurikenBinding.constraint(shurikenRequest)).eql(true);

    katanaBindingWhenSyntax.whenParentTagged('sneaky', false);
    shurikenBindingWhenSyntax.whenParentTagged('sneaky', false);
    expect(katanaBinding.constraint(katanaRequest)).eql(true);
    expect(shurikenBinding.constraint(shurikenRequest)).eql(false);
  });

  describe('BindingWhenSyntax.when*Ancestor*()', () => {
    interface Material {
      name: string;
    }

    interface Weapon {
      name: string;
      material: Material;
    }

    class Katana implements Weapon {
      public name: string = 'Katana';
      public material: Material;
      constructor(material: Material) {
        this.material = material;
      }
    }

    class Shuriken implements Weapon {
      public name: string = 'Shuriken';
      public material: Material;
      constructor(material: Material) {
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
      constructor(shuriken: Weapon) {
        this.shuriken = shuriken;
      }
    }

    class SamuraiMaster implements Samurai {
      public katana: Weapon;
      constructor(katana: Weapon) {
        this.katana = katana;
      }
    }

    class NinjaStudent implements Ninja {
      public shuriken: Weapon;
      constructor(shuriken: Weapon) {
        this.shuriken = shuriken;
      }
    }

    class SamuraiStudent implements Samurai {
      public katana: Weapon;
      constructor(katana: Weapon) {
        this.katana = katana;
      }
    }

    const context: Context = new Context(new Container());

    // Samurai
    const samuraiMasterBinding: Binding<Samurai> = new Binding<Samurai>(
      'Samurai',
      BindingScopeEnum.Transient,
    );
    samuraiMasterBinding.implementationType = SamuraiMaster;

    const samuraiStudentBinding: Binding<Samurai> = new Binding<Samurai>(
      'Samurai',
      BindingScopeEnum.Transient,
    );
    samuraiStudentBinding.implementationType = SamuraiStudent;

    const samuraiTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      '',
      'Samurai',
      new Metadata('sneaky', false),
    );
    const samuraiMasterRequest: Request = new Request(
      'Samurai',
      context,
      null,
      samuraiMasterBinding,
      samuraiTarget,
    );
    const samuraiStudentRequest: Request = new Request(
      'Samurai',
      context,
      null,
      samuraiStudentBinding,
      samuraiTarget,
    );

    // Ninja
    const ninjaMasterBinding: Binding<Ninja> = new Binding<Ninja>(
      'Ninja',
      BindingScopeEnum.Transient,
    );
    ninjaMasterBinding.implementationType = NinjaMaster;

    const ninjaStudentBinding: Binding<Ninja> = new Binding<Ninja>(
      'Ninja',
      BindingScopeEnum.Transient,
    );
    ninjaStudentBinding.implementationType = NinjaStudent;

    const ninjaTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      '',
      'Ninja',
      new Metadata('sneaky', true),
    );
    const ninjaMasterRequest: Request = new Request(
      'Ninja',
      context,
      null,
      ninjaMasterBinding,
      ninjaTarget,
    );
    const ninjaStudentRequest: Request = new Request(
      'Ninja',
      context,
      null,
      ninjaStudentBinding,
      ninjaTarget,
    );

    // Katana
    const katanaBinding: Binding<Weapon> = new Binding<Weapon>(
      'Weapon',
      BindingScopeEnum.Transient,
    );
    katanaBinding.implementationType = Katana;
    const katanaBindingWhenSyntax: BindingWhenSyntax<Weapon> =
      new BindingWhenSyntax<Weapon>(katanaBinding);
    const katanaTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'katana',
      'Weapon',
    );
    const ironKatanaRequest: Request = new Request(
      'Weapon',
      context,
      samuraiMasterRequest,
      katanaBinding,
      katanaTarget,
    );
    const woodKatanaRequest: Request = new Request(
      'Weapon',
      context,
      samuraiStudentRequest,
      katanaBinding,
      katanaTarget,
    );

    // Shuriken
    const shurikenBinding: Binding<Weapon> = new Binding<Weapon>(
      'Weapon',
      BindingScopeEnum.Transient,
    );
    shurikenBinding.implementationType = Shuriken;
    const shurikenBindingWhenSyntax: BindingWhenSyntax<Weapon> =
      new BindingWhenSyntax<Weapon>(shurikenBinding);
    const shurikenTarget: Target = new Target(
      TargetTypeEnum.ConstructorArgument,
      'shuriken',
      'Weapon',
    );
    const ironShurikenRequest: Request = new Request(
      'Weapon',
      context,
      ninjaMasterRequest,
      shurikenBinding,
      shurikenTarget,
    );
    const woodShurikenRequest: Request = new Request(
      'Weapon',
      context,
      ninjaStudentRequest,
      shurikenBinding,
      shurikenTarget,
    );

    it('Should be able to apply a type constraint to some of its ancestors', () => {
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

    it('Should be able to apply a type constraint to none of its ancestors', () => {
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

    it('Should be able to apply a named constraint to some of its ancestors', () => {
      shurikenBindingWhenSyntax.whenAnyAncestorNamed('chinese');
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

      shurikenBindingWhenSyntax.whenAnyAncestorNamed('chinese');
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

      katanaBindingWhenSyntax.whenAnyAncestorNamed('japonese');
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

      katanaBindingWhenSyntax.whenAnyAncestorNamed('japonese');
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);
    });

    it('Should be able to apply a named constraint to none of its ancestors', () => {
      shurikenBindingWhenSyntax.whenNoAncestorNamed('chinese');
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

      shurikenBindingWhenSyntax.whenNoAncestorNamed('chinese');
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

      katanaBindingWhenSyntax.whenNoAncestorNamed('japonese');
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

      katanaBindingWhenSyntax.whenNoAncestorNamed('japonese');
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);
    });

    it('Should be able to apply a tagged constraint to some of its ancestors', () => {
      shurikenBindingWhenSyntax.whenAnyAncestorTagged('sneaky', true);
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

      shurikenBindingWhenSyntax.whenAnyAncestorTagged('sneaky', false);
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

      katanaBindingWhenSyntax.whenAnyAncestorTagged('sneaky', true);
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

      katanaBindingWhenSyntax.whenAnyAncestorTagged('sneaky', false);
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);
    });

    it('Should be able to apply a tagged constraint to none of its ancestors', () => {
      shurikenBindingWhenSyntax.whenNoAncestorTagged('sneaky', true);
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

      shurikenBindingWhenSyntax.whenNoAncestorTagged('sneaky', false);
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

      katanaBindingWhenSyntax.whenNoAncestorTagged('sneaky', true);
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

      katanaBindingWhenSyntax.whenNoAncestorTagged('sneaky', false);
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);
    });

    it('Should be able to apply a custom constraint to some of its ancestors', () => {
      const anyAncestorIsNinjaMasterConstraint: (
        request: interfaces.Request | null,
      ) => boolean = typeConstraint(NinjaMaster);
      const anyAncestorIsNinjaStudentConstraint: (
        request: interfaces.Request | null,
      ) => boolean = typeConstraint(NinjaStudent);

      shurikenBindingWhenSyntax.whenAnyAncestorMatches(
        anyAncestorIsNinjaMasterConstraint,
      );
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

      shurikenBindingWhenSyntax.whenAnyAncestorMatches(
        anyAncestorIsNinjaStudentConstraint,
      );
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

      const anyAncestorIsSamuraiMasterConstraint: (
        request: interfaces.Request | null,
      ) => boolean = typeConstraint(SamuraiMaster);
      const anyAncestorIsSamuraiStudentConstraint: (
        request: interfaces.Request | null,
      ) => boolean = typeConstraint(SamuraiStudent);

      katanaBindingWhenSyntax.whenAnyAncestorMatches(
        anyAncestorIsSamuraiMasterConstraint,
      );
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);

      katanaBindingWhenSyntax.whenAnyAncestorMatches(
        anyAncestorIsSamuraiStudentConstraint,
      );
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);
    });

    it('Should be able to apply a custom constraint to none of its ancestors', () => {
      const anyAncestorIsNinjaMasterConstraint: (
        request: interfaces.Request | null,
      ) => boolean = typeConstraint(NinjaMaster);
      const anyAncestorIsNinjaStudentConstraint: (
        request: interfaces.Request | null,
      ) => boolean = typeConstraint(NinjaStudent);

      shurikenBindingWhenSyntax.whenNoAncestorMatches(
        anyAncestorIsNinjaMasterConstraint,
      );
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(true);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(false);

      shurikenBindingWhenSyntax.whenNoAncestorMatches(
        anyAncestorIsNinjaStudentConstraint,
      );
      expect(shurikenBinding.constraint(woodShurikenRequest)).eql(false);
      expect(shurikenBinding.constraint(ironShurikenRequest)).eql(true);

      const anyAncestorIsSamuraiMasterConstraint: (
        request: interfaces.Request | null,
      ) => boolean = typeConstraint(SamuraiMaster);
      const anyAncestorIsSamuraiStudentConstraint: (
        request: interfaces.Request | null,
      ) => boolean = typeConstraint(SamuraiStudent);

      katanaBindingWhenSyntax.whenNoAncestorMatches(
        anyAncestorIsSamuraiMasterConstraint,
      );
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(true);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(false);

      katanaBindingWhenSyntax.whenNoAncestorMatches(
        anyAncestorIsSamuraiStudentConstraint,
      );
      expect(katanaBinding.constraint(woodKatanaRequest)).eql(false);
      expect(katanaBinding.constraint(ironKatanaRequest)).eql(true);
    });
  });
});
