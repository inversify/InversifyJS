import { expect } from 'chai';
import * as sinon from 'sinon';
import { Container, injectable, interfaces } from '../../src/inversify';

describe('Issue 1297', () => {
  it('should call onActivation once if the service is a constant value binding', () => {
    const container = new Container();

    const onActivationHandlerSpy = sinon.spy<
      (ctx: interfaces.Context, message: string) => string
    >((_ctx: interfaces.Context, message: string) => message);

    container.bind<string>('message')
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

    const container = new Container();

    const onActivationHandlerSpy = sinon.spy<
      (ctx: interfaces.Context, instance: interfaces.Factory<Katana>) => interfaces.Factory<Katana>
    >((_ctx: interfaces.Context, instance: interfaces.Factory<Katana>) => instance);

    container.bind<Katana>('Katana').to(Katana);

    container.bind<interfaces.Factory<Katana>>('Factory<Katana>').toFactory<Katana>((context) =>
      () =>
        context.container.get<Katana>('Katana')).onActivation(onActivationHandlerSpy);

    container.get('Factory<Katana>');
    container.get('Factory<Katana>');

    expect(onActivationHandlerSpy.callCount).to.eq(1);
  });

  it('should call onActivation once if the service is an auto factory binding', () => {

    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    const container = new Container();

    const onActivationHandlerSpy = sinon.spy<
      (ctx: interfaces.Context, instance: interfaces.Factory<Katana>) => interfaces.Factory<Katana>
    >((_ctx: interfaces.Context, instance: interfaces.Factory<Katana>) => instance);

    container.bind<Katana>('Katana').to(Katana);

    container.bind<interfaces.Factory<Katana>>('Factory<Katana>')
      .toAutoFactory<Katana>('Katana').onActivation(onActivationHandlerSpy);

    container.get('Factory<Katana>');
    container.get('Factory<Katana>');

    expect(onActivationHandlerSpy.callCount).to.eq(1);
  });

  it('should call onActivation once if the service is a function binding', () => {

    const container = new Container();

    const onActivationHandlerSpy = sinon.spy<
      (ctx: interfaces.Context, messageGenerator: () => string) => () => string
    >((_ctx: interfaces.Context, messageGenerator: () => string) => messageGenerator);

    container.bind<() => string>('message')
      .toFunction(() => 'Hello world')
      .onActivation(onActivationHandlerSpy);

    container.get('message');
    container.get('message');

    expect(onActivationHandlerSpy.callCount).to.eq(1);
  });

  it('should call onActivation once if the service is a constructor binding', () => {

    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    const container = new Container();

    const onActivationHandlerSpy = sinon.spy<
      (ctx: interfaces.Context, injectableObj: unknown) => unknown
    >((_ctx: interfaces.Context, injectableObj: unknown) => injectableObj);

    container.bind('Katana')
      .toConstructor<Katana>(Katana)
      .onActivation(onActivationHandlerSpy);

    container.get('Katana');
    container.get('Katana');

    expect(onActivationHandlerSpy.callCount).to.eq(1);
  });

  it('should call onActivation once if the service is a provider binding', () => {

    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    const container = new Container();

    const onActivationHandlerSpy = sinon.spy<
      (ctx: interfaces.Context, injectableObj: unknown) => unknown
    >((_ctx: interfaces.Context, injectableObj: unknown) => injectableObj);

    container.bind('Provider<Katana>')
      .toProvider<Katana>((context: interfaces.Context) =>
        () =>
          Promise.resolve(new Katana())).onActivation(onActivationHandlerSpy);

    container.get('Provider<Katana>');
    container.get('Provider<Katana>');

    expect(onActivationHandlerSpy.callCount).to.eq(1);
  });
});