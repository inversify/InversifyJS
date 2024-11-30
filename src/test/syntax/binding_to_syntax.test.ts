import { expect } from 'chai';
import sinon from 'sinon';
import Sinon from 'sinon';

import { injectable } from '../../annotation/injectable';
import { Binding } from '../../bindings/binding';
import * as ERROR_MSGS from '../../constants/error_msgs';
import {
  BindingScopeEnum,
  BindingTypeEnum,
} from '../../constants/literal_types';
import type { interfaces } from '../../interfaces/interfaces';
import { BindingToSyntax } from '../../syntax/binding_to_syntax';

describe('BindingToSyntax', () => {
  it('Should set its own properties correctly', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );

    const bindingToSyntax: BindingToSyntax<unknown> = new BindingToSyntax(
      binding,
    );
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _bindingToSyntax: {
      _binding: interfaces.Binding<unknown>;
    } = bindingToSyntax as unknown as {
      _binding: interfaces.Binding<unknown>;
    };

    expect(_bindingToSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);
  });

  it('Should be able to configure the type of a binding', () => {
    @injectable()
    class Ninja {}
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );

    const bindingToSyntax: BindingToSyntax<unknown> = new BindingToSyntax(
      binding,
    );

    expect(binding.type).eql(BindingTypeEnum.Invalid);

    bindingToSyntax.to(Ninja);
    expect(binding.type).eql(BindingTypeEnum.Instance);
    expect(binding.implementationType).not.to.eql(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (bindingToSyntax as any)._binding = binding;
    bindingToSyntax.toConstantValue(new Ninja());
    expect(binding.type).eql(BindingTypeEnum.ConstantValue);
    expect(binding.cache instanceof Ninja).eql(true);

    bindingToSyntax.toDynamicValue(
      (_context: interfaces.Context) => new Ninja(),
    );
    expect(binding.type).eql(BindingTypeEnum.DynamicValue);
    expect(typeof binding.dynamicValue).eql('function');

    const dynamicValueFactory: interfaces.DynamicValue<unknown> =
      binding.dynamicValue as interfaces.DynamicValue<unknown>;

    expect(
      dynamicValueFactory(null as unknown as interfaces.Context) instanceof
        Ninja,
    ).eql(true);

    bindingToSyntax.toConstructor<Ninja>(Ninja);
    expect(binding.type).eql(BindingTypeEnum.Constructor);
    expect(binding.implementationType).not.to.eql(null);

    bindingToSyntax.toFactory<Ninja>(
      (_context: interfaces.Context) => () => new Ninja(),
    );

    expect(binding.type).eql(BindingTypeEnum.Factory);
    expect(binding.factory).not.to.eql(null);

    const f: () => string = () => 'test';
    bindingToSyntax.toFunction(f);
    expect(binding.type).eql(BindingTypeEnum.Function);
    expect(binding.cache === f).eql(true);

    bindingToSyntax.toAutoFactory<Ninja>(ninjaIdentifier);

    expect(binding.type).eql(BindingTypeEnum.Factory);
    expect(binding.factory).not.to.eql(null);

    bindingToSyntax.toAutoNamedFactory<Ninja>(ninjaIdentifier);

    expect(binding.type).eql(BindingTypeEnum.Factory);
    expect(binding.factory).not.to.eql(null);

    const mockContext: interfaces.Context = {
      container: {
        getNamed: sinon.stub(),
      } as Partial<interfaces.Container> as interfaces.Container,
    } as Partial<interfaces.Context> as interfaces.Context;

    if (binding.factory !== null) {
      binding.factory(mockContext)(ninjaIdentifier);
      sinon.assert.calledOnce(mockContext.container.getNamed as Sinon.SinonSpy);
    }

    bindingToSyntax.toProvider<Ninja>(
      (_context: interfaces.Context) => async () =>
        new Promise<Ninja>((resolve: (value: Ninja) => void) => {
          resolve(new Ninja());
        }),
    );

    expect(binding.type).eql(BindingTypeEnum.Provider);
    expect(binding.provider).not.to.eql(null);
  });

  it('Should prevent invalid function bindings', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );
    const bindingToSyntax: BindingToSyntax<unknown> = new BindingToSyntax(
      binding,
    );

    const f: () => void = function () {
      bindingToSyntax.toFunction(5);
    };

    expect(f).to.throw(ERROR_MSGS.INVALID_FUNCTION_BINDING);
  });
});
