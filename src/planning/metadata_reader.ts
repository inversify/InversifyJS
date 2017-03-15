import { interfaces } from "../interfaces/interfaces";
import * as METADATA_KEY from "../constants/metadata_keys";

class MetadataReader implements interfaces.MetadataReader {

    public getConstrucotorMetadata(constructorFunc: Function): interfaces.ConstructorMetadata {

        // TypeScript compiler generated annotations
        let compilerGeneratedMetadata = Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, constructorFunc);

        // User generated constructor annotations
        let userGeneratedMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, constructorFunc);

        return {
            compilerGeneratedMetadata: compilerGeneratedMetadata,
            userGeneratedMetadata: userGeneratedMetadata || []
        };

    }

    public getPropertiesMetadata(constructorFunc: Function): interfaces.PropertiesMetadata {
        // User generated properties annotations
        return Reflect.getMetadata(METADATA_KEY.TAGGED_PROP, constructorFunc) || [];
    }

}

export { MetadataReader };
