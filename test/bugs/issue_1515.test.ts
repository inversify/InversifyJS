import { expect } from 'chai';

import {
  Container,
  inject,
  injectable,
  multiInject,
} from '../../src/inversify';

describe('Issue 1515', () => {
  it('should not throw on false circular dependency', () => {
    @injectable()
    class Top {
      constructor(
        @multiInject('multi-inject') public readonly multis: unknown[],
        @inject('circle-1') public readonly circle1: Circle1,
      ) {}
    }

    @injectable()
    class Circle1 {
      constructor(@inject('circle-2') public readonly circle2: Circle2) {}
    }

    @injectable()
    class Circle2 {
      constructor(@inject('circle-1') public circle1: Circle1) {}
    }

    @injectable()
    class Multi1 {}
    @injectable()
    class Multi2 {}
    @injectable()
    class Multi3 {}

    const container: Container = new Container();

    container.bind('multi-inject').to(Multi1);
    container.bind('multi-inject').to(Multi2);
    container.bind('multi-inject').to(Multi3);
    container.bind('circle-1').to(Circle1);
    container.bind('circle-2').to(Circle2);
    container.bind(Top).toSelf();

    expect(() => {
      container.get(Top);
    }).to.throw(
      'Circular dependency found: Top --> circle-1 --> circle-2 --> circle-1',
    );
  });
});
