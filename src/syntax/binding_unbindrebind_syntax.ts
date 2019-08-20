import { interfaces } from "../interfaces/interfaces";
export class BindingUnbindRebindSyntax<T> implements interfaces.BindingUnbindRebindSyntax<T> {
    private _binding: interfaces.Binding<T>;
    private _unbind: () => void;
    private _bind: <T2>(serviceIdentifier: interfaces.ServiceIdentifier<T2>) => interfaces.BindingToSyntax<T2>;
    constructor(
        binding: interfaces.Binding<T>,
        unbind: () => void,
        bind: <T2>(serviceIdentifier: interfaces.ServiceIdentifier<T2>) => interfaces.BindingToSyntax<T2>,
        ) {
        this._binding = binding;
        this._unbind = unbind;
        this._bind = bind;
    }
    public unbind() {
        this._unbind();
    }
    public rebind<T2 = T>() {
        const serviceIdentifier = this._binding.serviceIdentifier;
        this.unbind();
        return this._bind<T2>(serviceIdentifier as any);
    }
}
