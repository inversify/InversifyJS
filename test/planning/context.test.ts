import { expect } from "chai";
import { Container } from "../../src/container/container";
import { Context } from "../../src/planning/context";
import { Request } from "../../src/planning/request";
import { Plan } from "../../src/planning/plan";
import { Target } from "../../src/planning/target";
import { TargetTypeEnum } from "../../src/constants/literal_types";

describe("Context", () => {

  it("Should set its own properties correctly", () => {

      let container = new Container();
      let context1 = new Context(container);
      let invalid: any = null;
      let context2: Context = new (Context)(invalid);

      expect(context1.container).not.to.eql(null);
      expect(context2.container).eql(null);
      expect(context1.guid.length).eql(36);
      expect(context2.guid.length).eql(36);
      expect(context1.guid).not.eql(context2.guid);

  });

  it("Should be lickable to a Plan", () => {

      let container = new Container();
      let context = new Context(container);
      let target = new Target(TargetTypeEnum.Variable, "", "Ninja");

      let ninjaRequest = new Request(
          "Ninja",
          context,
          null,
          [],
          target
      );

      let plan = new Plan(context, ninjaRequest);
      context.addPlan(plan);

      expect(context.plan.rootRequest.serviceIdentifier).eql("Ninja");
  });

});
