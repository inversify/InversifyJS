import { expect } from 'chai';

import { typeConstraint } from '../../syntax/constraint_helpers';

describe('BindingInSyntax', () => {
  it('Should be return false when a request object is not provided', () => {
    const result: boolean = typeConstraint('TYPE')(null);
    expect(result).to.eql(false);
  });
});
