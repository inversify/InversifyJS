///<reference path="../interfaces/interfaces.d.ts" />

// TypeBinding
// -----------

// A dictionary with support for duplicate keys

import KeyValuePair from "./key_value_pair";
import * as ERROR_MSGS from "../constants/error_msgs";

class Lookup<T> implements ILookup<T> {

	// dictionary used store multiple values for each key <key>
    private _dictionary: Array<IKeyValuePair<T>>;

    public constructor() {
        this._dictionary = new Array<IKeyValuePair<T>>();
    }

	// adds a new KeyValuePair to _dictionary
    public add(key: string, value: T): void {

        if (key === null || key === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); };
        if (value === null || value === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); };

        let index = this.getIndexByKey(key);
        if (index !== -1) {
            this._dictionary[index].value.push(value);
        } else {
            this._dictionary.push(new KeyValuePair(key, value));
        }
    }

    // gets the value of a KeyValuePair by its key
    public get(key: string): Array<T> {

        if (key === null || key === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); }

        let index = this.getIndexByKey(key);
        if (index !== -1) {
            return this._dictionary[index].value;
        } else {
            throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
        }
    }

	// removes a KeyValuePair from _dictionary by its key
    public remove(key: string): void {

        if (key === null || key === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); }

        let index = this.getIndexByKey(key);
        if (index !== -1) {
            this._dictionary.splice(index, 1);
        } else {
            throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
        }
    }

    // returns true if _dictionary contains key
    public hasKey(key: string): boolean {

        if (key === null || key === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); }

        let index = this.getIndexByKey(key);
        if (index !== -1) {
            return true;
        } else {
            return false;
        }
    }

	// finds the location of a KeyValuePair pair in _dictionary by its key
    private getIndexByKey(key: string): number {
        let index = -1;
        for (let i = 0; i < this._dictionary.length; i++) {
            let keyValuePair = this._dictionary[i];
            if (keyValuePair.key === key) {
                index = i;
            }
        }
        return index;
    }

}

export default Lookup;
