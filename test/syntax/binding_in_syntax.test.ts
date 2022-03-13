import { expect } from 'chai';
import { Binding } from '../../src/bindings/binding';
import { BindingScopeEnum } from '../../src/constants/literal_types';
import { BindingInSyntax } from '../../src/syntax/binding_in_syntax';

describe('BindingInSyntax', () => {

  it('Should set its own properties correctly', () => {

    interface Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingInSyntax = new BindingInSyntax<Ninja>(binding);
    const _bindingInSyntax = bindingInSyntax as unknown as { _binding: Binding<unknown> };

    expect(_bindingInSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

  });

  it('Should be able to configure the scope of a binding', () => {

    interface Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingInSyntax = new BindingInSyntax<Ninja>(binding);

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