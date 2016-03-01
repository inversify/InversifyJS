///<reference path="../../typings/browser.d.ts" />

import { expect } from "chai";
import { Kernel } from "../../src/kernel/kernel";
import { Context } from "../../src/planning/context";
import { Request } from "../../src/planning/request";
import { Plan } from "../../src/planning/plan";

describe("Context", () => {

  it("Should set its own properties correctly", () => {

      let kernel = new Kernel();
      let context1 = new Context(kernel);
      let context2 = new Context(null);

      expect(context1.kernel).not.to.eql(null);
      expect(context2.kernel).eql(null);
  });

  it("Should be lickable to a Plan", () => {

      let kernel = new Kernel();
      let context = new Context(kernel);

      let ninjaRequest = new Request(
          "INinja",
          context,
          null,
          null
      );

      let plan = new Plan(context, ninjaRequest);
      context.addPlan(plan);

      expect(context.plan.rootRequest.service).eql("INinja");
  });

});
