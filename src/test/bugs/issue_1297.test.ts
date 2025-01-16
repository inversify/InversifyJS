import { expect } from 'chai';
import * as sinon from 'sinon';

import {
  Container,
  Factory,
  injectable,
  Provider,
  ResolutionContext,
} from '../..';

describe('Issue 1297', () => {
  it('should call onActivation once if the service is a constant value binding', () => {
    const container: Container = new Container();

    const onActivationHandlerSpy: sinon.SinonSpy<
      [ResolutionContext, string],
      string
    > = sinon.spy<(_: ResolutionContext, message: string) => string>(
      (_: ResolutionContext, message: string) => message,
    );

    container
      .bind<string>('message')
      .toConstantValue('Hello world')
      .onActivation(onActivationHandlerSpy);

    container.get('message');
    container.get('message');

    expect(onActivationHandlerSpy.callCount).to.eq(1);
  });

  it('should call onActivation once if the service is a factory binding', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    const container: Container = new Container();

    const onActivationHandlerSpy: sinon.SinonSpy<
      [ResolutionContext, Factory<Katana>],
      Factory<Katana>
    > = sinon.spy<
      (_: ResolutionContext, instance: Factory<Katana>) => Factory<Katana>
    >((_: ResolutionContext, instance: Factory<Katana>) => instance);

    container.bind<Katana>('Katana').to(Katana);

    container
      .bind<Factory<Katana>>('Factory<Katana>')
      .toFactory(
        (context: ResolutionContext) => () => context.get<Katana>('Katana'),
      )
      .onActivation(onActivationHandlerSpy);

    container.get('Factory<Katana>');
    container.get('Factory<Katana>');

    expect(onActivationHandlerSpy.callCount).to.eq(1);
  });

  it('should call onActivation once if the service is a provider binding', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    const container: Container = new Container();

    const onActivationHandlerSpy: sinon.SinonSpy<
      [ResolutionContext, Provider<Katana>],
      Provider<Katana>
    > = sinon.spy<
      (
        _: ResolutionContext,
        injectableObj: Provider<Katana>,
      ) => Provider<Katana>
    >((_: ResolutionContext, injectableObj: Provider<Katana>) => injectableObj);

    container
      .bind<Provider<Katana>>('Provider<Katana>')
      .toProvider(
        (_context: ResolutionContext) => async () =>
          Promise.resolve(new Katana()),
      )
      .onActivation(onActivationHandlerSpy);

    container.get('Provider<Katana>');
    container.get('Provider<Katana>');

    expect(onActivationHandlerSpy.callCount).to.eq(1);
  });
});
