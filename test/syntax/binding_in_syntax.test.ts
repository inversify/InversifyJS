import { expect } from 'chai';

import { Binding } from '../../src/bindings/binding';
import { BindingScopeEnum } from '../../src/constants/literal_types';
import { BindingInSyntax } from '../../src/syntax/binding_in_syntax';

describe('BindingInSyntax', () => {
  it('Should set its own properties correctly', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );

    const bindingInSyntax: BindingInSyntax<unknown> = new BindingInSyntax(
      binding,
    );

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _bindingInSyntax: {
      _binding: Binding<unknown>;
    } = bindingInSyntax as unknown as {
      _binding: Binding<unknown>;
    };

    expect(_bindingInSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);
  });

  it('Should be able to configure the scope of a binding', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding<unknown>(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );

    const bindingInSyntax: BindingInSyntax<unknown> =
      new BindingInSyntax<unknown>(binding);

    // default scope is transient
    expect(binding.scope).eql(BindingScopeEnum.Transient);

    // singleton scope
    bindingInSyntax.inSingletonScope();
    expect(binding.scope).eql(BindingScopeEnum.Singleton);

    // set transient scope explicitly
    bindingInSyntax.inTransientScope();
    expect(binding.scope).eql(BindingScopeEnum.Transient);
  });
});
