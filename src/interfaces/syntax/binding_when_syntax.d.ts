declare type Constraint = (request: IRequest) => boolean;

interface IBindingWhenSyntax<T> {
    when(constraint: Constraint): void;
}
