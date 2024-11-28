import * as ERROR_MSGS from '../../src/constants/error_msgs';
import { Container, inject, injectable, interfaces } from '../../src/index';

describe('Issue 549', () => {
  it('Should throw if circular dependencies found with dynamics', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPE = {
      ADynamicValue: Symbol.for('ADynamicValue'),
      BDynamicValue: Symbol.for('BDynamicValue'),
    };

    type InterfaceA = unknown;
    type InterfaceB = unknown;

    @injectable()
    class A {
      public b: InterfaceB;
      constructor(@inject(TYPE.BDynamicValue) b: InterfaceB) {
        this.b = b;
      }
    }

    @injectable()
    class B {
      public a: InterfaceA;
      constructor(@inject(TYPE.ADynamicValue) a: InterfaceA) {
        this.a = a;
      }
    }

    const container: Container = new Container({ defaultScope: 'Singleton' });
    container.bind(A).toSelf();
    container.bind(B).toSelf();

    container
      .bind(TYPE.ADynamicValue)
      .toDynamicValue((ctx: interfaces.Context) => ctx.container.get(A));

    container
      .bind(TYPE.BDynamicValue)
      .toDynamicValue((ctx: interfaces.Context) => ctx.container.get(B));

    function willThrow() {
      return container.get<A>(A);
    }

    try {
      const result: A = willThrow();
      throw new Error(
        `This line should never be executed. Expected \`willThrow\` to throw! ${JSON.stringify(result)}`,
      );
    } catch (e) {
      const localError: Error = e as Error;
      const expectedErrorA: string = ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY(
        'toDynamicValue',
        TYPE.ADynamicValue.toString(),
      );
      const expectedErrorB: string = ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY(
        'toDynamicValue',
        TYPE.BDynamicValue.toString(),
      );
      const matchesErrorA: boolean =
        localError.message.indexOf(expectedErrorA) !== -1;
      const matchesErrorB: boolean =
        localError.message.indexOf(expectedErrorB) !== -1;

      if (!matchesErrorA && !matchesErrorB) {
        throw new Error(
          'Expected `willThrow` to throw:\n' +
            `- ${expectedErrorA}\n` +
            'or\n' +
            `- ${expectedErrorB}\n` +
            'but got\n' +
            `- ${localError.message}`,
        );
      }
    }
  });
});
