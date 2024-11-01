import { expect } from 'chai';

import { Binding } from '../../src/bindings/binding';
import { BindingScopeEnum } from '../../src/constants/literal_types';
import * as Stubs from '../utils/stubs';

describe('Binding', () => {
  it('Should set its own properties correctly', () => {
    const fooIdentifier: string = 'FooInterface';
    const fooBinding: Binding<Stubs.FooInterface> =
      new Binding<Stubs.FooInterface>(
        fooIdentifier,
        BindingScopeEnum.Transient,
      );

    expect(fooBinding.serviceIdentifier).eql(fooIdentifier);
    expect(fooBinding.implementationType).eql(null);
    expect(fooBinding.cache).eql(null);
    expect(fooBinding.scope).eql(BindingScopeEnum.Transient);
    expect(fooBinding.id).to.be.a('number');
  });
});
