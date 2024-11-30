import { expect } from 'chai';

import { Binding } from '../../bindings/binding';
import { getFactoryDetails } from '../../utils/binding_utils';

describe('getFactoryDetails', () => {
  it('should thrown an exception non factory binding.type', () => {
    const binding: Binding<unknown> = new Binding('', 'Singleton');
    binding.type = 'Instance';
    expect(() => getFactoryDetails(binding)).to.throw(
      'Unexpected factory type Instance',
    );
  });
});
