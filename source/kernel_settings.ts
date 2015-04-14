///<reference path="./inversify.d.ts" />

// KernelSettings
// -----------

// An object passed to the Kenel constructor to set some
// core configuration.

class KernelSettings implements KernelSettingsInterface {
  public cache : boolean;
  constructor();
  constructor(cache : boolean);
  constructor(cache? : any) {
    if(typeof cache !== "undefined") {
      this.cache = cache;
    }
    else {
      // default setting cache = true
      this.cache = true;
    }
  }
}


export = KernelSettings;
