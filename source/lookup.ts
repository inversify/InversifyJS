///<reference path="./interfaces.d.ts" />

// TypeBinding
// -----------

// A hash map with support for duplicate keys

class KeyValuePair<T> implements IKeyValuePair<T> {
	public key : string;
	public value : Array<T>;

	constructor(key : string, value : T) {
		this.key = key;
		this.value = new Array<T>();
		this.value.push(value);
	}
}

class Lookup<T> implements ILookup<T> {

	// hashmap used store multiple values for each key <key>
	private _hashMap : Array<IKeyValuePair<T>>;

	constructor() {
		this._hashMap = new Array<IKeyValuePair<T>>();
	}

	// finds the location of a KeyValuePair pair in _hashMap by its key
	private getIndexByKey(key : string) : number {
		var index = -1;
		for(var i = 0; i < this._hashMap.length; i++) {
			var keyValuePair = this._hashMap[i];
			if(keyValuePair.key === key) {
				index = i;
			}
		}
		return index;
	}

	// adds a new KeyValuePair to _hashMap
	public add(key : string, value : T) : void {

		if(key === null || key === undefined) throw new Error("Argument Null");
		if(value === null || value === undefined) throw new Error("Argument Null");

		var index = this.getIndexByKey(key);
		if(index !== -1) {
			var keyValuePair = this._hashMap[index];
			keyValuePair.value.push(value);
		}
		else {
			this._hashMap.push(new KeyValuePair(key, value));
		}
	}

    // gets the value of a KeyValuePair by its key
	public get(key : string) : Array<T> {

		if(key === null || key === undefined) throw new Error("Argument Null");

		var index = this.getIndexByKey(key);
		if(index !== -1) {
			var keyValuePair = this._hashMap[index];
			return keyValuePair.value;
		}
		else {
			throw new Error("Key Not Found");
		}
	}

	// removes a KeyValuePair from _hashMap by its key
	public remove(key : string) : void {

		if(key === null || key === undefined) throw new Error("Argument Null");

		var index = this.getIndexByKey(key);
		if(index !== -1) {
			this._hashMap.splice(index, 1);
		}
		else {
			throw new Error("Key Not Found");
		}
	}

	public hasKey(key : string) : boolean {

		if(key === null || key === undefined) throw new Error("Argument Null");

		var index = this.getIndexByKey(key);
		if(index !== -1) {
			return true;
		}
		else {
			return false;
		}
	}
}

export { Lookup };
