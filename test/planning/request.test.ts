import { expect } from "chai";
import { Request } from "../../src/planning/request";
import { Context } from "../../src/planning/context";
import { Container } from "../../src/container/container";
import { Target } from "../../src/planning/target";
import { TargetTypeEnum } from "../../src/constants/literal_types";
import { interfaces } from "../../src/interfaces/interfaces";

describe("Request", () => {

  let identifiers = {
      Katana: "Katana",
      KatanaBlade: "KatanaBlade",
      KatanaHandler: "KatanaHandler",
      Ninja: "Ninja",
      Shuriken: "Shuriken",
  };

  it("Should set its own properties correctly", () => {

      let container = new Container();
      let context = new Context(container);

      let request1: Request = new Request(
          identifiers.Ninja,
          context,
          null,
          [],
          new Target(TargetTypeEnum.Variable, "", identifiers.Ninja)
      );

      let request2 = new Request(
          identifiers.Ninja,
          context,
          null,
          [],
          new Target(TargetTypeEnum.Variable, "", identifiers.Ninja)
      );

      expect(request1.serviceIdentifier).eql(identifiers.Ninja);
      expect(Array.isArray(request1.bindings)).eql(true);
      expect(Array.isArray(request2.bindings)).eql(true);
      expect(request1.guid.length).eql(36);
      expect(request2.guid.length).eql(36);
      expect(request1.guid).not.eql(request2.guid);

  });

  it("Should be able to add a child request", () => {

      let container = new Container();
      let context = new Context(container);

      let ninjaRequest: Request = new Request(
          identifiers.Ninja,
          context,
          null,
          [],
          new Target(TargetTypeEnum.Variable, "Ninja", identifiers.Ninja)
      );

      ninjaRequest.addChildRequest(
          identifiers.Katana,
          [],
          new Target(TargetTypeEnum.ConstructorArgument, "Katana", identifiers.Katana)
      );

      let katanaRequest = ninjaRequest.childRequests[0];

      expect(katanaRequest.serviceIdentifier).eql(identifiers.Katana);
      expect(katanaRequest.target.name.value()).eql("Katana");
      expect(katanaRequest.childRequests.length).eql(0);

      let katanaParentRequest: interfaces.Request = katanaRequest.parentRequest as any;
      expect(katanaParentRequest.serviceIdentifier).eql(identifiers.Ninja);
      expect(katanaParentRequest.target.name.value()).eql("Ninja");
      expect(katanaParentRequest.target.serviceIdentifier).eql(identifiers.Ninja);

  });

});
