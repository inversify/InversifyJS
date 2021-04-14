import * as ERROR_MSGS from '../constants/error_msgs';
import * as interfaces from '../interfaces/interfaces';

class Lookup<T extends interfaces.Clonable<T>> implements interfaces.Lookup<T> {
  // dictionary used store multiple values for each key <key>
  private _map: Map<interfaces.ServiceIdentifier<unknown>, T[]>;

  public constructor() {
    this._map = new Map<interfaces.ServiceIdentifier<unknown>, T[]>();
  }

  public getMap(): Map<interfaces.ServiceIdentifier<unknown>, T[]> {
    return this._map;
  }

  // adds a new entry to _map
  public add(serviceIdentifier: interfaces.ServiceIdentifier<unknown>, value: T): void {
    if (serviceIdentifier === null || serviceIdentifier === undefined) {
      throw new Error(ERROR_MSGS.NULL_ARGUMENT);
    }

    if (value === null || value === undefined) {
      throw new Error(ERROR_MSGS.NULL_ARGUMENT);
    }

    const entry = this._map.get(serviceIdentifier);
    if (entry !== undefined) {
      entry.push(value);
      this._map.set(serviceIdentifier, entry);
    } else {
      this._map.set(serviceIdentifier, [value]);
    }
  }

  // gets the value of a entry by its key (serviceIdentifier)
  public get(serviceIdentifier: interfaces.ServiceIdentifier<unknown>): T[] {
    if (serviceIdentifier === null || serviceIdentifier === undefined) {
      throw new Error(ERROR_MSGS.NULL_ARGUMENT);
    }

    const entry = this._map.get(serviceIdentifier);

    if (entry !== undefined) {
      return entry;
    } else {
      throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
    }
  }

  // removes a entry from _map by its key (serviceIdentifier)
  public remove(serviceIdentifier: interfaces.ServiceIdentifier<unknown>): void {
    if (serviceIdentifier === null || serviceIdentifier === undefined) {
      throw new Error(ERROR_MSGS.NULL_ARGUMENT);
    }

    if (!this._map.delete(serviceIdentifier)) {
      throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
    }
  }

  public removeByCondition(condition: (item: T) => boolean): void {
    this._map.forEach((entries, key) => {
      const updatedEntries = entries.filter((entry) => !condition(entry));
      if (updatedEntries.length > 0) {
        this._map.set(key, updatedEntries);
      } else {
        this._map.delete(key);
      }
    });
  }

  // returns true if _map contains a key (serviceIdentifier)
  public hasKey(serviceIdentifier: interfaces.ServiceIdentifier<unknown>): boolean {
    if (serviceIdentifier === null || serviceIdentifier === undefined) {
      throw new Error(ERROR_MSGS.NULL_ARGUMENT);
    }

    return this._map.has(serviceIdentifier);
  }

  // returns a new Lookup instance; note: this is not a deep clone, only Lookup related data structure (dictionary) is
  // cloned, content remains the same
  public clone(): interfaces.Lookup<T> {
    const copy = new Lookup<T>();

    this._map.forEach((value, key) => {
      value.forEach((b) => copy.add(key, b.clone()));
    });

    return copy;
  }

  public traverse(func: (key: interfaces.ServiceIdentifier<unknown>, value: T[]) => void): void {
    this._map.forEach((value, key) => {
      func(key, value);
    });
  }
}

export { Lookup };
