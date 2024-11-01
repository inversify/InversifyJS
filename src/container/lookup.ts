import * as ERROR_MSGS from '../constants/error_msgs';
import { interfaces } from '../interfaces/interfaces';
import { isClonable } from '../utils/clonable';

class Lookup<T> implements interfaces.Lookup<T> {
  // dictionary used store multiple values for each key <key>
  private readonly _map: Map<interfaces.ServiceIdentifier, T[]>;

  constructor() {
    this._map = new Map<interfaces.ServiceIdentifier, T[]>();
  }

  public getMap() {
    return this._map;
  }

  // adds a new entry to _map
  public add(serviceIdentifier: interfaces.ServiceIdentifier, value: T): void {
    this._checkNonNulish(serviceIdentifier);

    if (value === null || value === undefined) {
      throw new Error(ERROR_MSGS.NULL_ARGUMENT);
    }

    const entry: T[] | undefined = this._map.get(serviceIdentifier);
    if (entry !== undefined) {
      entry.push(value);
    } else {
      this._map.set(serviceIdentifier, [value]);
    }
  }

  // gets the value of a entry by its key (serviceIdentifier)
  public get(serviceIdentifier: interfaces.ServiceIdentifier): T[] {
    this._checkNonNulish(serviceIdentifier);

    const entry: T[] | undefined = this._map.get(serviceIdentifier);

    if (entry !== undefined) {
      return entry;
    } else {
      throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
    }
  }

  // removes a entry from _map by its key (serviceIdentifier)
  public remove(serviceIdentifier: interfaces.ServiceIdentifier): void {
    this._checkNonNulish(serviceIdentifier);

    if (!this._map.delete(serviceIdentifier)) {
      throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
    }
  }

  public removeIntersection(lookup: interfaces.Lookup<T>): void {
    this.traverse(
      (
        serviceIdentifier: interfaces.ServiceIdentifier<unknown>,
        value: T[],
      ) => {
        const lookupActivations: T[] | undefined = lookup.hasKey(
          serviceIdentifier,
        )
          ? lookup.get(serviceIdentifier)
          : undefined;
        if (lookupActivations !== undefined) {
          const filteredValues: T[] = value.filter(
            (lookupValue: T) =>
              !lookupActivations.some(
                (moduleActivation: T) => lookupValue === moduleActivation,
              ),
          );

          this._setValue(serviceIdentifier, filteredValues);
        }
      },
    );
  }

  public removeByCondition(condition: (item: T) => boolean): T[] {
    const removals: T[] = [];
    this._map.forEach((entries: T[], key: interfaces.ServiceIdentifier) => {
      const updatedEntries: T[] = [];

      for (const entry of entries) {
        const remove: boolean = condition(entry);
        if (remove) {
          removals.push(entry);
        } else {
          updatedEntries.push(entry);
        }
      }

      this._setValue(key, updatedEntries);
    });

    return removals;
  }

  // returns true if _map contains a key (serviceIdentifier)
  public hasKey(serviceIdentifier: interfaces.ServiceIdentifier): boolean {
    this._checkNonNulish(serviceIdentifier);

    return this._map.has(serviceIdentifier);
  }

  // returns a new Lookup instance; note: this is not a deep clone, only Lookup related data structure (dictionary) is
  // cloned, content remains the same
  public clone(): interfaces.Lookup<T> {
    const copy: Lookup<T> = new Lookup<T>();

    this._map.forEach((value: T[], key: interfaces.ServiceIdentifier) => {
      value.forEach((b: T) => {
        copy.add(key, isClonable<T>(b) ? b.clone() : b);
      });
    });

    return copy;
  }

  public traverse(
    func: (key: interfaces.ServiceIdentifier, value: T[]) => void,
  ): void {
    this._map.forEach((value: T[], key: interfaces.ServiceIdentifier) => {
      func(key, value);
    });
  }

  private _checkNonNulish(value: unknown): void {
    if (value == null) {
      throw new Error(ERROR_MSGS.NULL_ARGUMENT);
    }
  }

  private _setValue(
    serviceIdentifier: interfaces.ServiceIdentifier<unknown>,
    value: T[],
  ): void {
    if (value.length > 0) {
      this._map.set(serviceIdentifier, value);
    } else {
      this._map.delete(serviceIdentifier);
    }
  }
}

export { Lookup };
