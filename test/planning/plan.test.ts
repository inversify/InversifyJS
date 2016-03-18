///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import Plan from "../../src/planning/plan";
import Request from "../../src/planning/request";
import Context from "../../src/planning/context";
import Kernel from "../../src/kernel/kernel";

describe("Plan", () => {

  it("Should set its own properties correctly", () => {

      class Something {}

      let kernel = new Kernel();
      let context = new Context(kernel);
      let runtimeId = "Something";

      let request = new Request(
          runtimeId,
          context,
          null,
          null
      );

      let plan = new Plan(context, request);

      expect(plan.parentContext).eql(context);
      expect(plan.rootRequest.service).eql(request.service);
      expect(plan.rootRequest.parentContext).eql(request.parentContext);
      expect(plan.rootRequest.parentRequest).eql(request.parentRequest);
      expect(plan.rootRequest.childRequests).eql(request.childRequests);
      expect(plan.rootRequest.target).eql(request.target);
  });

});
