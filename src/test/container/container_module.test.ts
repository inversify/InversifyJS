import { expect } from 'chai';
import * as sinon from 'sinon';

import {
  Container,
  ContainerModule,
  ContainerModuleLoadOptions,
  ResolutionContext,
} from '../..';

describe('ContainerModule', () => {
  it('Should be able to set the registry of a container module', () => {
    const registry: (
      options: ContainerModuleLoadOptions,
    ) => Promise<void> = async (_options: ContainerModuleLoadOptions) =>
      undefined;

    const warriors: ContainerModule = new ContainerModule(registry);

    expect(warriors.id).to.be.a('number');
  });

  it('Should be able to remove some bindings from within a container module', async () => {
    const container: Container = new Container();

    container.bind<string>('A').toConstantValue('1');
    expect(container.get<string>('A')).to.eql('1');

    const warriors: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        await options.unbind('A');

        expect(() => {
          container.get<string>('A');
        }).to.throw();

        options.bind<string>('A').toConstantValue('2');
        expect(container.get<string>('A')).to.eql('2');

        options.bind<string>('B').toConstantValue('3');
        expect(container.get<string>('B')).to.eql('3');
      },
    );

    await container.load(warriors);

    expect(container.get<string>('A')).to.eql('2');
    expect(container.get<string>('B')).to.eql('3');
  });

  it('Should be able to check for existence of bindings within a container module', async () => {
    const container: Container = new Container();
    container.bind<string>('A').toConstantValue('1');
    expect(container.get<string>('A')).to.eql('1');

    const warriors: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        expect(options.isBound('A')).to.eql(true);
        await options.unbind('A');
        expect(options.isBound('A')).to.eql(false);
      },
    );

    await container.load(warriors);
  });

  it('Should be able to override a binding using rebind within a container module', async () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      someType: 'someType',
    };

    const container: Container = new Container();

    const module1: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        options.bind<number>(TYPES.someType).toConstantValue(1);
        options.bind<number>(TYPES.someType).toConstantValue(2);
      },
    );

    const module2: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        await options.unbind(TYPES.someType);
        options.bind<number>(TYPES.someType).toConstantValue(3);
      },
    );

    await container.load(module1);

    const values1: unknown[] = container.getAll(TYPES.someType);
    expect(values1[0]).to.eq(1);

    expect(values1[1]).to.eq(2);

    await container.load(module2);

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

    const moduleOne: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        const val: number = await someAsyncFactory();
        options.bind(A).toConstantValue(val);
      },
    );

    const moduleTwo: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        options.bind(B).toConstantValue(2);
      },
    );

    await container.load(moduleOne, moduleTwo);

    const aIsBound: boolean = container.isBound(A);
    expect(aIsBound).to.eq(true);
    const a: unknown = container.get(A);
    expect(a).to.eq(1);
  });

  it('Should be able to add an activation hook through a container module', async () => {
    const container: Container = new Container();

    const module: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        options
          .bind<string>('B')
          .toConstantValue('2')
          .onActivation(() => 'C');

        options.onActivation('A', () => 'B');

        container.bind<string>('A').toConstantValue('1');
      },
    );

    await container.load(module);

    expect(container.get<string>('A')).to.eql('B');
    expect(container.get('B')).to.eql('C');
  });

  it('Should be able to add a deactivation hook through a container module', async () => {
    const container: Container = new Container();
    container.bind<string>('A').toConstantValue('1');

    let deact: boolean = false;
    const warriors: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        options.onDeactivation('A', () => {
          deact = true;
        });
      },
    );

    await container.load(warriors);
    container.get('A');
    await container.unbind('A');

    expect(deact).eql(true);
  });

  it('Should be able to add an async deactivation hook through a container module (async)', async () => {
    const container: Container = new Container();
    container.bind<string>('A').toConstantValue('1');

    let deact: boolean = false;

    const warriors: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        options.onDeactivation('A', async () => {
          deact = true;
        });
      },
    );

    await container.load(warriors);

    container.get('A');

    await container.unbind('A');

    expect(deact).eql(true);
  });

  it('Should be able to add multiple async deactivation hook through a container module (async)', async () => {
    const onActivationHandlerSpy: sinon.SinonSpy<[], Promise<void>> = sinon.spy<
      () => Promise<void>
    >(async () => undefined);

    const serviceIdentifier: string = 'destroyable';
    const container: Container = new Container();

    const containerModule: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        options.onDeactivation(serviceIdentifier, onActivationHandlerSpy);
        options.onDeactivation(serviceIdentifier, onActivationHandlerSpy);
      },
    );

    container.bind(serviceIdentifier).toConstantValue(serviceIdentifier);

    container.get(serviceIdentifier);

    await container.load(containerModule);

    await container.unbind(serviceIdentifier);

    expect(onActivationHandlerSpy.callCount).to.eq(2);
  });

  it('Should remove module bindings when unload', async () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    container.bind<string>(sid).toConstantValue('Not module');
    const module: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        options.bind<string>(sid).toConstantValue('Module');
      },
    );

    await container.load(module);

    expect(container.getAll(sid)).to.deep.equal(['Not module', 'Module']);

    await container.unload(module);

    expect(container.getAll(sid)).to.deep.equal(['Not module']);
  });

  it('Should deactivate singletons from module bindings when unload', async () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    let moduleBindingDeactivated: string | undefined;
    let containerDeactivated: string | undefined;
    const module: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        options
          .bind<string>(sid)
          .toConstantValue('Module')
          .onDeactivation((injectable: string) => {
            moduleBindingDeactivated = injectable;
          });
        options.onDeactivation<string>(sid, (injectable: string) => {
          containerDeactivated = injectable;
        });
      },
    );

    await container.load(module);

    container.get(sid);

    await container.unload(module);

    expect(moduleBindingDeactivated).to.equal('Module');
    expect(containerDeactivated).to.equal('Module');
  });

  it('Should remove container handlers from module when unload', async () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    let activatedNotModule: string | undefined;
    let deactivatedNotModule: string | undefined;
    container.onActivation<string>(
      sid,
      (_: ResolutionContext, injected: string) => {
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
      async (options: ContainerModuleLoadOptions) => {
        options.onDeactivation<string>(sid, (_: string) => {
          deactivationCount++;
        });
        options.onActivation<string>(
          sid,
          (_: ResolutionContext, injected: string) => {
            activationCount++;
            return injected;
          },
        );
      },
    );

    await container.load(module);
    await container.unload(module);

    container.get(sid);
    await container.unbind(sid);

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
      async (options: ContainerModuleLoadOptions) => {
        options.bind<string>(sid).toConstantValue('Module');
      },
    );

    await container.load(module);
    let values: unknown[] = container.getAll(sid);
    expect(values).to.deep.equal(['Not module', 'Module']);

    await container.unload(module);
    values = container.getAll(sid);
    expect(values).to.deep.equal(['Not module']);
  });

  it('Should deactivate singletons from module bindings when unloadAsync', async () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    let moduleBindingDeactivated: string | undefined;
    let containerDeactivated: string | undefined;
    const module: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        options
          .bind<string>(sid)
          .toConstantValue('Module')
          .onDeactivation((injectable: string) => {
            moduleBindingDeactivated = injectable;
          });
        options.onDeactivation<string>(sid, async (injectable: string) => {
          containerDeactivated = injectable;
          return Promise.resolve();
        });
      },
    );

    await container.load(module);
    container.get(sid);

    await container.unload(module);
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
      (_: ResolutionContext, injected: string) => {
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
      async (options: ContainerModuleLoadOptions) => {
        options.onDeactivation<string>(sid, async (_: string) => {
          deactivationCount++;
          return Promise.resolve();
        });
        options.onActivation<string>(
          sid,
          (_: ResolutionContext, injected: string) => {
            activationCount++;
            return injected;
          },
        );
      },
    );

    await container.load(module);
    await container.unload(module);

    container.get(sid);
    await container.unbind(sid);

    expect(activationCount).to.equal(0);
    expect(deactivationCount).to.equal(0);

    expect(activatedNotModule).to.equal('Value');
    expect(deactivatedNotModule).to.equal('Value');
  });

  it('should be able to unbindAsync from a module', async () => {
    const sid: string = 'sid';

    const container: Container = new Container();
    const module: ContainerModule = new ContainerModule(
      async (options: ContainerModuleLoadOptions) => {
        await options.unbind(sid);
      },
    );

    container.bind<string>(sid).toConstantValue('Value');
    container.bind<string>(sid).toConstantValue('Value2');
    const deactivated: string[] = [];
    container.onDeactivation<string>(sid, async (injected: string) => {
      deactivated.push(injected);
      return Promise.resolve();
    });

    container.getAll(sid);
    await container.load(module);

    expect(deactivated).to.deep.equal(['Value', 'Value2']);
    //bindings removed
    expect(container.getAll(sid)).to.deep.equal([]);
  });
});
