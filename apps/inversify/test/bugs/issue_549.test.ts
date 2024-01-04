import * as ERROR_MSGS from '../../src/constants/error_msgs';
import { Container, inject, injectable } from '../../src/inversify';

describe('Issue 549', () => {

  it('Should throw if circular dependencies found with dynamics', () => {

    const TYPE = {
      ADynamicValue: Symbol.for('ADynamicValue'),
      BDynamicValue: Symbol.for('BDynamicValue')
    };

    interface IA { }
    interface IB { }

    @injectable()
    class A {
      public b: IB;
      public constructor(
        @inject(TYPE.BDynamicValue) b: IB
      ) {
        this.b = b;
      }
    }

    @injectable()
    class B {
      public a: IA;
      public constructor(
        @inject(TYPE.ADynamicValue) a: IA
      ) {
        this.a = a;
      }
    }

    const container = new Container({ defaultScope: 'Singleton' });
    container.bind(A).toSelf();
    container.bind(B).toSelf();

    container.bind(TYPE.ADynamicValue).toDynamicValue((ctx) =>
      ctx.container.get(A)
    );

    container.bind(TYPE.BDynamicValue).toDynamicValue((ctx) =>
      ctx.container.get(B)
    );

    function willThrow() {
      return container.get<A>(A);
    }

    try {
      const result = willThrow();
      throw new Error(
        `This line should never be executed. Expected \`willThrow\` to throw! ${JSON.stringify(result)}`
      );
    } catch (e) {
      const localError = e as Error;
      const expectedErrorA = ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY('toDynamicValue', TYPE.ADynamicValue.toString());
      const expectedErrorB = ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY('toDynamicValue', TYPE.BDynamicValue.toString());
      const matchesErrorA = localError.message.indexOf(expectedErrorA) !== -1;
      const matchesErrorB = localError.message.indexOf(expectedErrorB) !== -1;

      if (!matchesErrorA && !matchesErrorB) {
        throw new Error(
          'Expected \`willThrow\` to throw:\n' +
          `- ${expectedErrorA}\n` +
          'or\n' +
          `- ${expectedErrorB}\n` +
          'but got\n' +
          `- ${localError.message}`
        );
      }

    }

  });

});