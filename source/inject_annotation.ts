///<reference path="./interfaces.d.ts" />

// Inject (Annotation)
// ------------------

// To allow developers using Inversify to mark arguments with the
// type they should resolve to we need to provide a way for them to do
// this so that they can name their arguments as they please
// and inject multiple dependencies of the same type

// This should be used in the following way where "IB" has
// been bound to the kernel to a class that extends IB
// import { Inject } from "inversify";
// @Inject("IKatana", "IShuriken")
// class Warrior {
//     
//     private _katana : IKatana;
//     private _shuriken : IShuriken;
//     
//     constructor(katana : IKatana, shuriken : IShuriken) {
//         this._katana = katana;
//         this._shuriken = shuriken;
//     }
// }
let Inject = function (...typeIdentifiers: string[]) {
  return (constructor : any) => {
      constructor.__INJECT = typeIdentifiers;
      return constructor;
  };
};

export { Inject };
