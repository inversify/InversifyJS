"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var inversify_1 = require("inversify");
var external_module_test;
(function (external_module_test) {
    var Katana = (function () {
        function Katana() {
        }
        Katana.prototype.hit = function () {
            return "cut!";
        };
        return Katana;
    }());
    var Shuriken = (function () {
        function Shuriken() {
        }
        Shuriken.prototype.throw = function () {
            return "hit!";
        };
        return Shuriken;
    }());
    var Ninja = (function () {
        function Ninja(katana, shuriken) {
            this._katana = katana;
            this._shuriken = shuriken;
        }
        Ninja.prototype.fight = function () { return this._katana.hit(); };
        ;
        Ninja.prototype.sneak = function () { return this._shuriken.throw(); };
        ;
        Ninja = __decorate([
            inversify_1.inject("IKatana", "IShuriken"), 
            __metadata('design:paramtypes', [Object, Object])
        ], Ninja);
        return Ninja;
    }());
    var kernel = new inversify_1.Kernel();
    kernel.bind("INinja").to(Ninja);
    kernel.bind("IKatana").to(Katana);
    kernel.bind("IShuriken").to(Shuriken).inSingletonScope();
    var ninja = kernel.get("INinja");
    console.log(ninja);
    kernel.unbind("INinja");
    kernel.unbindAll();
    var module = function (k) {
        k.bind("INinja").to(Ninja);
        k.bind("IKatana").to(Katana).inTransientScope();
        k.bind("IShuriken").to(Shuriken).inSingletonScope();
    };
    var options = {
        middleware: [],
        modules: [module]
    };
    kernel = new inversify_1.Kernel(options);
    var ninja2 = kernel.get("INinja");
    console.log(ninja2);
    kernel.bind("IKatana").to(Katana);
    kernel.bind("IKatana").toValue(new Katana());
    kernel.bind("IKatana").toConstructor(Katana);
    kernel.bind("IKatana").toFactory(function (context) {
        return function () {
            return kernel.get("IKatana");
        };
    });
    kernel.bind("IKatana").toAutoFactory();
    kernel.bind("IKatana").toProvider(function (context) {
        return function () {
            return new Promise(function (resolve) {
                var katana = kernel.get("IKatana");
                resolve(katana);
            });
        };
    });
    kernel.bind("IKatana").to(Katana).proxy(function (katanaToBeInjected) {
        return katanaToBeInjected;
    });
    var Samurai = (function () {
        function Samurai(katana, shuriken) {
            this.katana = katana;
            this.shuriken = shuriken;
        }
        Samurai = __decorate([
            inversify_1.inject("IWeapon", "IWeapon"),
            __param(0, inversify_1.tagged("canThrow", false)),
            __param(1, inversify_1.tagged("canThrow", true)), 
            __metadata('design:paramtypes', [Object, Object])
        ], Samurai);
        return Samurai;
    }());
    kernel.bind("Samurai").to(Samurai);
    kernel.bind("IWeapon").to(Katana).whenTargetTagged("canThrow", false);
    kernel.bind("IWeapon").to(Shuriken).whenTargetTagged("canThrow", true);
    var throwable = inversify_1.tagged("canThrow", true);
    var notThrowable = inversify_1.tagged("canThrow", false);
    var Samurai2 = (function () {
        function Samurai2(katana, shuriken) {
            this.katana = katana;
            this.shuriken = shuriken;
        }
        Samurai2 = __decorate([
            inversify_1.inject("IWeapon", "IWeapon"),
            __param(0, throwable("canThrow", false)),
            __param(1, notThrowable("canThrow", true)), 
            __metadata('design:paramtypes', [Object, Object])
        ], Samurai2);
        return Samurai2;
    }());
    var Samurai3 = (function () {
        function Samurai3(katana, shuriken) {
            this.katana = katana;
            this.shuriken = shuriken;
        }
        Samurai3 = __decorate([
            inversify_1.inject("IWeapon", "IWeapon"),
            __param(0, inversify_1.named("strong")),
            __param(1, inversify_1.named("weak")), 
            __metadata('design:paramtypes', [Object, Object])
        ], Samurai3);
        return Samurai3;
    }());
    kernel.bind("ISamurai").to(Samurai3);
    kernel.bind("IWeapon").to(Katana).whenTargetNamed("strong");
    kernel.bind("IWeapon").to(Shuriken).whenTargetNamed("weak");
    var Samurai4 = (function () {
        function Samurai4(katana, shuriken) {
            this.katana = katana;
            this.shuriken = shuriken;
        }
        Samurai4 = __decorate([
            inversify_1.inject("IWeapon", "IWeapon"),
            inversify_1.paramNames("katana", "shuriken"), 
            __metadata('design:paramtypes', [Object, Object])
        ], Samurai4);
        return Samurai4;
    }());
    kernel.bind("ISamurai").to(Samurai4);
    kernel.bind("IWeapon").to(Katana).when(function (request) {
        return request.target.name.equals("katana");
    });
    kernel.bind("IWeapon").to(Shuriken).when(function (request) {
        return request.target.name.equals("shuriken");
    });
})(external_module_test || (external_module_test = {}));
