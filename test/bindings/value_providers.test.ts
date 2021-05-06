import { expect } from "chai";
import { ConstantValueProvider } from "../../src/bindings/constant-value-provider"
import { ConstructorValueProvider } from "../../src/bindings/constructor-value-provider";
import { DynamicValueProvider } from "../../src/bindings/dynamic-value-provider";
import { FactoryValueProvider } from "../../src/bindings/factory-value-provider";
import { Container, inject, injectable, interfaces, METADATA_KEY, TargetTypeEnum } from "../../src/inversify";
import { Context } from "../../src/planning/context";
import * as sinon from "sinon";
import { ProviderValueProvider } from "../../src/bindings/provider-value-provider";
import { Plan } from "../../src/planning/plan";
import { Request } from "../../src/planning/request";
import { getBindingDictionary } from "../../src/planning/planner";
import { Metadata } from "../../src/planning/metadata";
import { Target } from "../../src/planning/target";
import { InstanceValueProvider } from "../../src/bindings/instance-value-provider";
import { NotConfiguredValueProvider } from "../../src/bindings/not-configured-value-provider";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

describe("value providers", () => {
  describe("ConstantValueProvider", () => {
    it("Should provide the constant value", () => {
      class Constant {}
      const constantValueProvider = new ConstantValueProvider<Constant>();
      const constant = new Constant();
      constantValueProvider.valueFrom = constant;
      expect(constantValueProvider.provideValue() === constant).to.equal(true);
    });

    it("Should be able to clone itself", () => {
      class Constant {}
      const constantValueProvider = new ConstantValueProvider<Constant>();
      const constant = new Constant();
      constantValueProvider.valueFrom = constant;
      const cloned = constantValueProvider.clone();
      expect(cloned).to.be.instanceOf(ConstantValueProvider);
      expect(cloned.valueFrom === constant);
    });

  });

  describe("ConstructorValueProvider", () => {
    it("Should provide the constructor", () => {
      class AClass{}
      const constructorValueProvider = new ConstructorValueProvider<AClass>();
      constructorValueProvider.valueFrom = AClass;
      expect(constructorValueProvider.provideValue()).to.equal(AClass);
    });

    it("Should be able to clone itself", () => {
      class AClass{}
      const constructorValueProvider = new ConstructorValueProvider<AClass>();
      constructorValueProvider.valueFrom = AClass;
      const cloned = constructorValueProvider.clone();
      expect(cloned).to.be.instanceOf(ConstructorValueProvider);
      expect(cloned.valueFrom === AClass);
    });
  });

  describe("DynamicValueProvider", () => {
    it("Should provide the dynamic value", () => {
      const dynamicValueProvider = new DynamicValueProvider<Context>();
      dynamicValueProvider.valueFrom = (context) => context;
      const ctx = new Context(null as any);
      expect(dynamicValueProvider.provideValue(ctx,[])).to.equal(ctx);
    });

    it("Should be able to clone itself", () => {
      const dynamicValueProvider = new DynamicValueProvider<Context>();
      dynamicValueProvider.valueFrom = (context) => context;
      const clone = dynamicValueProvider.clone();
      expect(clone).instanceOf(DynamicValueProvider);
      expect(clone.valueFrom).to.equal(dynamicValueProvider.valueFrom);
    });

  });

  describe("FactoryValueProvider", () => {
    it("Should provide the factory", () => {
      const factory = () => "from factory";
      const ctx = new Context(null as any);
      const factoryCreator = sinon.stub().returns(factory);
      const factoryValueProvider = new FactoryValueProvider<typeof factory>();
      factoryValueProvider.valueFrom = factoryCreator;
      const provided = factoryValueProvider.provideValue(ctx, []);
      expect(provided).to.equal(factory);
      expect(factoryCreator.calledWithExactly(ctx));
    });

    it("Should be able to clone itself", () => {
      const factory = () => "from factory";
      const factoryCreator = (context:interfaces.Context) => factory;
      const factoryValueProvider = new FactoryValueProvider<typeof factory>();
      factoryValueProvider.valueFrom =  factoryCreator;
      const clone = factoryValueProvider.clone();
      expect(clone).instanceOf(FactoryValueProvider);
      expect(clone.valueFrom).to.equal(factoryCreator);
    });
  });

  describe("ProviderValueProvider", () => {
    it("Should provide the async factory", () => {
      const asyncFactory = () => Promise.resolve("from factory");
      const ctx = new Context(null as any);
      const providerCreator = sinon.stub().returns(asyncFactory);
      const providerValueProvider = new ProviderValueProvider<typeof asyncFactory>();
      providerValueProvider.valueFrom = providerCreator;
      const provided = providerValueProvider.provideValue(ctx, []);
      expect(provided).to.equal(asyncFactory);
      expect(providerCreator.calledWithExactly(ctx));
    });

    it("Should be able to clone itself", () => {
      const asyncFactory = () => Promise.resolve("from factory");
      const providerCreator = sinon.stub().returns(asyncFactory);
      const providerValueProvider = new ProviderValueProvider<typeof asyncFactory>();
      providerValueProvider.valueFrom = providerCreator;
      const clone = providerValueProvider.clone();
      expect(clone).instanceOf(ProviderValueProvider);
      expect(clone.valueFrom).to.equal(providerCreator);
    });
  });

  describe("InstanceValueProvider", () => {
    it("Should provide an instantiated instance", () => {
      interface Weapon{
        description:string;
      }
      @injectable() //@ts-ignore
      class ChuckIsTheWeapon implements Weapon{
        description = "Chuck is the weapon";
      }
      @injectable()
      class ChuckNorris{
        constructor(@inject("Weapon") readonly weapon:Weapon){}
      }

      const container = new Container();
      container.bind("Weapon").toConstantValue(new ChuckIsTheWeapon());
      container.bind<ChuckNorris>(ChuckNorris).toSelf();

      const bindingDictionary = getBindingDictionary(container);

      const chuckWeaponBinding = bindingDictionary.get("Weapon")[0];
      const chuckBinding = bindingDictionary.get(ChuckNorris)[0];

      const chuckMetadata = new Metadata(METADATA_KEY.INJECT_TAG, ChuckNorris);
      const chuckTarget = new Target(TargetTypeEnum.Variable, "", ChuckNorris,chuckMetadata);

      const chucksWeaponMetadata = new Metadata(METADATA_KEY.INJECT_TAG, "Weapon");
      const chucksWeaponTarget = new Target(TargetTypeEnum.ConstructorArgument, "", "Weapon",chucksWeaponMetadata);

      const context = new Context(container);
      const chuckRequest = new Request(ChuckNorris,context,null,[chuckBinding],chuckTarget);
      chuckRequest.addChildRequest(ChuckIsTheWeapon,[chuckWeaponBinding],chucksWeaponTarget);
      context.addPlan(new Plan(context, chuckRequest));
      context.currentRequest = chuckRequest;

      const instanceValueProvider = new InstanceValueProvider<ChuckNorris>();
      instanceValueProvider.valueFrom = ChuckNorris;
      const chuck = instanceValueProvider.provideValue(context, chuckRequest.childRequests);
      expect(chuck.weapon.description).to.equal("Chuck is the weapon");
    });

    it("Should be able to clone itself", () => {
      class ChuckNorris{
      }
      const instanceValueProvider = new InstanceValueProvider<ChuckNorris>();
      instanceValueProvider.valueFrom = ChuckNorris;
      const clone = instanceValueProvider.clone();
      expect(clone.valueFrom).to.equal(ChuckNorris);
    })
  });

  describe("NotConfiguredValueProvider", () => {
    it("Should throw when provideValue is invoke", () => {
      const notConfiguredValueProvider = new NotConfiguredValueProvider("Sid");
      expect(() => notConfiguredValueProvider.provideValue()).to.throw(`${ERROR_MSGS.INVALID_BINDING_TYPE} Sid`);
    });

    it("Should return itself when clone", () => {
      const notConfiguredValueProvider = new NotConfiguredValueProvider("sid");
      expect(notConfiguredValueProvider.clone()).to.equal(notConfiguredValueProvider);
    });

  });
})