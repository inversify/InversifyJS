import { expect } from "chai"
import { BindingScopeEnum, ConfigurableBindingScopeEnum } from "../../src/constants/literal_types"
import { interfaces } from "../../src/interfaces/interfaces"
import { ScopeManager } from "../../src/scope/scope-manager"
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import * as sinon from "sinon";
import { ResolveScopeFactory } from "../../src/scope/resolve-scope-factory";
import { ResolveScopeFactory as ResolveScopeFactoryInterface} from "../../src/scope/resolve-scope-factory"


describe("ScopeManager", () => {
  it("Should initially have scope NotConfigured", () => {
    const expectedScope:interfaces.ConfigurableBindingScope = ConfigurableBindingScopeEnum.NotConfigured;
    expect(new ScopeManager().scope).to.equal(expectedScope);
  });

  it("Should throw error when get and not configured", () => {
    expect(() => new ScopeManager().get(null as any, null as any)).to.throw(ERROR_MSGS.SCOPE_NOT_CONFIGURED);
  });

  it("Should throw error when set and not configured", () => {
    expect(() => new ScopeManager().set(null as any, null as any,"resolved")).to.throw(ERROR_MSGS.SCOPE_NOT_CONFIGURED);
  });

  it("Should get from the configured scope", () => {
    const scopeManager = new ScopeManager();
    const fromScope = "from scope";
    const scope:interfaces.Scope<any> = {
      get(){
        return fromScope;
      },
      set(){
        return fromScope;
      },
      clone(){
        return this;
      }
    }
    scopeManager.resolveScope = scope;
    const spied = sinon.spy(scope,"get");
    const binding:any = {b:true};
    const request:any = {r:true};
    expect(scopeManager.get(binding,request)).to.equal(fromScope);
    expect(spied.calledWithExactly(binding, request)).to.equal(true);
  });

  it("Should set with the configured scope", () => {
    const scopeManager = new ScopeManager();
    const fromScope = "from scope";
    const scope:interfaces.Scope<any> = {
      get(){
        return fromScope;
      },
      set(){
        return fromScope;
      },
      clone(){
        return this;
      }
    }
    scopeManager.resolveScope = scope;
    const spied = sinon.spy(scope,"set");
    const binding:any = {b:true};
    const request:any = {r:true};
    const resolved = "resolved";
    expect(scopeManager.set(binding,request,resolved)).to.equal(fromScope);
    expect(spied.calledWithExactly(binding, request,resolved)).to.equal(true);
  });

  it("Should set the scope property and resolvedScope from factory when setScope", () => {
    const scopeManager = new ScopeManager();
    const scope:any = {};
    let factoryScope:interfaces.BindingScope | undefined;
    const scopeFactory:ResolveScopeFactoryInterface<unknown> = {
      get(bindingScope){
        factoryScope = bindingScope;
        return scope;
      }
    };
    scopeManager.scopeFactory = scopeFactory;

    function scopeTest(setScope:interfaces.BindingScope){
      scopeManager.resolveScope = {} as any;
      scopeManager.setScope(setScope);
      expect(scopeManager.scope).to.equal(setScope);
      expect(factoryScope).to.equal(setScope);
      expect(scopeManager.resolveScope).to.equal(scope);
    }

    scopeTest(BindingScopeEnum.Singleton);
    scopeTest(BindingScopeEnum.Request);
    scopeTest(BindingScopeEnum.Transient);
    scopeTest(BindingScopeEnum.RootRequest);

  });

  it("Should have scopeFactory as instance of ResolveScopeFactory", () => {
    expect(new ScopeManager().scopeFactory).to.be.instanceOf(ResolveScopeFactory);
  });

  it("Should clone the scope and resolve scope", () => {
    const scopeManager = new ScopeManager();
    scopeManager.scope = BindingScopeEnum.Request;
    const cloned = {};
    const resolveScope:any = {clone(){return cloned;}}
    scopeManager.resolveScope = resolveScope;
    const clone = scopeManager.clone();
    expect(clone.scope).to.equal(BindingScopeEnum.Request);
    expect(clone.resolveScope).to.equal(cloned);

    const notConfiguredScopeManager = new ScopeManager();
    const notConfiguredScopeManagerClone = notConfiguredScopeManager.clone();
    expect(notConfiguredScopeManagerClone.scope).to.equal(ConfigurableBindingScopeEnum.NotConfigured);
    // tslint:disable-next-line: no-unused-expression
    expect(notConfiguredScopeManagerClone.resolveScope).to.be.undefined;
  });

  it("Should set the scope to custom and set the resolveScope when setCustomScope", () => {
    const scopeManager = new ScopeManager();
    const customScope:any = {}
    scopeManager.setCustomScope(customScope);
    expect(scopeManager.scope).to.equal(ConfigurableBindingScopeEnum.Custom);
    expect(scopeManager.resolveScope).to.equal(customScope);
  })
})