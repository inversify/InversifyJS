/// <reference path="inversify.d.ts" />

import { Kernel, Inject } from "inversify";

module inversify_external_module_test {

    interface INinja {
        fight(): string;
        sneak(): string;
    }

    interface IKatana {
        hit(): string;
    }

    interface IShuriken {
        throw();
    }

    class Katana implements IKatana {
        public hit() {
            return "cut!";
        }
    }

    class Shuriken implements IShuriken {
        public throw() {
            return "hit!";
        }
    }

    @Inject("IKatana", "IShuriken")
    class Ninja implements INinja {

        private _katana: IKatana;
        private _shuriken: IShuriken;

        public constructor(katana: IKatana, shuriken: IShuriken) {
            this._katana = katana;
            this._shuriken = shuriken;
        }

        public fight() { return this._katana.hit(); };
        public sneak() { return this._shuriken.throw(); };

    }

    let kernel = new Kernel();
    kernel.bind<INinja>("INinja").to(Ninja);
    kernel.bind<IKatana>("IKatana").to(Katana);
    kernel.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();

    let ninja = kernel.get<INinja>("INinja");
    console.log(ninja);

    // Unbind
    kernel.unbind("INinja");
    kernel.unbindAll();

}
