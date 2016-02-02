///<reference path="../typings/main.d.ts" />

import { expect } from "chai";
import { Inject } from "../source/inversify";

describe('Inject Annotation', () => {
   it('should generate metadata for annotated classes', () => {
       
       interface IKatana {
           power : number;
           hit() : boolean;
       }
       
       interface IShuriken {
           power : number;
           throw() : boolean;
       }
       
       @Inject("IKatana", "IShuriken")
       class Warrior {
           
           private _katana : IKatana;
           private _shuriken : IShuriken;
           
           constructor(katana : IKatana, shuriken : IShuriken) {
               this._katana = katana;
               this._shuriken = shuriken;
           }
       }
       
       class WarriorWithoutInjections {
           
           private _katana : IKatana;
           private _shuriken : IShuriken;
           
           constructor(katana : IKatana, shuriken : IShuriken) {
               this._katana = katana;
               this._shuriken = shuriken;
           }
       }
       
       @Inject()
       class WarriorDecoratedWithoutInjections {
           
           private _katana : IKatana;
           private _shuriken : IShuriken;
           
           constructor(katana : IKatana, shuriken : IShuriken) {
               this._katana = katana;
               this._shuriken = shuriken;
           }
       }
       
       var argumentTypes = (<any>Warrior).__INJECT;
       expect(argumentTypes.length).to.equal(2);
       expect(argumentTypes[0]).to.equal("IKatana");
       expect(argumentTypes[1]).to.equal("IShuriken");
       
       var argumentTypes = (<any>WarriorWithoutInjections).__INJECT;
       expect(typeof argumentTypes).to.equal("undefined");
       
       var argumentTypes = (<any>WarriorDecoratedWithoutInjections).__INJECT;
       expect(argumentTypes.length).to.equal(0);
   });
});
