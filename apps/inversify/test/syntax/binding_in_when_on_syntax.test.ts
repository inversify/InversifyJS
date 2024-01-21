import { expect } from 'chai';
import * as sinon from 'sinon';
import { injectable } from '../../src/annotation/injectable';
import { Binding } from '../../src/bindings/binding';
import { BindingScopeEnum } from '../../src/constants/literal_types';
import { interfaces } from '../../src/interfaces/interfaces';
import { BindingInWhenOnSyntax } from '../../src/syntax/binding_in_when_on_syntax';

describe('BindingInWhenOnSyntax', () => {

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
    const bindingInWhenOnSyntax = new BindingInWhenOnSyntax<Ninja>(binding);
    const _bindingInWhenOnSyntax = bindingInWhenOnSyntax as unknown as { _binding: Binding<unknown> };

    expect(_bindingInWhenOnSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

  });

  it('Should provide access to BindingInSyntax methods', () => {

    interface Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingInWhenOnSyntax = new BindingInWhenOnSyntax<Ninja>(binding);
    const _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

    // stubs for BindingWhenSyntax methods
    const inSingletonScopeStub = sinon.stub(_bindingInWhenOnSyntax._bindingInSyntax, 'inSingletonScope').returns(null);
    const inTransientScopeStub = sinon.stub(_bindingInWhenOnSyntax._bindingInSyntax, 'inTransientScope').returns(null);

    // invoke BindingWhenOnSyntax methods
    bindingInWhenOnSyntax.inSingletonScope();
    bindingInWhenOnSyntax.inTransientScope();

    // assert invoked BindingWhenSyntax methods
    expect(inSingletonScopeStub.callCount).eql(1);
    expect(inTransientScopeStub.callCount).eql(1);

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
    const bindingInWhenOnSyntax = new BindingInWhenOnSyntax<Ninja>(binding);

    // cast to any to be able to access private props
    const _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

    // stubs for BindingWhenSyntax methods
    const whenStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'when').returns(null);
    const whenTargetNamedStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenTargetNamed').returns(null);
    const whenTargetTaggedStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenTargetTagged').returns(null);
    const whenInjectedIntoStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenInjectedInto').returns(null);
    const whenParentNamedStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenParentNamed').returns(null);
    const whenParentTaggedStub = sinon.stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenParentTagged').returns(null);

    const whenAnyAncestorIsStub = sinon.stub(
      _bindingInWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorIs').returns(null);

    const whenNoAncestorIsStub = sinon.stub(
      _bindingInWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorIs').returns(null);

    const whenNoAncestorNamedStub = sinon.stub(
      _bindingInWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorNamed').returns(null);

    const whenAnyAncestorNamedStub = sinon.stub(
      _bindingInWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorNamed').returns(null);

    const whenNoAncestorTaggedStub = sinon.stub(
      _bindingInWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorTagged').returns(null);

    const whenAnyAncestorTaggedStub = sinon.stub(
      _bindingInWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorTagged').returns(null);

    const whenAnyAncestorMatchesStub = sinon.stub(
      _bindingInWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorMatches').returns(null);

    const whenNoAncestorMatchesStub = sinon.stub(
      _bindingInWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorMatches').returns(null);

    // invoke BindingWhenOnSyntax methods
    bindingInWhenOnSyntax.when((request: interfaces.Request) => true);
    bindingInWhenOnSyntax.whenTargetNamed('test');
    bindingInWhenOnSyntax.whenTargetTagged('test', true);
    bindingInWhenOnSyntax.whenInjectedInto('army');
    bindingInWhenOnSyntax.whenInjectedInto(Army);
    bindingInWhenOnSyntax.whenParentNamed('test');
    bindingInWhenOnSyntax.whenParentTagged('test', true);
    bindingInWhenOnSyntax.whenAnyAncestorIs(Army);
    bindingInWhenOnSyntax.whenNoAncestorIs(ZombieArmy);
    bindingInWhenOnSyntax.whenAnyAncestorNamed('test');
    bindingInWhenOnSyntax.whenAnyAncestorTagged('test', true);
    bindingInWhenOnSyntax.whenNoAncestorNamed('test');
    bindingInWhenOnSyntax.whenNoAncestorTagged('test', true);
    bindingInWhenOnSyntax.whenAnyAncestorMatches((request: interfaces.Request) => true);
    bindingInWhenOnSyntax.whenNoAncestorMatches((request: interfaces.Request) => true);

    // assert invoked BindingWhenSyntax methods
    expect(whenStub.callCount).eql(1);
    expect(whenTargetNamedStub.callCount).eql(1);
    expect(whenTargetTaggedStub.callCount).eql(1);
    expect(whenInjectedIntoStub.callCount).eql(2);
    expect(whenParentNamedStub.callCount).eql(1);
    expect(whenAnyAncestorIsStub.callCount).eql(1);
    expect(whenNoAncestorIsStub.callCount).eql(1);
    expect(whenParentTaggedStub.callCount).eql(1);
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
    const bindingInWhenOnSyntax = new BindingInWhenOnSyntax<Ninja>(binding);

    // cast to any to be able to access private props
    const _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

    // stubs for BindingWhenSyntax methods
    const onActivationStub = sinon.stub(_bindingInWhenOnSyntax._bindingOnSyntax, 'onActivation').returns(null);

    // invoke BindingWhenOnSyntax methods
    bindingInWhenOnSyntax.onActivation((context: interfaces.Context, ninja: Ninja) =>
      // DO NOTHING
      ninja);

    // assert invoked BindingWhenSyntax methods
    expect(onActivationStub.callCount).eql(1);

  });

});