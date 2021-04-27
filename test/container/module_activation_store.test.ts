import { expect } from "chai";
import {ModuleActivationStore} from "../../src/container/module_activation_store"
import { interfaces } from "../../src/inversify"

describe("ModuleActivationStore", () => {
  it("should remove handlers added by the module", () => {
    const moduleActivationStore = new ModuleActivationStore();
    const serviceIdentifier: string = 'some-service';

    const onActivation1: interfaces.BindingActivation<any> = (c,a) => a;
    const onActivation2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivation1: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    const onDeactivation2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(1, serviceIdentifier, onActivation1);
    moduleActivationStore.addActivation(1, serviceIdentifier, onActivation2);
    moduleActivationStore.addDeactivation(1,serviceIdentifier, onDeactivation1);
    moduleActivationStore.addDeactivation(1, serviceIdentifier, onDeactivation2);

    const onActivationMod2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivationMod2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(2, serviceIdentifier, onActivationMod2);
    moduleActivationStore.addDeactivation(2, serviceIdentifier, onDeactivationMod2);

    const handlers = moduleActivationStore.remove(1);
    expect(handlers.onActivations.getMap()).to.deep.equal(new Map([[serviceIdentifier, [onActivation1, onActivation2]]]));
    expect(handlers.onDeactivations.getMap()).to.deep.equal(new Map([[serviceIdentifier, [onDeactivation1, onDeactivation2]]]));

    const noHandlers = moduleActivationStore.remove(1);
    expect(noHandlers.onActivations.getMap()).to.deep.equal(new Map());
    expect(noHandlers.onDeactivations.getMap()).to.deep.equal(new Map());

    const module2Handlers = moduleActivationStore.remove(2);
    expect(module2Handlers.onActivations.getMap()).to.deep.equal(new Map([[serviceIdentifier, [onActivationMod2]]]));
    expect(module2Handlers.onDeactivations.getMap()).to.deep.equal(new Map([[serviceIdentifier, [onDeactivationMod2]]]));
  });

  it("should be able to clone", () => {
    const moduleActivationStore = new ModuleActivationStore();

    const serviceIdentifier: string = 'some-service';

    const onActivation1: interfaces.BindingActivation<any> = (c,a) => a;
    const onActivation2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivation1: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    const onDeactivation2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();

    moduleActivationStore.addActivation(1, serviceIdentifier, onActivation1);
    moduleActivationStore.addActivation(1, serviceIdentifier, onActivation2);
    moduleActivationStore.addDeactivation(1, serviceIdentifier, onDeactivation1);
    moduleActivationStore.addDeactivation(1, serviceIdentifier, onDeactivation2);

    const onActivationMod2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivationMod2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(2, serviceIdentifier, onActivationMod2);
    moduleActivationStore.addDeactivation(2, serviceIdentifier, onDeactivationMod2);

    const clone = moduleActivationStore.clone();

    //change original
    const onActivation3: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivation3: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();

    moduleActivationStore.addActivation(1, serviceIdentifier, onActivation3);
    moduleActivationStore.addDeactivation(1, serviceIdentifier, onDeactivation3);
    moduleActivationStore.remove(2);

    const cloneModule1Handlers = clone.remove(1);

    expect(cloneModule1Handlers.onActivations.getMap()).to.deep.equal(
      new Map([[serviceIdentifier, [onActivation1, onActivation2]]]),
    );

    expect(cloneModule1Handlers.onDeactivations.getMap()).to.deep.equal(
      new Map([[serviceIdentifier, [onDeactivation1, onDeactivation2]]]),
    );

    const cloneModule2Handlers = clone.remove(2);

    expect(cloneModule2Handlers.onActivations.getMap()).to.deep.equal(
      new Map([[serviceIdentifier, [onActivationMod2]]]),
    );

    expect(cloneModule2Handlers.onDeactivations.getMap()).to.deep.equal(
      new Map([[serviceIdentifier, [onDeactivationMod2]]]),
    );
  });
});
