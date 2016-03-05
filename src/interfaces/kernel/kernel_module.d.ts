///<reference path="../interfaces.d.ts" />

interface IKernelModule extends Function {
    (kernel: IKernel): void;
}
