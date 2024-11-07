import * as METADATA_KEY from '../constants/metadata_keys';
import { interfaces } from '../interfaces/interfaces';

class MetadataReader implements interfaces.MetadataReader {
  public getConstructorMetadata(
    constructorFunc: NewableFunction,
  ): interfaces.ConstructorMetadata {
    // TypeScript compiler generated annotations
    const compilerGeneratedMetadata: NewableFunction[] =
      (Reflect.getMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, constructorFunc) as
        | NewableFunction[]
        | undefined) ?? [];

    // User generated constructor annotations
    const userGeneratedMetadata: interfaces.MetadataMap | undefined =
      Reflect.getMetadata(METADATA_KEY.TAGGED, constructorFunc) as
        | interfaces.MetadataMap
        | undefined;

    return {
      compilerGeneratedMetadata,
      userGeneratedMetadata: userGeneratedMetadata ?? {},
    };
  }

  public getPropertiesMetadata(
    constructorFunc: NewableFunction,
  ): interfaces.MetadataMap {
    // User generated properties annotations
    const userGeneratedMetadata: interfaces.MetadataMap | undefined =
      (Reflect.getMetadata(METADATA_KEY.TAGGED_PROP, constructorFunc) as
        | interfaces.MetadataMap
        | undefined) ?? {};

    return userGeneratedMetadata;
  }
}

export { MetadataReader };
