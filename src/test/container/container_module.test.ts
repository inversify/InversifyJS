import { expect } from 'chai';
import * as sinon from 'sinon';

import { NOT_REGISTERED } from '../../constants/error_msgs';
import { Container } from '../../container/container';
import {
  AsyncContainerModule,
  ContainerModule,
} from '../../container/container_module';
import type { interfaces } from '../../interfaces/interfaces';

describe('ContainerModule', () => {
  it('Should be able to set the registry of a container module', () => {
    const registry: (bind: interfaces.Bind) => void = (
      _bind: interfaces.Bind,
    ) => {};

    const warriors: ContainerModule = new ContainerModule(registry);

    expect(warriors.id).to.be.a('number');
    expect(warriors.registry).eql(registry);
  });

  it('Should be able to remove some bindings from within a container module', () => {
    const container: Container = new Container();
    container.bind<string>('A').toConstantValue('1');
    expect(container.get<string>('A')).to.eql('1');

    const warriors: ContainerModule = new ContainerModule(
      (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
        expect(container.get<string>('A')).to.eql('1');
        unbind('A');
        expect(() => {
          container.get<string>('A');
        }).to.throw();
        bind<string>('A').toConstantValue('2');
        expect(container.get<string>('A')).to.eql('2');
        bind<string>('B').toConstantValue('3');
        expect(container.get<string>('B')).to.eql('3');
      },
    );

    container.load(warriors);
    expect(container.get<string>('A')).to.eql('2');
    expect(container.get<string>('B')).to.eql('3');
  });

  it('Should be able to check for existence of bindings within a container module', () => {
    const container: Container = new Container();
    container.bind<string>('A').toConstantValue('1');
    expect(container.get<string>('A')).to.eql('1');

    const warriors: ContainerModule = new ContainerModule(
      (
        _bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
      ) => {
        expect(container.get<string>('A')).to.eql('1');
        expect(isBound('A')).to.eql(true);
        unbind('A');
        expect(isBound('A')).to.eql(false);
      },
    );

    container.load(warriors);
  });

  it('Should be able to override a binding using rebind within a container module', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      someType: 'someType',
    };

    const container: Container = new Container();

    const module1: ContainerModule = new ContainerModule(
      (bind: interfaces.Bind) => {
        bind<number>(TYPES.someType).toConstantValue(1);

        bind<number>(TYPES.someType).toConstantValue(2);
      },
    );

    const module2: ContainerModule = new ContainerModule(
      (
        _bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        rebind: interfaces.Rebind,
      ) => {
        rebind<number>(TYPES.someType).toConstantValue(3);
      },
    );

    container.load(module1);
    const values1: unknown[] = container.getAll(TYPES.someType);
    expect(values1[0]).to.eq(1);

    expect(values1[1]).to.eq(2);

    container.load(module2);
    const values2: unknown[] = container.getAll(TYPES.someType);

    expect(values2[0]).to.eq(3);
    expect(values2[1]).to.eq(undefined);
  });

  it('Should be able use await async functions in container modules', async () => {
    const container: Container = new Container();
    const someAsyncFactory: () => Promise<number> = async () =>
      new Promise<number>(
        (res: (value: number | PromiseLike<number>) => void) =>
          setTimeout(() => {
            res(1);
          }, 100),
      );
    const A: unique symbol = Symbol.for('A');
    const B: unique symbol = Symbol.for('B');

    const moduleOne: AsyncContainerModule = new AsyncContainerModule(
      async (bind: interfaces.Bind) => {
        const val: number = await someAsyncFactory();
        bind(A).toConstantValue(val);
      },
    );

    const moduleTwo: AsyncContainerModule = new AsyncContainerModule(
      async (bind: interfaces.Bind) => {
        bind(B).toConstantValue(2);
      },
    );

    await container.loadAsync(moduleOne, moduleTwo);

    const aIsBound: boolean = container.isBound(A);
    expect(aIsBound).to.eq(true);
    const a: unknown = container.get(A);
    expect(a).to.eq(1);
  });

  it('Should be able to add an activation hook through a container module', () => {
    const container: Container = new Container();
    container.bind<string>('A').toDynamicValue(() => '1');
    expect(container.get<string>('A')).to.eql('1');

    const module: ContainerModule = new ContainerModule(
      (
        bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        _rebind: interfaces.Rebind,
        _unbindAsync: interfaces.UnbindAsync,
        onActivation: interfaces.Container['onActivation'],
      ) => {
        bind<string>('B')
          .toConstantValue('2')
          .onActivation(() => 'C');
        onActivation('A', () => 'B');
      },
    );

    container.load(module);

    expect(container.get<string>('A')).to.eql('B');
    expect(container.get('B')).to.eql('C');
  });

  it('Should be able to add a deactivation hook through a container module', () => {
    const container: Container = new Container();
    container.bind<string>('A').toConstantValue('1');

    let deact: boolean = false;
    const warriors: ContainerModule = new ContainerModule(
      (
        _bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        _rebind: interfaces.Rebind,
        _unbindAsync: interfaces.UnbindAsync,
        _onActivation: interfaces.Container['onActivation'],
        onDeactivation: interfaces.Container['onDeactivation'],
      ) => {
        onDeactivation('A', () => {
          deact = true;
        });
      },
    );

    container.load(warriors);
    container.get('A');
    container.unbind('A');

    expect(deact).eql(true);
  });

  it('Should be able to add an async deactivation hook through a container module (async)', async () => {
    const container: Container = new Container();
    container.bind<string>('A').toConstantValue('1');

    let deact: boolean = false;

    const warriors: ContainerModule = new ContainerModule(
      (
        _bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        _rebind: interfaces.Rebind,
        _unbindAsync: interfaces.UnbindAsync,
        _onActivation: interfaces.Container['onActivation'],
        onDeactivation: interfaces.Container['onDeactivation'],
      ) => {
        onDeactivation('A', async () => {
          deact = true;
        });
      },
    );

    container.load(warriors);
    container.get('A');
    await container.unbindAsync('A');

    expect(deact).eql(true);
  });

  it('Should be able to add multiple async deactivation hook through a container module (async)', async () => {
    const onActivationHandlerSpy: sinon.SinonSpy<[], Promise<void>> = sinon.spy<
      () => Promise<void>
    >(async () => undefined);

    const serviceIdentifier: string = 'destroyable';
    const container: Container = new Container();

    const containerModule: ContainerModule = new ContainerModule(
      (
        _bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        _rebind: interfaces.Rebind,
        _unbindAsync: interfaces.UnbindAsync,
        _onActivation: interfaces.Container['onActivation'],
        onDeactivation: interfaces.Container['onDeactivation'],
      ) => {
        onDeactivation(serviceIdentifier, onActivationHandlerSpy);
        onDeactivation(serviceIdentifier, onActivationHandlerSpy);
      },
    );

    container.bind(serviceIdentifier).toConstantValue(serviceIdentifier);

    container.get(serviceIdentifier);

    container.load(containerModule);

    await container.unbindAllAsync();

    expect(onActivationHandlerSpy.callCount).to.eq(2);
  });

  it('Should remove module bindings when unload', () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    container.bind<string>(sid).toConstantValue('Not module');
    const module: ContainerModule = new ContainerModule(
      (bind: interfaces.Bind) => {
        bind<string>(sid).toConstantValue('Module');
      },
    );
    container.load(module);
    let values: unknown[] = container.getAll(sid);
    expect(values).to.deep.equal(['Not module', 'Module']);

    container.unload(module);
    values = container.getAll(sid);
    expect(values).to.deep.equal(['Not module']);
  });

  it('Should deactivate singletons from module bindings when unload', () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    let moduleBindingDeactivated: string | undefined;
    let containerDeactivated: string | undefined;
    const module: ContainerModule = new ContainerModule(
      (
        bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        _rebind: interfaces.Rebind,
        _unbindAsync: interfaces.UnbindAsync,
        _onActivation: interfaces.Container['onActivation'],
        onDeactivation: interfaces.Container['onDeactivation'],
      ) => {
        bind<string>(sid)
          .toConstantValue('Module')
          .onDeactivation((injectable: string) => {
            moduleBindingDeactivated = injectable;
          });
        onDeactivation<string>(sid, (injectable: string) => {
          containerDeactivated = injectable;
        });
      },
    );
    container.load(module);
    container.get(sid);

    container.unload(module);
    expect(moduleBindingDeactivated).to.equal('Module');
    expect(containerDeactivated).to.equal('Module');
  });

  it('Should remove container handlers from module when unload', () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    let activatedNotModule: string | undefined;
    let deactivatedNotModule: string | undefined;
    container.onActivation<string>(
      sid,
      (_: interfaces.Context, injected: string) => {
        activatedNotModule = injected;
        return injected;
      },
    );
    container.onDeactivation<string>(sid, (injected: string) => {
      deactivatedNotModule = injected;
    });
    container.bind<string>(sid).toConstantValue('Value');
    let activationCount: number = 0;
    let deactivationCount: number = 0;
    const module: ContainerModule = new ContainerModule(
      (
        _bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        _rebind: interfaces.Rebind,
        _unbindAsync: interfaces.UnbindAsync,
        onActivation: interfaces.Container['onActivation'],
        onDeactivation: interfaces.Container['onDeactivation'],
      ) => {
        onDeactivation<string>(sid, (_: string) => {
          deactivationCount++;
        });
        onActivation<string>(sid, (_: interfaces.Context, injected: string) => {
          activationCount++;
          return injected;
        });
      },
    );
    container.load(module);
    container.unload(module);

    container.get(sid);
    container.unbind(sid);

    expect(activationCount).to.equal(0);
    expect(deactivationCount).to.equal(0);

    expect(activatedNotModule).to.equal('Value');
    expect(deactivatedNotModule).to.equal('Value');
  });

  it('Should remove module bindings when unloadAsync', async () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    container.onDeactivation(sid, async (_injected: unknown) =>
      Promise.resolve(),
    );
    container.bind<string>(sid).toConstantValue('Not module');
    const module: ContainerModule = new ContainerModule(
      (bind: interfaces.Bind) => {
        bind<string>(sid).toConstantValue('Module');
      },
    );
    container.load(module);
    let values: unknown[] = container.getAll(sid);
    expect(values).to.deep.equal(['Not module', 'Module']);

    await container.unloadAsync(module);
    values = container.getAll(sid);
    expect(values).to.deep.equal(['Not module']);
  });

  it('Should deactivate singletons from module bindings when unloadAsync', async () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    let moduleBindingDeactivated: string | undefined;
    let containerDeactivated: string | undefined;
    const module: ContainerModule = new ContainerModule(
      (
        bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        _rebind: interfaces.Rebind,
        _unbindAsync: interfaces.UnbindAsync,
        _onActivation: interfaces.Container['onActivation'],
        onDeactivation: interfaces.Container['onDeactivation'],
      ) => {
        bind<string>(sid)
          .toConstantValue('Module')
          .onDeactivation((injectable: string) => {
            moduleBindingDeactivated = injectable;
          });
        onDeactivation<string>(sid, async (injectable: string) => {
          containerDeactivated = injectable;
          return Promise.resolve();
        });
      },
    );
    container.load(module);
    container.get(sid);

    await container.unloadAsync(module);
    expect(moduleBindingDeactivated).to.equal('Module');
    expect(containerDeactivated).to.equal('Module');
  });

  it('Should remove container handlers from module when unloadAsync', async () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    let activatedNotModule: string | undefined;
    let deactivatedNotModule: string | undefined;
    container.onActivation<string>(
      sid,
      (_: interfaces.Context, injected: string) => {
        activatedNotModule = injected;
        return injected;
      },
    );
    container.onDeactivation<string>(sid, (injected: string) => {
      deactivatedNotModule = injected;
    });
    container.bind<string>(sid).toConstantValue('Value');
    let activationCount: number = 0;
    let deactivationCount: number = 0;
    const module: ContainerModule = new ContainerModule(
      (
        _bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        _rebind: interfaces.Rebind,
        _unbindAsync: interfaces.UnbindAsync,
        onActivation: interfaces.Container['onActivation'],
        onDeactivation: interfaces.Container['onDeactivation'],
      ) => {
        onDeactivation<string>(sid, async (_: string) => {
          deactivationCount++;
          return Promise.resolve();
        });
        onActivation<string>(sid, (_: interfaces.Context, injected: string) => {
          activationCount++;
          return injected;
        });
      },
    );
    container.load(module);
    await container.unloadAsync(module);

    container.get(sid);
    container.unbind(sid);

    expect(activationCount).to.equal(0);
    expect(deactivationCount).to.equal(0);

    expect(activatedNotModule).to.equal('Value');
    expect(deactivatedNotModule).to.equal('Value');
  });

  it('should be able to unbindAsync from a module', async () => {
    let unbindAsyncFn: interfaces.UnbindAsync | undefined;
    const container: Container = new Container();
    const module: ContainerModule = new ContainerModule(
      (
        _bind: interfaces.Bind,
        _unbind: interfaces.Unbind,
        _isBound: interfaces.IsBound,
        _rebind: interfaces.Rebind,
        unbindAsync: interfaces.UnbindAsync,
      ) => {
        unbindAsyncFn = unbindAsync;
      },
    );
    const sid: string = 'sid';
    container.bind<string>(sid).toConstantValue('Value');
    container.bind<string>(sid).toConstantValue('Value2');
    const deactivated: string[] = [];
    container.onDeactivation<string>(sid, async (injected: string) => {
      deactivated.push(injected);
      return Promise.resolve();
    });

    container.getAll(sid);
    container.load(module);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await unbindAsyncFn!(sid);
    expect(deactivated).to.deep.equal(['Value', 'Value2']);
    //bindings removed
    expect(() => container.getAll(sid)).to.throw(`${NOT_REGISTERED} sid`);
  });
});
