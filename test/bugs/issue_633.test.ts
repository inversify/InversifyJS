import { expect } from 'chai';

import { Container, injectable, interfaces } from '../../src/inversify';

describe('Issue 633', () => {
  it('Should expose metadata through context', () => {
    @injectable()
    class Logger {
      public named: string;
      constructor(named: string) {
        this.named = named;
      }
    }

    const container: Container = new Container();

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPE = {
      Logger: Symbol.for('Logger'),
    };

    container
      .bind<Logger>(TYPE.Logger)
      .toDynamicValue((context: interfaces.Context) => {
        const namedMetadata: interfaces.Metadata<string> | null =
          context.currentRequest.target.getNamedTag();
        const named: string = namedMetadata ? namedMetadata.value : 'default';
        return new Logger(named);
      });

    const logger1: Logger = container.getNamed<Logger>(TYPE.Logger, 'Name1');
    const logger2: Logger = container.getNamed<Logger>(TYPE.Logger, 'Name2');

    expect(logger1.named).to.eq('Name1');
    expect(logger2.named).to.eq('Name2');
  });
});
