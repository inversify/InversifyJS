import { interfaces } from '../interfaces/interfaces';

function isClonable<T>(obj: unknown): obj is interfaces.Clonable<T> {
  return (typeof obj === 'object')
    && (obj !== null)
    && ('clone' in obj)
    && typeof (obj as interfaces.Clonable<T>).clone === 'function';
}

export { isClonable };
