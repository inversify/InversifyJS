import { expect } from "chai";
import {ModuleActivationsStore} from "../../src/container/module_activations_store"
import { interfaces } from "../../src/inversify"

describe("ModuleActivationsStore", () => {
  it("should remove handlers added by the module", () => {
    const moduleActivationsStore = new ModuleActivationsStore();
    const onActivation1: interfaces.BindingActivation<any> = (c,a) => a;
    const onActivation2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivation1: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    const onDeactivation2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationsStore.addActivation(1,onActivation1);
    moduleActivationsStore.addActivation(1,onActivation2);
    moduleActivationsStore.addDeactivation(1,onDeactivation1);
    moduleActivationsStore.addDeactivation(1,onDeactivation2);

    const onActivationMod2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivationMod2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationsStore.addActivation(2,onActivationMod2)
    moduleActivationsStore.addDeactivation(2,onDeactivationMod2)

    const handlers = moduleActivationsStore.remove(1);
    expect(handlers.onActivations).to.deep.equal([onActivation1, onActivation2])
    expect(handlers.onDeactivations).to.deep.equal([onDeactivation1, onDeactivation2])

    const noHandlers = moduleActivationsStore.remove(1);
    expect(noHandlers.onActivations.length).to.be.equal(0);
    expect(noHandlers.onDeactivations.length).to.be.equal(0);

    const module2Handlers = moduleActivationsStore.remove(2);
    expect(module2Handlers.onActivations).to.deep.equal([onActivationMod2]);
    expect(module2Handlers.onDeactivations).to.deep.equal([onDeactivationMod2]);
  })

  it("should be able to clone", () => {
    const moduleActivationsStore = new ModuleActivationsStore();
    const onActivation1: interfaces.BindingActivation<any> = (c,a) => a;
    const onActivation2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivation1: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    const onDeactivation2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationsStore.addActivation(1,onActivation1);
    moduleActivationsStore.addActivation(1,onActivation2);
    moduleActivationsStore.addDeactivation(1,onDeactivation1);
    moduleActivationsStore.addDeactivation(1,onDeactivation2);

    const onActivationMod2: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivationMod2: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationsStore.addActivation(2,onActivationMod2)
    moduleActivationsStore.addDeactivation(2,onDeactivationMod2)

    const clone = moduleActivationsStore.clone()

    //change original
    const onActivation3: interfaces.BindingActivation<any> = (c,a) => a;
    const onDeactivation3: interfaces.BindingDeactivation<any> = (d) => Promise.resolve();
    moduleActivationsStore.addActivation(1,onActivation3)
    moduleActivationsStore.addDeactivation(1,onDeactivation3);
    moduleActivationsStore.remove(2);

    const cloneModule1Handlers = clone.remove(1);
    const expectedModule1Handlers:interfaces.ModuleActivationHandlers = {
      onActivations:[onActivation1, onActivation2],
      onDeactivations:[onDeactivation1,onDeactivation2]
    }
    expect(cloneModule1Handlers).to.deep.equal(expectedModule1Handlers)
    const cloneModule2Handlers = clone.remove(2)
    const expectedModule2Handlers:interfaces.ModuleActivationHandlers = {
      onActivations:[onActivationMod2],
      onDeactivations:[onDeactivationMod2]
    }
    expect(cloneModule2Handlers).to.deep.equal(expectedModule2Handlers)
  })
})