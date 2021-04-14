import * as METADATA_KEY from '../constants/metadata_keys';
import * as interfaces from '../interfaces/interfaces';

class MetadataReader implements interfaces.MetadataReader {
  public getConstructorMetadata(constructorFunc: NewableFunction): interfaces.ConstructorMetadata {
    // TypeScript compiler generated annotations
    const compilerGeneratedMetadata = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, constructorFunc) as NewableFunction[] | undefined;

    // User generated constructor annotations
    const userGeneratedMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, constructorFunc) as interfaces.MetadataMap;

    return {
      compilerGeneratedMetadata,
      userGeneratedMetadata: userGeneratedMetadata || {}
    };
  }

  public getPropertiesMetadata(constructorFunc: NewableFunction): interfaces.MetadataMap {
    // User generated properties annotations
    const userGeneratedMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED_PROP, constructorFunc) as interfaces.MetadataMap || [];
    return userGeneratedMetadata;
  }
}

export { MetadataReader };
