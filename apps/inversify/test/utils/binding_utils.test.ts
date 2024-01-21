import { expect } from 'chai';
import { Binding } from '../../src/bindings/binding';
import { getFactoryDetails } from '../../src/utils/binding_utils';

describe('getFactoryDetails', () => {
  it('should thrown an exception non factory binding.type', () => {
    const binding = new Binding('', 'Singleton');
    binding.type = 'Instance';
    expect(() => getFactoryDetails(binding)).to.throw('Unexpected factory type Instance');
  });
})