# Inversify with ES5
```js
var inversify = require("inversify");
require("reflect-metadata");

var TYPES = {
    Ninja: "Ninja",
    Katana: "Katana",
    Shuriken: "Shuriken"
};

var Katana = (function () {

    function Katana() {
    }
    
    Katana.prototype.hit = function () {
        return "cut!";
    };
    
    inversify.decorate(inversify.injectable(), Katana);
    
    return Katana;

}());

var Shuriken = (function () {
    
    function Shuriken() {
    }
    
    Shuriken.prototype.throw = function () {
        return "hit!";
    };
    
    inversify.decorate(inversify.injectable(), Shuriken);
    
    return Shuriken;

}());

var Ninja = (function () {

    function Ninja(katana, shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    Ninja.prototype.fight = function () { return this._katana.hit(); }; 
    Ninja.prototype.sneak = function () { return this._shuriken.throw(); };
    
    inversify.decorate(inversify.injectable(), Ninja);
    inversify.decorate(inversify.inject(TYPES.Katana), Ninja, 0);
    inversify.decorate(inversify.inject(TYPES.Shuriken), Ninja, 1);
    
    return Ninja;

}());

// Declare bindings
var container = new inversify.Container();
container.bind(TYPES.Ninja).to(Ninja);
container.bind(TYPES.Katana).to(Katana);
container.bind(TYPES.Shuriken).to(Shuriken);

// Resolve dependencies
var ninja = container.get(TYPES.Ninja);
return ninja;
```

# Inversify with ES6

```js
var inversify = require("inversify");
require("reflect-metadata");

var TYPES = {
    Ninja: "Ninja",
    Katana: "Katana",
    Shuriken: "Shuriken"
};

class Katana {
    hit() {
        return "cut!";
    }
}

inversify.decorate(inversify.injectable(), Katana);

class Shuriken {
    throw() {
        return "hit!";
    }
}

inversify.decorate(inversify.injectable(), Shuriken);

class Ninja {
    constructor(katana, shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
    }
    fight() { return this._katana.hit(); };
    sneak() { return this._shuriken.throw(); };
}

inversify.decorate(inversify.injectable(), Ninja);
inversify.decorate(inversify.inject(TYPES.Katana), Ninja, 0);
inversify.decorate(inversify.inject(TYPES.Shuriken), Ninja, 1);

// Declare bindings
var container = new inversify.Container();
container.bind(TYPES.Ninja).to(Ninja);
container.bind(TYPES.Katana).to(Katana);
container.bind(TYPES.Shuriken).to(Shuriken);

// Resolve dependencies
var ninja = container.get(TYPES.Ninja);
return ninja;
```