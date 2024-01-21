import { expect } from 'chai';
import { ModuleActivationStore } from '../../src/container/module_activation_store'
import { interfaces } from '../../src/inversify'

describe('ModuleActivationStore', () => {
  it('should remove handlers added by the module', () => {
    const moduleActivationStore = new ModuleActivationStore();

    const moduleId1: number = 1;
    const moduleId2: number = 2;
    const serviceIdentifier1: string = 'some-service-1';
    const serviceIdentifier2: string = 'some-service-2';

    const onActivation1: interfaces.BindingActivation<unknown> = (c, a) => a;
    const onActivation2: interfaces.BindingActivation<unknown> = (c, a) => a;
    const onActivation3: interfaces.BindingActivation<unknown> = (c, a) => a;
    const onDeactivation1: interfaces.BindingDeactivation<unknown> = (d) => Promise.resolve();
    const onDeactivation2: interfaces.BindingDeactivation<unknown> = (d) => Promise.resolve();
    const onDeactivation3: interfaces.BindingDeactivation<unknown> = (d) => Promise.resolve();

    moduleActivationStore.addActivation(moduleId1, serviceIdentifier1, onActivation1);
    moduleActivationStore.addActivation(moduleId1, serviceIdentifier1, onActivation2);
    moduleActivationStore.addActivation(moduleId1, serviceIdentifier2, onActivation3);
    moduleActivationStore.addDeactivation(moduleId1, serviceIdentifier1, onDeactivation1);
    moduleActivationStore.addDeactivation(moduleId1, serviceIdentifier1, onDeactivation2);
    moduleActivationStore.addDeactivation(moduleId1, serviceIdentifier2, onDeactivation3);

    const onActivationMod2: interfaces.BindingActivation<unknown> = (c, a) => a;
    const onDeactivationMod2: interfaces.BindingDeactivation<unknown> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(moduleId2, serviceIdentifier1, onActivationMod2);
    moduleActivationStore.addDeactivation(moduleId2, serviceIdentifier1, onDeactivationMod2);

    const handlers = moduleActivationStore.remove(moduleId1);
    expect(handlers.onActivations.getMap()).to.deep.equal(new Map([
      [serviceIdentifier1, [onActivation1, onActivation2]],
      [serviceIdentifier2, [onActivation3]]
    ]));
    expect(handlers.onDeactivations.getMap()).to.deep.equal(new Map([
      [serviceIdentifier1, [onDeactivation1, onDeactivation2]],
      [serviceIdentifier2, [onDeactivation3]],
    ]));

    const noHandlers = moduleActivationStore.remove(moduleId1);
    expect(noHandlers.onActivations.getMap()).to.deep.equal(new Map());
    expect(noHandlers.onDeactivations.getMap()).to.deep.equal(new Map());

    const module2Handlers = moduleActivationStore.remove(moduleId2);
    expect(module2Handlers.onActivations.getMap()).to.deep.equal(new Map([[serviceIdentifier1, [onActivationMod2]]]));
    expect(module2Handlers.onDeactivations.getMap()).to.deep.equal(new Map([[serviceIdentifier1, [onDeactivationMod2]]]));
  });

  it('should be able to clone', () => {
    const moduleActivationStore = new ModuleActivationStore();

    const moduleId1: number = 1;
    const moduleId2: number = 2;
    const serviceIdentifier1: string = 'some-service-1';
    const serviceIdentifier2: string = 'some-service-2';

    const onActivation1: interfaces.BindingActivation<unknown> = (c, a) => a;
    const onActivation2: interfaces.BindingActivation<unknown> = (c, a) => a;
    const onActivation3: interfaces.BindingActivation<unknown> = (c, a) => a;
    const onDeactivation1: interfaces.BindingDeactivation<unknown> = (d) => Promise.resolve();
    const onDeactivation2: interfaces.BindingDeactivation<unknown> = (d) => Promise.resolve();
    const onDeactivation3: interfaces.BindingDeactivation<unknown> = (d) => Promise.resolve();

    moduleActivationStore.addActivation(moduleId1, serviceIdentifier1, onActivation1);
    moduleActivationStore.addActivation(moduleId1, serviceIdentifier1, onActivation2);
    moduleActivationStore.addActivation(moduleId1, serviceIdentifier2, onActivation3);
    moduleActivationStore.addDeactivation(moduleId1, serviceIdentifier1, onDeactivation1);
    moduleActivationStore.addDeactivation(moduleId1, serviceIdentifier1, onDeactivation2);
    moduleActivationStore.addDeactivation(moduleId1, serviceIdentifier2, onDeactivation3);

    const onActivationMod2: interfaces.BindingActivation<unknown> = (c, a) => a;
    const onDeactivationMod2: interfaces.BindingDeactivation<unknown> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(moduleId2, serviceIdentifier1, onActivationMod2);
    moduleActivationStore.addDeactivation(moduleId2, serviceIdentifier1, onDeactivationMod2);

    const clone = moduleActivationStore.clone();

    //change original
    const onActivation4: interfaces.BindingActivation<unknown> = (c, a) => a;
    const onDeactivation4: interfaces.BindingDeactivation<unknown> = (d) => Promise.resolve();

    moduleActivationStore.addActivation(moduleId1, serviceIdentifier1, onActivation4);
    moduleActivationStore.addDeactivation(moduleId1, serviceIdentifier1, onDeactivation4);
    moduleActivationStore.remove(moduleId2);

    const cloneModule1Handlers = clone.remove(moduleId1);

    expect(cloneModule1Handlers.onActivations.getMap()).to.deep.equal(
      new Map([
        [serviceIdentifier1, [onActivation1, onActivation2]],
        [serviceIdentifier2, [onActivation3]]
      ]),
    );

    expect(cloneModule1Handlers.onDeactivations.getMap()).to.deep.equal(
      new Map([
        [serviceIdentifier1, [onDeactivation1, onDeactivation2]],
        [serviceIdentifier2, [onDeactivation3]],
      ]),
    );

    const cloneModule2Handlers = clone.remove(moduleId2);

    expect(cloneModule2Handlers.onActivations.getMap()).to.deep.equal(
      new Map([[serviceIdentifier1, [onActivationMod2]]]),
    );

    expect(cloneModule2Handlers.onDeactivations.getMap()).to.deep.equal(
      new Map([[serviceIdentifier1, [onDeactivationMod2]]]),
    );
  });
});