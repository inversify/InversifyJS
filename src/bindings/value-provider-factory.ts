import { interfaces } from "../interfaces/interfaces";
import { ConstantValueProvider } from "./constant-value-provider";
import { ConstructorValueProvider } from "./constructor-value-provider";
import { DynamicValueProvider } from "./dynamic-value-provider";
import { FactoryValueProvider } from "./factory-value-provider";
import { InstanceValueProvider } from "./instance-value-provider";
import { ProviderValueProvider } from "./provider-value-provider";

export class ValueProviderFactory<T> implements interfaces.ValueProviderFactory<T>{
  toInstance(): interfaces.InstanceValueProvider<T> {
      return new InstanceValueProvider<T>();
  }
  toConstantValue(): interfaces.ConstantValueProvider<T> {
      return new ConstantValueProvider();
  }
  toDynamicValue(): interfaces.DynamicValueProvider<T> {
      return new DynamicValueProvider();
  }
  toConstructor(): interfaces.ConstructorValueProvider<T> {
      return new ConstructorValueProvider();
  }
  toFactory(): interfaces.FactoryValueProvider<T> {
      return new FactoryValueProvider<T>();
  }

  toProvider(): interfaces.ProviderValueProvider<T> {
      return new ProviderValueProvider<T>();
  }

}