import { expect } from "chai";
import { SingletonScope } from "../../src/scope/SingletonScope"

describe("singleton scope", () => {
  it("should work the same in a clone when promise fails", async () => {
    const scope = new SingletonScope();
    const rejectingPromise = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error()),1000);
    });
    scope.set(null as any, null as any, rejectingPromise);
    const clonedScope = scope.clone();
    try{
      await clonedScope.resolved;
    }catch(e){
      //
    }

    // tslint:disable: no-unused-expression
    expect(scope.resolved).to.be.undefined
    expect(clonedScope.resolved).to.be.undefined;
  })
})