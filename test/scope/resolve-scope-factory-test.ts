import { expect } from "chai";
import { BindingScopeEnum } from "../../src/inversify";
import { RequestResolveScope } from "../../src/scope/request-resolve-scope";
import { ResolveScopeFactory } from "../../src/scope/resolve-scope-factory"
import { RootRequestScope } from "../../src/scope/root-request-scope";
import { SingletonScope } from "../../src/scope/singleton-scope";
import { TransientScope } from "../../src/scope/transient-scope";

describe("ResolveScopeFactory", () => {
  it("Should return a new instance of SingletonScope for BindingScopeEnum.Singleton", () => {
    const resolveScopeFactory = new ResolveScopeFactory();
    const singletonScope1 = resolveScopeFactory.get(BindingScopeEnum.Singleton);
    const singletonScope2 = resolveScopeFactory.get(BindingScopeEnum.Singleton);
    expect(singletonScope1).to.be.instanceOf(SingletonScope);
    expect(singletonScope2).to.be.instanceOf(SingletonScope);
    expect(singletonScope1).not.to.equal(singletonScope2);
  });

  it("Should return the same instance of TransientScope for BindingScopeEnum.Transient", () => {
    const resolveScopeFactory = new ResolveScopeFactory();
    const transientScope1 = resolveScopeFactory.get(BindingScopeEnum.Transient);
    const transientScope2 = resolveScopeFactory.get(BindingScopeEnum.Transient);
    expect(transientScope1).to.be.instanceOf(TransientScope);
    expect(transientScope2).to.be.instanceOf(TransientScope);
    expect(transientScope1).to.equal(transientScope2);
  });

  it("Should return the same instance of RequestScope for BindingScopeEnum.Request", () => {
    const resolveScopeFactory = new ResolveScopeFactory();
    const requestScope1 = resolveScopeFactory.get(BindingScopeEnum.Request);
    const requestScope2 = resolveScopeFactory.get(BindingScopeEnum.Request);
    expect(requestScope1).to.be.instanceOf(RequestResolveScope);
    expect(requestScope2).to.be.instanceOf(RequestResolveScope);
    expect(requestScope1).to.equal(requestScope2);
  });

  it("Should return the same instance of RootRequestScope for BindingScopeEnum.RootRequest", () => {
    const resolveScopeFactory = new ResolveScopeFactory();
    const rootRequestScope1 = resolveScopeFactory.get(BindingScopeEnum.RootRequest);
    const rootRequestScope2 = resolveScopeFactory.get(BindingScopeEnum.RootRequest);
    expect(rootRequestScope1).to.be.instanceOf(RootRequestScope);
    expect(rootRequestScope2).to.be.instanceOf(RootRequestScope);
    expect(rootRequestScope1).to.equal(rootRequestScope2);
  });
})

