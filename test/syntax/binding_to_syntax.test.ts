import { expect } from 'chai';
import { injectable } from '../../src/annotation/injectable';
import { Binding } from '../../src/bindings/binding';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import { BindingScopeEnum, BindingTypeEnum } from '../../src/constants/literal_types';
import { interfaces } from '../../src/interfaces/interfaces';
import { BindingToSyntax } from '../../src/syntax/binding_to_syntax';
import sinon from 'sinon';

describe('BindingToSyntax', () => {

  it('Should set its own properties correctly', () => {

    interface Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingToSyntax = new BindingToSyntax<Ninja>(binding);
    const _bindingToSyntax = bindingToSyntax as unknown as { _binding: interfaces.Binding<Ninja> }

    expect(_bindingToSyntax._binding.serviceIdentifier).eql(ninjaIdentifier);

  });

  it('Should be able to configure the type of a binding', () => {

    interface Ninja { }

    @injectable()
    class Ninja implements Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    // let bindingWithClassAsId = new Binding<Ninja>(Ninja, BindingScopeEnum.Transient);
    const bindingToSyntax = new BindingToSyntax<Ninja>(binding);

    expect(binding.type).eql(BindingTypeEnum.Invalid);

    bindingToSyntax.to(Ninja);
    expect(binding.type).eql(BindingTypeEnum.Instance);
    expect(binding.implementationType).not.to.eql(null);

    (bindingToSyntax as any)._binding = binding;
    bindingToSyntax.toConstantValue(new Ninja());
    expect(binding.type).eql(BindingTypeEnum.ConstantValue);
    expect(binding.cache instanceof Ninja).eql(true);

    bindingToSyntax.toDynamicValue((context: interfaces.Context) => new Ninja());
    expect(binding.type).eql(BindingTypeEnum.DynamicValue);
    expect(typeof binding.dynamicValue).eql('function');

    const dynamicValueFactory: any = binding.dynamicValue;
    expect(dynamicValueFactory(null) instanceof Ninja).eql(true);

    bindingToSyntax.toConstructor<Ninja>(Ninja);
    expect(binding.type).eql(BindingTypeEnum.Constructor);
    expect(binding.implementationType).not.to.eql(null);

    bindingToSyntax.toFactory<Ninja>((context: interfaces.Context) =>
      () =>
        new Ninja());

    expect(binding.type).eql(BindingTypeEnum.Factory);
    expect(binding.factory).not.to.eql(null);

    const f = () => 'test';
    bindingToSyntax.toFunction(f);
    expect(binding.type).eql(BindingTypeEnum.Function);
    expect(binding.cache === f).eql(true);

    bindingToSyntax.toAutoFactory<Ninja>(ninjaIdentifier);

    expect(binding.type).eql(BindingTypeEnum.Factory);
    expect(binding.factory).not.to.eql(null);

    bindingToSyntax.toAutoNamedFactory<Ninja>(ninjaIdentifier);

    expect(binding.type).eql(BindingTypeEnum.Factory);
    expect(binding.factory).not.to.eql(null);

    const mockContext = {
      container: {
        getNamed: sinon.stub()
      }
    };

    if (binding.factory !== null) {
      binding.factory((mockContext as unknown as interfaces.Context))(ninjaIdentifier);
      sinon.assert.calledOnce(mockContext.container.getNamed);
    }

    bindingToSyntax.toProvider<Ninja>((context: interfaces.Context) =>
      () =>
        new Promise<Ninja>((resolve) => {
          resolve(new Ninja());
        }));

    expect(binding.type).eql(BindingTypeEnum.Provider);
    expect(binding.provider).not.to.eql(null);

  });

  it('Should prevent invalid function bindings', () => {

    interface Ninja { }

    @injectable()
    class Ninja implements Ninja { }
    const ninjaIdentifier = 'Ninja';

    const binding = new Binding<Ninja>(ninjaIdentifier, BindingScopeEnum.Transient);
    const bindingToSyntax = new BindingToSyntax<Ninja>(binding);

    const f = function () {
      bindingToSyntax.toFunction(5);
    };

    expect(f).to.throw(ERROR_MSGS.INVALID_FUNCTION_BINDING);

  });

});