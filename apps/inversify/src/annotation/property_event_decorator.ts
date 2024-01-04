import { Metadata } from '../planning/metadata';

function propertyEventDecorator(eventKey: string, errorMessage: string) {
  return () => {
    return (target: { constructor: NewableFunction; }, propertyKey: string) => {
      const metadata = new Metadata(eventKey, propertyKey);

      if (Reflect.hasOwnMetadata(eventKey, target.constructor)) {
        throw new Error(errorMessage);
      }
      Reflect.defineMetadata(eventKey, metadata, target.constructor);
    }
  }
}

export { propertyEventDecorator }
