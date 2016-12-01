import { expect } from "chai";
import { Plan } from "../../src/planning/plan";
import { Request } from "../../src/planning/request";
import { Context } from "../../src/planning/context";
import { Container } from "../../src/container/container";

describe("Plan", () => {

  it("Should set its own properties correctly", () => {

      let container = new Container();
      let context = new Context(container);
      let runtimeId = "Something";

      let request: Request = new (<any>Request)(
          runtimeId,
          context,
          null,
          null
      );

      let plan = new Plan(context, request);

      expect(plan.parentContext).eql(context);
      expect(plan.rootRequest.serviceIdentifier).eql(request.serviceIdentifier);
      expect(plan.rootRequest.parentContext).eql(request.parentContext);
      expect(plan.rootRequest.parentRequest).eql(request.parentRequest);
      expect(plan.rootRequest.childRequests).eql(request.childRequests);
      expect(plan.rootRequest.target).eql(request.target);
  });

});
