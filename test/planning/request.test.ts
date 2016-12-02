import { expect } from "chai";
import { Request } from "../../src/planning/request";
import { Context } from "../../src/planning/context";
import { Container } from "../../src/container/container";
import { Target } from "../../src/planning/target";
import { TargetTypeEnum } from "../../src/constants/literal_types";
import { injectable } from "../../src/annotation/injectable";

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

      let request1: Request = new (<any>Request)(
          identifiers.Ninja,
          context,
          null,
          null,
          null
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

      interface KatanaBlade {}

      @injectable()
      class KatanaBlade implements KatanaBlade {}

      interface KatanaHandler {}

      @injectable()
      class KatanaHandler implements KatanaHandler {}

      interface Katana {}

      @injectable()
      class Katana implements Katana {
          public handler: KatanaHandler;
          public blade: KatanaBlade;
          public constructor(handler: KatanaHandler, blade: KatanaBlade) {
              // DO NOTHING
          }
      }

      interface Shuriken {}

      @injectable()
      class Shuriken implements Shuriken {}

      interface Ninja {}

      @injectable()
      class Ninja implements Ninja {
          public katana: Katana;
          public shuriken: Shuriken;
          public constructor(katana: Katana, shuriken: Shuriken) {
              // DO NOTHING
          }
      }

      let container = new Container();
      let context = new Context(container);

      let ninjaRequest: Request = new (<any>Request)(
          identifiers.Ninja,
          context,
          null,
          null,
          null
      );

      ninjaRequest.addChildRequest(
          identifiers.Katana,
          [],
          new Target(TargetTypeEnum.ConstructorArgument, "katana", identifiers.Katana)
      );

      let katanaRequest = ninjaRequest.childRequests[0];

      expect(katanaRequest.serviceIdentifier).eql(identifiers.Katana);
      expect((<any>katanaRequest).parentRequest.serviceIdentifier).eql(identifiers.Ninja);
      expect(katanaRequest.childRequests.length).eql(0);
      expect((<any>katanaRequest).target.name.value()).eql("katana");
      expect((<any>katanaRequest).target.serviceIdentifier).eql(identifiers.Katana);

  });

});
