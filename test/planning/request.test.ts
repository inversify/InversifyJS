///<reference path="../../src/interfaces/interfaces.d.ts" />

import { expect } from "chai";
import Request from "../../src/planning/request";
import Context from "../../src/planning/context";
import Kernel from "../../src/kernel/kernel";
import Target from "../../src/planning/target";

describe("Request", () => {

  let identifiers = {
      IKatana: "IKatana",
      IKatanaBlade: "IKatanaBlade",
      IKatanaHandler: "IKatanaHandler",
      INinja: "INinja",
      IShuriken: "IShuriken",
  };

  it("Should set its own properties correctly", () => {

      let kernel = new Kernel();
      let context = new Context(kernel);

      let request1 = new Request(
          identifiers.INinja,
          context,
          null,
          null,
          null
      );

      let request2 = new Request(
          identifiers.INinja,
          context,
          null,
          [],
          null
      );

      expect(request1.service).eql(identifiers.INinja);
      expect(Array.isArray(request1.bindings)).eql(true);
      expect(Array.isArray(request2.bindings)).eql(true);

  });

  it("Should be able to add a child request", () => {

      interface IKatanaBlade {}
      class KatanaBlade implements IKatanaBlade {}

      interface IKatanaHandler {}
      class KatanaHandler implements IKatanaHandler {}

      interface IKatana {}
      class Katana implements IKatana {
          public handler: IKatanaHandler;
          public blade: IKatanaBlade;
          public constructor(handler: IKatanaHandler, blade: IKatanaBlade) {
              // DO NOTHING
          }
      }

      interface IShuriken {}
      class Shuriken implements IShuriken {}

      interface INinja {}
      class Ninja implements INinja {
          public katana: IKatana;
          public shuriken: IShuriken;
          public constructor(katana: IKatana, shuriken: IShuriken) {
              // DO NOTHING
          }
      }

      let kernel = new Kernel();
      let context = new Context(kernel);

      let ninjaRequest = new Request(
          identifiers.INinja,
          context,
          null,
          null,
          null
      );

      ninjaRequest.addChildRequest(
          identifiers.IKatana,
          null,
          new Target("katana", identifiers.IKatana));

      let katanaRequest = ninjaRequest.childRequests[0];

      expect(katanaRequest.service).eql(identifiers.IKatana);
      expect(katanaRequest.parentRequest.service).eql(identifiers.INinja);
      expect(katanaRequest.childRequests.length).eql(0);
      expect(katanaRequest.target.name.value()).eql("katana");
      expect(katanaRequest.target.service).eql(identifiers.IKatana);
  });

});
