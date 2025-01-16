import { expect } from 'chai';

import { Container, inject, injectable } from '../..';

describe('Node', () => {
  it('Should throw if circular dependencies found', () => {
    @injectable()
    class A {
      public b: unknown;
      public c: unknown;
      constructor(@inject('B') b: unknown, @inject('C') c: unknown) {
        this.b = b;
        this.c = c;
      }
    }

    @injectable()
    class B {}

    @injectable()
    class C {
      public d: unknown;
      constructor(@inject('D') d: unknown) {
        this.d = d;
      }
    }

    @injectable()
    class D {
      public a: unknown;
      constructor(@inject('A') a: unknown) {
        this.a = a;
      }
    }

    const container: Container = new Container();
    container.bind<A>('A').to(A);
    container.bind<B>('B').to(B);
    container.bind<C>('C').to(C);
    container.bind<D>('D').to(D);

    function willThrow() {
      const a: A = container.get('A');
      return a;
    }

    expect(willThrow).to.throw('');
  });
});
