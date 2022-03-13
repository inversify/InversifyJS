import { expect } from 'chai';
import { Binding } from '../../src/bindings/binding';
import { BindingScopeEnum } from '../../src/constants/literal_types';
import { interfaces } from '../../src/interfaces/interfaces';
import { BindingOnSyntax } from '../../src/syntax/binding_on_syntax';

describe('BindingOnSyntax', () => {

  it('Should set its own properties correctly', () => {

    interface Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingOnSyntax = new BindingOnSyntax<Ninja>(binding);
    const _bindingOnSyntax = bindingOnSyntax as unknown as { _binding: Binding<unknown> };

    expect(_bindingOnSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

  });

  it('Should be able to configure the activation handler of a binding', () => {

    interface Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingOnSyntax = new BindingOnSyntax<Ninja>(binding);

    bindingOnSyntax.onActivation((context: interfaces.Context, ninja: Ninja) => {
      const handler = {};
      return new Proxy<Ninja>(ninja, handler);
    });

    expect(binding.onActivation).not.to.eql(null);

  });

});