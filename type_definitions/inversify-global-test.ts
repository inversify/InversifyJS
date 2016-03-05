/// <reference path="inversify-global.d.ts" />

module inversify_global_test {

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

    let Inject = inversify.Inject;

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

    let Kernel = inversify.Kernel;

    let kernel1 = new Kernel();
    kernel1.bind<INinja>("INinja").to(Ninja);
    kernel1.bind<IKatana>("IKatana").to(Katana);
    kernel1.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();

    let ninja = kernel1.get<INinja>("INinja");
    console.log(ninja);

    // Unbind
    kernel1.unbind("INinja");
    kernel1.unbindAll();

    // Kernel modules
    let module: inversify.IKernelModule = (kernel: inversify.IKernel) => {
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.bind<IKatana>("IKatana").to(Katana);
        kernel.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();
    };

    let options: inversify.IKernelOptions = {
        middleware: [],
        modules: [module]
    };

    let kernel2 = new Kernel(options);
    let ninja2 = kernel2.get<INinja>("INinja");
    console.log(ninja2);

}
