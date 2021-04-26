import { expect } from "chai";
import {ModuleActivationStore} from "../../src/container/module_activation_store"
import { interfaces } from "../../src/inversify"

describe("ModuleActivationStore", () => {
  it("should remove handlers added by the module", () => {
    const moduleActivationStore = new ModuleActivationStore();
    const onActivation1: interfaces.BindingActivation<any> = (c,a) => a;
    const onActivation2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivation1: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    const onDeactivation2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(1,onActivation1);
    moduleActivationStore.addActivation(1,onActivation2);
    moduleActivationStore.addDeactivation(1,onDeactivation1);
    moduleActivationStore.addDeactivation(1,onDeactivation2);

    const onActivationMod2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivationMod2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(2,onActivationMod2);
    moduleActivationStore.addDeactivation(2,onDeactivationMod2);

    const handlers = moduleActivationStore.remove(1);
    expect(handlers.onActivations).to.deep.equal([onActivation1, onActivation2]);
    expect(handlers.onDeactivations).to.deep.equal([onDeactivation1, onDeactivation2]);

    const noHandlers = moduleActivationStore.remove(1);
    expect(noHandlers.onActivations.length).to.be.equal(0);
    expect(noHandlers.onDeactivations.length).to.be.equal(0);

    const module2Handlers = moduleActivationStore.remove(2);
    expect(module2Handlers.onActivations).to.deep.equal([onActivationMod2]);
    expect(module2Handlers.onDeactivations).to.deep.equal([onDeactivationMod2]);
  });

  it("should be able to clone", () => {
    const moduleActivationStore = new ModuleActivationStore();
    const onActivation1: interfaces.BindingActivation<any> = (c,a) => a;
    const onActivation2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivation1: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    const onDeactivation2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(1,onActivation1);
    moduleActivationStore.addActivation(1,onActivation2);
    moduleActivationStore.addDeactivation(1,onDeactivation1);
    moduleActivationStore.addDeactivation(1,onDeactivation2);

    const onActivationMod2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivationMod2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(2,onActivationMod2);
    moduleActivationStore.addDeactivation(2,onDeactivationMod2);

    const clone = moduleActivationStore.clone();

    //change original
    const onActivation3: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivation3: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationStore.addActivation(1,onActivation3);
    moduleActivationStore.addDeactivation(1,onDeactivation3);
    moduleActivationStore.remove(2);

    const cloneModule1Handlers = clone.remove(1);
    const expectedModule1Handlers:interfaces.ModuleActivationHandlers = {
      onActivations:[onActivation1, onActivation2],
      onDeactivations:[onDeactivation1,onDeactivation2]
    };
    expect(cloneModule1Handlers).to.deep.equal(expectedModule1Handlers);
    const cloneModule2Handlers = clone.remove(2);
    const expectedModule2Handlers:interfaces.ModuleActivationHandlers = {
      onActivations:[onActivationMod2],
      onDeactivations:[onDeactivationMod2]
    };
    expect(cloneModule2Handlers).to.deep.equal(expectedModule2Handlers);
  });
});
