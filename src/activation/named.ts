///<reference path="../interfaces/interfaces.d.ts" />

import Metadata from "../activation/metadata";
import { tagParameter } from "./decorator_utils";

// Used to add named metadata which is used to resolve name-based contextual bindings.
function Named(name: string) {
  return function(target: any, targetKey: string, index: number) {
    let metadata = new Metadata("named", name);
    return tagParameter(target, targetKey, index, metadata);
  };
}

export default Named;
