import { describe, it } from 'mocha';
import sinon from 'sinon';

import { Container, injectable, preDestroy } from '../..';

describe('Issue 1416', () => {
  it('should allow providing default values on optional bindings', async () => {
    @injectable()
    class Test1 {
      public stub: sinon.SinonStub<unknown[], void> = sinon.stub();

      @preDestroy()
      public destroy() {
        this.stub();
      }
    }

    @injectable()
    class Test2 {
      public destroy(): void {}
    }

    @injectable()
    class Test3 {
      public destroy(): void {}
    }

    const container: Container = new Container({ defaultScope: 'Singleton' });

    container.bind(Test1).toSelf();
    container.bind(Test2).toService(Test1);
    container.bind(Test3).toService(Test1);

    const test1: Test1 = container.get(Test1);
    container.get(Test2);
    container.get(Test3);

    await Promise.all([
      container.unbind(Test1),
      container.unbind(Test2),
      container.unbind(Test3),
    ]);

    sinon.assert.calledOnce(test1.stub);
  });
});
