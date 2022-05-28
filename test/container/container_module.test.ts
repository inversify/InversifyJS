import { expect } from 'chai';
import * as sinon from 'sinon';
import { NOT_REGISTERED } from '../../src/constants/error_msgs';
import { Container } from '../../src/container/container';
import { AsyncContainerModule, ContainerModule } from '../../src/container/container_module';
import { interfaces } from '../../src/interfaces/interfaces';

describe('ContainerModule', () => {

  it('Should be able to set the registry of a container module', () => {
    const registry = (bind: interfaces.Bind) => { /* do nothing */ };
    const warriors = new ContainerModule(registry);
    expect(warriors.id).to.be.a('number');
    expect(warriors.registry).eql(registry);
  });

  it('Should be able to remove some bindings from within a container module', () => {

    const container = new Container();
    container.bind<string>('A').toConstantValue('1');
    expect(container.get<string>('A')).to.eql('1');

    const warriors = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
      expect(container.get<string>('A')).to.eql('1');
      unbind('A');
      expect(() => { container.get<string>('A'); }).to.throw();
      bind<string>('A').toConstantValue('2');
      expect(container.get<string>('A')).to.eql('2');
      bind<string>('B').toConstantValue('3');
      expect(container.get<string>('B')).to.eql('3');
    });

    container.load(warriors);
    expect(container.get<string>('A')).to.eql('2');
    expect(container.get<string>('B')).to.eql('3');

  });

  it('Should be able to check for existence of bindings within a container module', () => {

    const container = new Container();
    container.bind<string>('A').toConstantValue('1');
    expect(container.get<string>('A')).to.eql('1');

    const warriors = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound) => {
      expect(container.get<string>('A')).to.eql('1');
      expect(isBound('A')).to.eql(true);
      unbind('A');
      expect(isBound('A')).to.eql(false);
    });

    container.load(warriors);

  });

  it('Should be able to override a binding using rebind within a container module', () => {

    const TYPES = {
      someType: 'someType'
    };

    const container = new Container();

    const module1 = new ContainerModule(
      (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound
      ) => {
        bind<number>(TYPES.someType).toConstantValue(1);
        bind<number>(TYPES.someType).toConstantValue(2);
      }
    );

    const module2 = new ContainerModule(
      (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind
      ) => {
        rebind<number>(TYPES.someType).toConstantValue(3);
      }
    );

    container.load(module1);
    const values1 = container.getAll(TYPES.someType);
    expect(values1[0]).to.eq(1);
    expect(values1[1]).to.eq(2);

    container.load(module2);
    const values2 = container.getAll(TYPES.someType);
    expect(values2[0]).to.eq(3);
    expect(values2[1]).to.eq(undefined);

  });

  it('Should be able use await async functions in container modules', async () => {

    const container = new Container();
    const someAsyncFactory = () => new Promise<number>((res) => setTimeout(() => res(1), 100));
    const A = Symbol.for('A');
    const B = Symbol.for('B');

    const moduleOne = new AsyncContainerModule(async (bind) => {
      const val = await someAsyncFactory();
      bind(A).toConstantValue(val);
    });

    const moduleTwo = new AsyncContainerModule(async (bind) => {
      bind(B).toConstantValue(2);
    });

    await container.loadAsync(moduleOne, moduleTwo);

    const AIsBound = container.isBound(A);
    expect(AIsBound).to.eq(true);
    const a = container.get(A);
    expect(a).to.eq(1);

  });

  it('Should be able to add an activation hook through a container module', () => {

    const container = new Container();
    container.bind<string>('A').toDynamicValue(() => '1');
    expect(container.get<string>('A')).to.eql('1');

    const module = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation) => {
      bind<string>('B').toConstantValue('2').onActivation(() => 'C');
      onActivation('A', () => 'B');
    });

    container.load(module);

    expect(container.get<string>('A')).to.eql('B');
    expect(container.get('B')).to.eql('C')
  });

  it('Should be able to add a deactivation hook through a container module', () => {
    const container = new Container();
    container.bind<string>('A').toConstantValue('1');

    let deact = false;
    const warriors = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation, onDeactivation) => {
      onDeactivation('A', () => {
        deact = true;
      });
    });

    container.load(warriors);
    container.get('A');
    container.unbind('A');

    expect(deact).eql(true);
  });

  it('Should be able to add an async deactivation hook through a container module (async)', async () => {
    const container = new Container();
    container.bind<string>('A').toConstantValue('1');

    let deact = false;

    const warriors = new ContainerModule((bind, unbind, isBound, rebind, unBindAsync, onActivation, onDeactivation) => {
      onDeactivation('A', async () => {
        deact = true;
      });
    });

    container.load(warriors);
    container.get('A');
    await container.unbindAsync('A');

    expect(deact).eql(true);
  });

  it('Should be able to add multiple async deactivation hook through a container module (async)', async () => {

    const onActivationHandlerSpy = sinon.spy<() => Promise<void>>(async () => undefined);

    const serviceIdentifier = 'destroyable';
    const container = new Container();

    const containerModule = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation, onDeactivation) => {
      onDeactivation(serviceIdentifier, onActivationHandlerSpy);
      onDeactivation(serviceIdentifier, onActivationHandlerSpy);
    });

    container.bind(serviceIdentifier).toConstantValue(serviceIdentifier);

    container.get(serviceIdentifier);

    container.load(containerModule);

    await container.unbindAllAsync();

    expect(onActivationHandlerSpy.callCount).to.eq(2);
  });

  it('Should remove module bindings when unload', () => {
    const sid = 'sid';
    const container = new Container();
    container.bind<string>(sid).toConstantValue('Not module');
    const module = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation, onDeactivation) => {
      bind<string>(sid).toConstantValue('Module')
    });
    container.load(module);
    let values = container.getAll(sid);
    expect(values).to.deep.equal(['Not module', 'Module']);

    container.unload(module);
    values = container.getAll(sid);
    expect(values).to.deep.equal(['Not module']);
  });

  it('Should deactivate singletons from module bindings when unload', () => {
    const sid = 'sid';
    const container = new Container();
    let moduleBindingDeactivated: string | undefined
    let containerDeactivated: string | undefined
    const module = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation, onDeactivation) => {
      bind<string>(sid).toConstantValue('Module').onDeactivation(injectable => { moduleBindingDeactivated = injectable });
      onDeactivation<string>(sid, injectable => { containerDeactivated = injectable })
    });
    container.load(module);
    container.get(sid);

    container.unload(module);
    expect(moduleBindingDeactivated).to.equal('Module');
    expect(containerDeactivated).to.equal('Module');
  });

  it('Should remove container handlers from module when unload', () => {
    const sid = 'sid';
    const container = new Container();
    let activatedNotModule: string | undefined
    let deactivatedNotModule: string | undefined
    container.onActivation<string>(sid, (_, injected) => {
      activatedNotModule = injected;
      return injected;
    });
    container.onDeactivation<string>(sid, injected => { deactivatedNotModule = injected })
    container.bind<string>(sid).toConstantValue('Value');
    let activationCount = 0;
    let deactivationCount = 0;
    const module = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation, onDeactivation) => {
      onDeactivation<string>(sid, _ => { deactivationCount++ });
      onActivation<string>(sid, (_, injected) => {
        activationCount++;
        return injected;
      });
    });
    container.load(module);
    container.unload(module);

    container.get(sid);
    container.unbind(sid);

    expect(activationCount).to.equal(0);
    expect(deactivationCount).to.equal(0);

    expect(activatedNotModule).to.equal('Value');
    expect(deactivatedNotModule).to.equal('Value')
  })

  it('Should remove module bindings when unloadAsync', async () => {
    const sid = 'sid';
    const container = new Container();
    container.onDeactivation(sid, injected => Promise.resolve());
    container.bind<string>(sid).toConstantValue('Not module');
    const module = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation, onDeactivation) => {
      bind<string>(sid).toConstantValue('Module')
    });
    container.load(module);
    let values = container.getAll(sid);
    expect(values).to.deep.equal(['Not module', 'Module']);

    await container.unloadAsync(module);
    values = container.getAll(sid);
    expect(values).to.deep.equal(['Not module']);
  });

  it('Should deactivate singletons from module bindings when unloadAsync', async () => {
    const sid = 'sid';
    const container = new Container();
    let moduleBindingDeactivated: string | undefined
    let containerDeactivated: string | undefined
    const module = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation, onDeactivation) => {
      bind<string>(sid).toConstantValue('Module').onDeactivation(injectable => { moduleBindingDeactivated = injectable });
      onDeactivation<string>(sid, injectable => {
        containerDeactivated = injectable;
        return Promise.resolve();
      })
    });
    container.load(module);
    container.get(sid);

    await container.unloadAsync(module);
    expect(moduleBindingDeactivated).to.equal('Module');
    expect(containerDeactivated).to.equal('Module');
  });

  it('Should remove container handlers from module when unloadAsync', async () => {
    const sid = 'sid';
    const container = new Container();
    let activatedNotModule: string | undefined
    let deactivatedNotModule: string | undefined
    container.onActivation<string>(sid, (_, injected) => {
      activatedNotModule = injected;
      return injected;
    });
    container.onDeactivation<string>(sid, injected => {
      deactivatedNotModule = injected;
    })
    container.bind<string>(sid).toConstantValue('Value');
    let activationCount = 0;
    let deactivationCount = 0;
    const module = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation, onDeactivation) => {
      onDeactivation<string>(sid, _ => {
        deactivationCount++
        return Promise.resolve();
      });
      onActivation<string>(sid, (_, injected) => {
        activationCount++;
        return injected;
      });
    });
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
    let _unbindAsync: interfaces.UnbindAsync | undefined
    const container = new Container();
    const module = new ContainerModule((bind, unbind, isBound, rebind, unbindAsync, onActivation, onDeactivation) => {
      _unbindAsync = unbindAsync
    });
    const sid = 'sid';
    container.bind<string>(sid).toConstantValue('Value')
    container.bind<string>(sid).toConstantValue('Value2')
    const deactivated: string[] = []
    container.onDeactivation<string>(sid, injected => {
      deactivated.push(injected);
      return Promise.resolve();
    })

    container.getAll(sid);
    container.load(module);
    await _unbindAsync!(sid);
    expect(deactivated).to.deep.equal(['Value', 'Value2']);
    //bindings removed
    expect(() => container.getAll(sid)).to.throw(`${NOT_REGISTERED} sid`)
  });
});