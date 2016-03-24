/// <reference path="../interfaces.d.ts" />

interface Symbol {
    /** Returns a string representation of an object. */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Object;
}

interface SymbolConstructor {
    (description?: string|number): Symbol;
}

declare var Symbol: SymbolConstructor;
