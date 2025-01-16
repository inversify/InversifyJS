import { expect } from 'chai';

import { decorate, injectable } from '../..';

describe('@injectable', () => {
  it('Should throw when applied multiple times', () => {
    @injectable()
    class Test {}

    const useDecoratorMoreThanOnce: () => void = function () {
      decorate([injectable(), injectable()], Test);
    };

    expect(useDecoratorMoreThanOnce).to.throw(
      'Cannot apply @injectable decorator multiple times',
    );
  });
});
