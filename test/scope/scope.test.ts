import { expect } from "chai";
import { Container, inject, injectable, interfaces, named } from "../../src/inversify";

describe("inRootRequestScope", () => {
  it("should allow additional container.get to share instances", () => {
    const TYPES = {
      rootRequestScope:'rootRequestScope',
      factory:'factory',
      dynamicValue:'dynamicValue'
    }

    @injectable()
    class InRootRequestScope{

    }

    class DynamicValue {
      constructor(readonly inRootRequestScope:InRootRequestScope){

      }
    }

    class FromFactory {
      constructor(readonly inRootRequestScope:InRootRequestScope){

      }
    }

    @injectable()
    class Root {
      constructor(
        @inject(TYPES.rootRequestScope) readonly inRootRequestScope:InRootRequestScope,
        @inject(TYPES.factory) readonly factory:()=>FromFactory,
        @inject(TYPES.dynamicValue) readonly dynamicValue:DynamicValue
        ){
        }

    }
    const trueFalse = [true,false];
    trueFalse.forEach(isRootRequestScope => {
      const container = new Container();
      const bindIn = container.bind<InRootRequestScope>(TYPES.rootRequestScope).to(InRootRequestScope);
      if(isRootRequestScope){
        bindIn.inRootRequestScope();
      }else{
        bindIn.inRequestScope();
      }

      container.bind(TYPES.factory).toFactory(context => {
        const inRootRequestScope = context.container.get<InRootRequestScope>(TYPES.rootRequestScope);
        return () => {
          return new FromFactory(inRootRequestScope);
        }
      })
      container.bind(TYPES.dynamicValue).toDynamicValue(context =>
        new DynamicValue(context.container.get<InRootRequestScope>(TYPES.rootRequestScope)));
      const root = container.resolve(Root);

      expect(root.inRootRequestScope === root.factory().inRootRequestScope).to.equal(isRootRequestScope);
      expect(root.inRootRequestScope === root.dynamicValue.inRootRequestScope).to.equal(isRootRequestScope);
    })

  });

  it("should be possible to delay by pushing the context to the context stack", () => {
    const TYPES = {
      rootRequestScope:'rootRequestScope',
      factory:'factory',
    }

    @injectable()
    class InRootRequestScope{

    }

    class FromFactory {
      constructor(readonly inRootRequestScope:InRootRequestScope){

      }
    }

    @injectable()
    class Root {
      constructor(
        @inject(TYPES.rootRequestScope) @named("one") readonly inRootRequestScope:InRootRequestScope,
        @inject(TYPES.factory) readonly factory:(name:"one"|"theother")=>FromFactory,
        ){
        }

    }
    const trueFalse = [true,false];
    trueFalse.forEach(isRootRequestScope => {
      const container = new Container();
      const bindTo = container.bind<InRootRequestScope>(TYPES.rootRequestScope).to(InRootRequestScope);
      if(isRootRequestScope){
        bindTo.inRootRequestScope();
      }else{
        bindTo.inRequestScope();
      }

      container.bind(TYPES.factory).toFactory(context => {
        return (name:"one"|"theother") => {
          const inRootRequestScope = context.inRootRequestScope().container.getNamed<InRootRequestScope>(TYPES.rootRequestScope,name)
          return new FromFactory(inRootRequestScope);
        }
      })
      const root = container.resolve(Root);

      expect(root.inRootRequestScope === root.factory("one").inRootRequestScope).to.equal(isRootRequestScope);
    })
  });
})

