import { interfaces } from "../interfaces/interfaces";

export interface ValueProviderFactory<T>{
  toInstance():interfaces.InstanceValueProvider<T>
  toConstantValue():interfaces.ConstantValueProvider<T>
  toDynamicValue():interfaces.DynamicValueProvider<T>
  toConstructor():interfaces.ConstructorValueProvider<T>
  toFactory(): interfaces.FactoryValueProvider<T>
  toProvider(): interfaces.ProviderValueProvider<T>
}