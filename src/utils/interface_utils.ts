import { interfaces } from "../interfaces/interfaces";

export function createSymbolForInterface<T>(
  description?: string | number
): interfaces.TypeAssociatedSymbol<T> {
    return Symbol(description);
}
