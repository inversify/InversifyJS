/// <reference path="inversify.d.ts" />

import { Kernel, inject, IKernel, IKernelOptions, INewable, IKernelModule, IFactory, IProvider } from "inversify";

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

    @inject("IKatana", "IShuriken")
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
    let module: IKernelModule = (kernel: IKernel) => {
        kernel.bind<INinja>("INinja").to(Ninja);
        kernel.bind<IKatana>("IKatana").to(Katana);
        kernel.bind<IShuriken>("IShuriken").to(Shuriken).inSingletonScope();
    };

    let options: IKernelOptions = {
        middleware: [],
        modules: [module]
    };

    let kernel2 = new Kernel(options);
    let ninja2 = kernel2.get<INinja>("INinja");
    console.log(ninja2);

    // binding types
    kernel2.bind<IKatana>("IKatana").to(Katana);
    kernel2.bind<IKatana>("IKatana").toValue(new Katana());

    kernel2.bind<INewable<IKatana>>("IKatana").toConstructor<IKatana>(Katana);

    kernel2.bind<IFactory<IKatana>>("IKatana").toFactory<IKatana>((context) => {
        return () => {
            return kernel2.get<IKatana>("IKatana");
        };
    });

    kernel2.bind<IProvider<IKatana>>("IKatana").toProvider<IKatana>((context) => {
        return () => {
            return new Promise<IKatana>((resolve) => {
                let katana = kernel2.get<IKatana>("IKatana");
                resolve(katana);
            });
        };
    });

}
