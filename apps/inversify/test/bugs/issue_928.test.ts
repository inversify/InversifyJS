import { expect } from 'chai';
import { Container, inject, injectable, optional } from '../../src/inversify';


describe('Issue 928', () => {

  it('should inject the right instances', () => {

    let injectedA: unknown;
    let injectedB: unknown;
    let injectedC: unknown;

    // some dependencies
    @injectable() class DepA { a = 1 }
    @injectable() class DepB { b = 1 }
    @injectable() class DepC { c = 1 }

    @injectable() abstract class AbstractCls {
      constructor(@inject(DepA) a: DepA, @inject(DepB) @optional() b: DepB = { b: 0 }) {
        injectedA = a;
        injectedB = b;
      }
    }

    @injectable() class Cls extends AbstractCls {
      constructor(@inject(DepC) c: DepC, @inject(DepB) @optional() b: DepB = { b: 0 }, @inject(DepA) a: DepA) {
        super(a, b);

        injectedC = c;
      }
    }

    const container = new Container();
    [DepA, DepB, DepC, Cls].forEach(i => container.bind(i).toSelf().inSingletonScope());

    container.get(Cls);

    expect(injectedA).to.deep.eq(new DepA());
    expect(injectedB).to.deep.eq(new DepB());
    expect(injectedC).to.deep.eq(new DepC());
  });
});