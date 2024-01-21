import { expect } from 'chai';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import { Container, inject, injectable } from '../../src/inversify';

describe('Node', () => {

  it('Should throw if circular dependencies found', () => {

    interface IA { }
    interface IB { }
    interface IC { }
    interface ID { }

    @injectable()
    class A implements IA {
      public b: IB;
      public c: IC;
      public constructor(
        @inject('B') b: IB,
        @inject('C') c: IC,
      ) {
        this.b = b;
        this.c = c;
      }
    }

    @injectable()
    class B implements IB { }

    @injectable()
    class C implements IC {
      public d: ID;
      public constructor(@inject('D') d: ID) {
        this.d = d;
      }
    }

    @injectable()
    class D implements ID {
      public a: IA;
      public constructor(@inject('A') a: IA) {
        this.a = a;
      }
    }

    const container = new Container();
    container.bind<A>('A').to(A);
    container.bind<B>('B').to(B);
    container.bind<C>('C').to(C);
    container.bind<D>('D').to(D);

    function willThrow() {
      const a = container.get<A>('A');
      return a;
    }

    expect(willThrow).to.throw(
      `${ERROR_MSGS.CIRCULAR_DEPENDENCY} A --> C --> D --> A`
    );

  });

});