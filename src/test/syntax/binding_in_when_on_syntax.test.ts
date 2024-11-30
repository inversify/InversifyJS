import { expect } from 'chai';
import * as sinon from 'sinon';

import { injectable } from '../../annotation/injectable';
import { Binding } from '../../bindings/binding';
import { BindingScopeEnum } from '../../constants/literal_types';
import type { interfaces } from '../../interfaces/interfaces';
import { BindingInWhenOnSyntax } from '../../syntax/binding_in_when_on_syntax';

describe('BindingInWhenOnSyntax', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should set its own properties correctly', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding<unknown>(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );
    const bindingInWhenOnSyntax: BindingInWhenOnSyntax<unknown> =
      new BindingInWhenOnSyntax<unknown>(binding);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _bindingInWhenOnSyntax: {
      _binding: Binding<unknown>;
    } = bindingInWhenOnSyntax as unknown as {
      _binding: Binding<unknown>;
    };

    expect(_bindingInWhenOnSyntax._binding.serviceIdentifier).eql(
      ninjaIdentifier,
    );
  });

  it('Should provide access to BindingInSyntax methods', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding<unknown>(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );

    const bindingInWhenOnSyntax: BindingInWhenOnSyntax<unknown> =
      new BindingInWhenOnSyntax<unknown>(binding);

    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
    const _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

    // stubs for BindingWhenSyntax methods
    const inSingletonScopeStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingInSyntax, 'inSingletonScope')
      .returns(null);
    const inTransientScopeStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingInSyntax, 'inTransientScope')
      .returns(null);

    // invoke BindingWhenOnSyntax methods
    bindingInWhenOnSyntax.inSingletonScope();
    bindingInWhenOnSyntax.inTransientScope();

    // assert invoked BindingWhenSyntax methods
    expect(inSingletonScopeStub.callCount).eql(1);
    expect(inTransientScopeStub.callCount).eql(1);
  });

  it('Should provide access to BindingWhenSyntax methods', () => {
    @injectable()
    class Army {}

    @injectable()
    class ZombieArmy {}

    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );
    const bindingInWhenOnSyntax: BindingInWhenOnSyntax<unknown> =
      new BindingInWhenOnSyntax(binding);

    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
    const _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

    // stubs for BindingWhenSyntax methods
    const whenStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'when')
      .returns(null);
    const whenTargetNamedStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenTargetNamed')
      .returns(null);
    const whenTargetTaggedStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenTargetTagged')
      .returns(null);
    const whenInjectedIntoStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenInjectedInto')
      .returns(null);
    const whenParentNamedStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenParentNamed')
      .returns(null);
    const whenParentTaggedStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenParentTagged')
      .returns(null);

    const whenAnyAncestorIsStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorIs')
      .returns(null);

    const whenNoAncestorIsStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorIs')
      .returns(null);

    const whenNoAncestorNamedStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorNamed')
      .returns(null);

    const whenAnyAncestorNamedStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorNamed')
      .returns(null);

    const whenNoAncestorTaggedStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorTagged')
      .returns(null);

    const whenAnyAncestorTaggedStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorTagged')
      .returns(null);

    const whenAnyAncestorMatchesStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenAnyAncestorMatches')
      .returns(null);

    const whenNoAncestorMatchesStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingWhenSyntax, 'whenNoAncestorMatches')
      .returns(null);

    // invoke BindingWhenOnSyntax methods
    bindingInWhenOnSyntax.when((_request: interfaces.Request) => true);
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
    bindingInWhenOnSyntax.whenAnyAncestorMatches(
      (_request: interfaces.Request) => true,
    );
    bindingInWhenOnSyntax.whenNoAncestorMatches(
      (_request: interfaces.Request) => true,
    );

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
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );
    const bindingInWhenOnSyntax: BindingInWhenOnSyntax<unknown> =
      new BindingInWhenOnSyntax(binding);

    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
    const _bindingInWhenOnSyntax: any = bindingInWhenOnSyntax;

    // stubs for BindingWhenSyntax methods
    const onActivationStub: sinon.SinonStub = sinon
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .stub(_bindingInWhenOnSyntax._bindingOnSyntax, 'onActivation')
      .returns(null);

    // invoke BindingWhenOnSyntax methods
    bindingInWhenOnSyntax.onActivation(
      (_context: interfaces.Context, ninja: unknown) => ninja,
    );

    // assert invoked BindingWhenSyntax methods
    expect(onActivationStub.callCount).eql(1);
  });
});
