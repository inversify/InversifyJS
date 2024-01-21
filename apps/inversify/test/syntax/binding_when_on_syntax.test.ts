import { expect } from 'chai';
import * as sinon from 'sinon';
import { injectable } from '../../src/annotation/injectable';
import { Binding } from '../../src/bindings/binding';
import { BindingScopeEnum } from '../../src/constants/literal_types';
import { interfaces } from '../../src/interfaces/interfaces';
import { BindingWhenOnSyntax } from '../../src/syntax/binding_when_on_syntax';

describe('BindingWhenOnSyntax', () => {

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should set its own properties correctly', () => {

    interface Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingWhenOnSyntax = new BindingWhenOnSyntax<Ninja>(binding);
    const _bindingWhenOnSyntax = bindingWhenOnSyntax as unknown as { _binding: interfaces.Binding<Ninja> }

    expect(_bindingWhenOnSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

  });

  it('Should provide access to BindingWhenSyntax methods', () => {

    interface Army { }

    @injectable()
    class Army implements Army { }

    interface ZombieArmy { }

    @injectable()
    class ZombieArmy implements ZombieArmy { }

    interface Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingWhenOnSyntax = new BindingWhenOnSyntax<Ninja>(binding);

    // cast to any to be able to access private props
    const _bindingWhenOnSyntax: any = bindingWhenOnSyntax;

    // stubs for BindingWhenSyntax methods
    const whenStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, 'when').returns(null);
    const whenTargetNamedStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, 'whenTargetNamed').returns(null);
    const whenTargetTaggedStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, 'whenTargetTagged').returns(null);
    const whenInjectedIntoStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, 'whenInjectedInto').returns(null);
    const whenParentNamedStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, 'whenParentNamed').returns(null);
    const whenParentTaggedStub = sinon.stub(_bindingWhenOnSyntax._bindingWhenSyntax, 'whenParentTagged').returns(null);

    const whenAnyAncestorIsStub = sinon.stub(
      _bindingWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorIs').returns(null);

    const whenNoAncestorIsStub = sinon.stub(
      _bindingWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorIs').returns(null);

    const whenAnyAncestorNamedStub = sinon.stub(
      _bindingWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorNamed').returns(null);

    const whenNoAncestorNamedStub = sinon.stub(
      _bindingWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorNamed').returns(null);

    const whenNoAncestorTaggedStub = sinon.stub(
      _bindingWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorTagged').returns(null);

    const whenAnyAncestorTaggedStub = sinon.stub(
      _bindingWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorTagged').returns(null);

    const whenAnyAncestorMatchesStub = sinon.stub(
      _bindingWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorMatches').returns(null);

    const whenNoAncestorMatchesStub = sinon.stub(
      _bindingWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorMatches').returns(null);

    // invoke BindingWhenOnSyntax methods
    bindingWhenOnSyntax.when((request: interfaces.Request) => true);
    bindingWhenOnSyntax.whenTargetNamed('test');
    bindingWhenOnSyntax.whenTargetTagged('test', true);
    bindingWhenOnSyntax.whenInjectedInto('army');
    bindingWhenOnSyntax.whenInjectedInto(Army);
    bindingWhenOnSyntax.whenParentNamed('test');
    bindingWhenOnSyntax.whenParentTagged('test', true);
    bindingWhenOnSyntax.whenAnyAncestorIs(Army);
    bindingWhenOnSyntax.whenNoAncestorIs(ZombieArmy);
    bindingWhenOnSyntax.whenAnyAncestorNamed('test');
    bindingWhenOnSyntax.whenAnyAncestorTagged('test', true);
    bindingWhenOnSyntax.whenNoAncestorNamed('test');
    bindingWhenOnSyntax.whenNoAncestorTagged('test', true);
    bindingWhenOnSyntax.whenAnyAncestorMatches((request: interfaces.Request) => true);
    bindingWhenOnSyntax.whenNoAncestorMatches((request: interfaces.Request) => true);

    // assert invoked BindingWhenSyntax methods
    expect(whenStub.callCount).eql(1);
    expect(whenTargetNamedStub.callCount).eql(1);
    expect(whenTargetTaggedStub.callCount).eql(1);
    expect(whenInjectedIntoStub.callCount).eql(2);
    expect(whenParentNamedStub.callCount).eql(1);
    expect(whenParentTaggedStub.callCount).eql(1);
    expect(whenAnyAncestorIsStub.callCount).eql(1);
    expect(whenNoAncestorIsStub.callCount).eql(1);
    expect(whenAnyAncestorNamedStub.callCount).eql(1);
    expect(whenAnyAncestorTaggedStub.callCount).eql(1);
    expect(whenNoAncestorNamedStub.callCount).eql(1);
    expect(whenNoAncestorTaggedStub.callCount).eql(1);
    expect(whenAnyAncestorMatchesStub.callCount).eql(1);
    expect(whenNoAncestorMatchesStub.callCount).eql(1);

  });

  it('Should provide access to BindingOnSyntax methods', () => {

    interface Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingWhenOnSyntax = new BindingWhenOnSyntax<Ninja>(binding);

    // cast to any to be able to access private props
    const _bindingWhenOnSyntax: any = bindingWhenOnSyntax;

    // stubs for BindingWhenSyntax methods
    const onActivationStub = sinon.stub(_bindingWhenOnSyntax._bindingOnSyntax, 'onActivation').returns(null);

    // invoke BindingWhenOnSyntax methods
    bindingWhenOnSyntax.onActivation((context: interfaces.Context, ninja: Ninja) =>
      // DO NOTHING
      ninja);

    // assert invoked BindingWhenSyntax methods
    expect(onActivationStub.callCount).eql(1);

  });

});