import { expect } from 'chai';

import { Container } from '../..';

describe('Issue 1518', () => {
  it('should not throw on deactivating undefined singleton values', async () => {
    const container: Container = new Container();
    const symbol: symbol = Symbol.for('foo');
    container.bind(symbol).toConstantValue(undefined);

    console.log(container.get(symbol));

    await container.unbind('foo');

    expect(() => {}).not.to.throw();
  });
});