describe("Built in scopes", () => {
  it("should work as expected", () => {
    const container = new Container({autoBindInjectable: true});
    const TYPES = {
      inRootRequestScopeFactory:"inRootRequestScopeFactory",
      inRequestScopeFactory:"inRequestScopeFactory",
      lateInRootRequestScopeFactoryOptIn:"lateInRootRequestScopeFactoryOptIn",
      lateInRootRequestScopeFactory:"lateInRootRequestScopeFactory",
    }
    @injectable()
    class InRootRequestScope {}
    @injectable()
    class InRequestScope {}
    @injectable()
    class InSingletonScope {}
    @injectable()
    class InTransientScope {}
    @injectable()
    class ScopeConsumer{
      constructor(
        readonly inRootRequestScope:InRootRequestScope,
        readonly inRequestScope:InRequestScope,
        readonly inSingletonScope:InSingletonScope,
        readonly inTransientScope:InTransientScope,
        @inject(TYPES.inRootRequestScopeFactory) readonly inRootRequesScopeFactory: () => InRootRequestScope,
        @inject(TYPES.inRequestScopeFactory) readonly inRequestScopeFactory: () => InRequestScope,
        @inject(TYPES.lateInRootRequestScopeFactory) readonly lateInRootRequesScopeFactory: () => InRootRequestScope,
        @inject(TYPES.lateInRootRequestScopeFactoryOptIn) readonly lateInRootRequestScopeFactoryOptIn: () => InRootRequestScope,
        ){}
    }

    @injectable()
    class CompositionRoot{
      constructor(
        readonly inRootRequestScope:InRootRequestScope,
        readonly inRequestScope:InRequestScope,
        readonly inSingletonScope:InSingletonScope,
        readonly inTransientScope:InTransientScope,
        readonly scopeConsumer:ScopeConsumer
        ){}
    }

    container.bind<InRootRequestScope>(InRootRequestScope).toSelf().inRootRequestScope();
    container.bind<InRequestScope>(InRequestScope).toSelf().inRequestScope();
    container.bind<InSingletonScope>(InSingletonScope).toSelf().inSingletonScope();
    container.bind<InTransientScope>(InTransientScope).toSelf().inTransientScope();

    container.bind<interfaces.Factory<InRootRequestScope>>(TYPES.inRootRequestScopeFactory)
      .toFactory<InRootRequestScope>(context => {
        const inRootRequestScope = context.container.get<InRootRequestScope>(InRootRequestScope);
        return () => inRootRequestScope
      });

    container.bind<interfaces.Factory<InRequestScope>>(TYPES.inRequestScopeFactory)
      .toFactory<InRequestScope>(context => {
        const inRequestScope = context.container.get<InRequestScope>(InRequestScope);
        return () => inRequestScope
      });

    container.bind<interfaces.Factory<InRootRequestScope>>(TYPES.lateInRootRequestScopeFactory)
      .toFactory<InRootRequestScope>(context => {
        return () => {
          return context.container.get<InRootRequestScope>(InRootRequestScope);
        }
      });

      container.bind<interfaces.Factory<InRootRequestScope>>(TYPES.lateInRootRequestScopeFactoryOptIn)
      .toFactory<InRootRequestScope>(context => {
        return () => {
          return context.inRootRequestScope().container.get<InRootRequestScope>(InRootRequestScope);
        }
      });

    const compositionRoot = container.resolve(CompositionRoot);
    const scopedConsumer = compositionRoot.scopeConsumer;

    // a given
    expect(compositionRoot.inSingletonScope === scopedConsumer.inSingletonScope).to.equal(true);
    expect(compositionRoot.inTransientScope !== scopedConsumer.inTransientScope).to.equal(true);

    // same request
    expect(compositionRoot.inRootRequestScope === scopedConsumer.inRootRequestScope).to.equal(true);
    expect(compositionRoot.inRequestScope === scopedConsumer.inRequestScope).to.equal(true);

    // multiple contexts
    expect(compositionRoot.inRootRequestScope === scopedConsumer.inRootRequesScopeFactory()).to.equal(true);
    expect(compositionRoot.inRequestScope !== scopedConsumer.inRequestScopeFactory()).to.equal(true);
    expect(compositionRoot.inRootRequestScope !== scopedConsumer.lateInRootRequesScopeFactory()).to.equal(true);
    expect(compositionRoot.inRootRequestScope === scopedConsumer.lateInRootRequestScopeFactoryOptIn()).to.equal(true);

  })
});

