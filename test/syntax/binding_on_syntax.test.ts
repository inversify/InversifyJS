import { expect } from 'chai';

import { Binding } from '../../src/bindings/binding';
import { BindingScopeEnum } from '../../src/constants/literal_types';
import type { interfaces } from '../../src/interfaces/interfaces';
import { BindingOnSyntax } from '../../src/syntax/binding_on_syntax';

describe('BindingOnSyntax', () => {
  it('Should set its own properties correctly', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );
    const bindingOnSyntax: BindingOnSyntax<unknown> = new BindingOnSyntax(
      binding,
    );
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _bindingOnSyntax: {
      _binding: Binding<unknown>;
    } = bindingOnSyntax as unknown as {
      _binding: Binding<unknown>;
    };

    expect(_bindingOnSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);
  });

  it('Should be able to configure the activation handler of a binding', () => {
    const ninjaIdentifier: string = 'Ninja';

    const binding: Binding<unknown> = new Binding(
      ninjaIdentifier,
      BindingScopeEnum.Transient,
    );

    const bindingOnSyntax: BindingOnSyntax<unknown> = new BindingOnSyntax(
      binding,
    );

    bindingOnSyntax.onActivation(
      (_context: interfaces.Context, ninja: unknown) => ninja,
    );

    expect(binding.onActivation).not.to.eql(null);
  });
});
