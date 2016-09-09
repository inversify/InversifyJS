import interfaces from "../interfaces/interfaces";
import KeyValuePair from "./key_value_pair";
import * as ERROR_MSGS from "../constants/error_msgs";

class Lookup<T extends interfaces.Clonable<T>> implements interfaces.Lookup<T> {

	// dictionary used store multiple values for each key <key>
    private _dictionary: Array<interfaces.KeyValuePair<T>>;

    public constructor() {
        this._dictionary = [];
    }

	// adds a new KeyValuePair to _dictionary
    public add(serviceIdentifier: interfaces.ServiceIdentifier<any>, value: T): void {

        if (serviceIdentifier === null || serviceIdentifier === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); };
        if (value === null || value === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); };

        let index = this.getIndexByKey(serviceIdentifier);
        if (index !== -1) {
            this._dictionary[index].value.push(value);
        } else {
            this._dictionary.push(new KeyValuePair(serviceIdentifier, value));
        }
    }

    // gets the value of a KeyValuePair by its serviceIdentifier
    public get(serviceIdentifier: interfaces.ServiceIdentifier<any>): Array<T> {

        if (serviceIdentifier === null || serviceIdentifier === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); }

        let index = this.getIndexByKey(serviceIdentifier);
        if (index !== -1) {
            return this._dictionary[index].value;
        } else {
            throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
        }
    }

	// removes a KeyValuePair from _dictionary by its serviceIdentifier
    public remove(serviceIdentifier: interfaces.ServiceIdentifier<any>): void {

        if (serviceIdentifier === null || serviceIdentifier === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); }

        let index = this.getIndexByKey(serviceIdentifier);
        if (index !== -1) {
            this._dictionary.splice(index, 1);
        } else {
            throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
        }

    }

    public removeByModuleId(moduleId: string): void {
        this._dictionary.forEach((keyValuePair: KeyValuePair<any>) => {
            keyValuePair.value = keyValuePair.value.filter((binding: any) => {
                return binding.moduleId !== moduleId;
            });
        });
        this._dictionary = this._dictionary.filter((keyValuePair: KeyValuePair<any>) => {
            return keyValuePair.value.length > 0;
        });
    }

    // returns true if _dictionary contains serviceIdentifier
    public hasKey(serviceIdentifier: interfaces.ServiceIdentifier<any>): boolean {

        if (serviceIdentifier === null || serviceIdentifier === undefined) { throw new Error(ERROR_MSGS.NULL_ARGUMENT); }

        let index = this.getIndexByKey(serviceIdentifier);
        if (index !== -1) {
            return true;
        } else {
            return false;
        }
    }

    // returns a new Lookup instance; note: this is not a deep clone, only Lookup related data structure (dictionary) is
    // cloned, content remains the same
    public clone(): interfaces.Lookup<T> {

        let l = new Lookup<T>();

        for (let entry of this._dictionary) {
            for (let binding of entry.value) {
                l.add(entry.serviceIdentifier, binding.clone());
            }
        }

        return l;
    }

	// finds the location of a KeyValuePair pair in _dictionary by its serviceIdentifier
    private getIndexByKey(serviceIdentifier: interfaces.ServiceIdentifier<any>): number {
        let index = -1;
        for (let i = 0; i < this._dictionary.length; i++) {
            let keyValuePair = this._dictionary[i];
            if (keyValuePair.serviceIdentifier === serviceIdentifier) {
                index = i;
            }
        }
        return index;
    }
}

export default Lookup;
