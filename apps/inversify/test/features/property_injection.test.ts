
import { expect } from "chai";
import {
  Container, inject, injectable,
  multiInject, named, optional,
  tagged, unmanaged
} from "../../src/inversify";

describe("Property Injection", () => {

  it("Should be able to inject a property", () => {

    const TYPES = {
      Warrior: "Warrior",
      Weapon: "Weapon"
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Katana";
      }
    }

    interface Warrior {
      name: string;
      weapon: Weapon;
    }

    @injectable()
    class Samurai implements Warrior {
      public name: string;
      @inject(TYPES.Weapon)
      public weapon!: Weapon;
      public constructor() {
        this.name = "Samurai";
      }
    }

    const container = new Container();
    container.bind<Warrior>(TYPES.Warrior).to(Samurai);
    container.bind<Weapon>(TYPES.Weapon).to(Katana);

    const warrior = container.get<Warrior>(TYPES.Warrior);
    expect(warrior.name).to.eql("Samurai");
    expect(warrior.weapon).not.to.eql(undefined);
    expect(warrior.weapon.name).to.eql("Katana");

  });

  it("Should be able to inject a property combined with constructor injection", () => {

    const TYPES = {
      Warrior: "Warrior",
      Weapon: "Weapon"
    };

    const TAGS = {
      Primary: "Primary",
      Secondary: "Secondary"
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Katana";
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Shuriken";
      }
    }

    interface Warrior {
      name: string;
      primaryWeapon: Weapon;
      secondaryWeapon: Weapon;
    }

    @injectable()
    class Samurai implements Warrior {

      public name: string;
      public primaryWeapon: Weapon;

      @inject(TYPES.Weapon)
      @named(TAGS.Secondary)
      public secondaryWeapon!: Weapon;

      public constructor(
        @inject(TYPES.Weapon) @named(TAGS.Primary) weapon: Weapon
      ) {
        this.name = "Samurai";
        this.primaryWeapon = weapon;
      }
    }

    const container = new Container();
    container.bind<Warrior>(TYPES.Warrior).to(Samurai);
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetNamed(TAGS.Primary);
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAGS.Secondary);

    const warrior = container.get<Warrior>(TYPES.Warrior);
    expect(warrior.name).to.eql("Samurai");
    expect(warrior.primaryWeapon).not.to.eql(undefined);
    expect(warrior.primaryWeapon.name).to.eql("Katana");
    expect(warrior.secondaryWeapon).not.to.eql(undefined);
    expect(warrior.secondaryWeapon.name).to.eql("Shuriken");

  });

  it("Should be able to inject a named property", () => {

    const TYPES = {
      Warrior: "Warrior",
      Weapon: "Weapon"
    };

    const TAGS = {
      Primary: "Primary",
      Secondary: "Secondary"
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Katana";
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Shuriken";
      }
    }

    interface Warrior {
      name: string;
      primaryWeapon: Weapon;
      secondaryWeapon: Weapon;
    }

    @injectable()
    class Samurai implements Warrior {

      public name: string;

      @inject(TYPES.Weapon)
      @named(TAGS.Primary)
      public primaryWeapon!: Weapon;

      @inject(TYPES.Weapon)
      @named(TAGS.Secondary)
      public secondaryWeapon!: Weapon;

      public constructor() {
        this.name = "Samurai";
      }
    }

    const container = new Container();
    container.bind<Warrior>(TYPES.Warrior).to(Samurai);
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetNamed(TAGS.Primary);
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAGS.Secondary);

    const warrior = container.get<Warrior>(TYPES.Warrior);
    expect(warrior.name).to.eql("Samurai");
    expect(warrior.primaryWeapon).not.to.eql(undefined);
    expect(warrior.primaryWeapon.name).to.eql("Katana");
    expect(warrior.secondaryWeapon).not.to.eql(undefined);
    expect(warrior.secondaryWeapon.name).to.eql("Shuriken");

  });

  it("Should be able to inject a tagged property", () => {

    const TYPES = {
      Warrior: "Warrior",
      Weapon: "Weapon"
    };

    const TAGS = {
      Primary: "Primary",
      Priority: "Priority",
      Secondary: "Secondary"
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Katana";
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Shuriken";
      }
    }

    interface Warrior {
      name: string;
      primaryWeapon: Weapon;
      secondaryWeapon: Weapon;
    }

    @injectable()
    class Samurai implements Warrior {

      public name: string;

      @inject(TYPES.Weapon)
      @tagged(TAGS.Priority, TAGS.Primary)
      public primaryWeapon!: Weapon;

      @inject(TYPES.Weapon)
      @tagged(TAGS.Priority, TAGS.Secondary)
      public secondaryWeapon!: Weapon;

      public constructor() {
        this.name = "Samurai";
      }
    }

    const container = new Container();
    container.bind<Warrior>(TYPES.Warrior).to(Samurai);
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetTagged(TAGS.Priority, TAGS.Primary);
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetTagged(TAGS.Priority, TAGS.Secondary);

    const warrior = container.get<Warrior>(TYPES.Warrior);
    expect(warrior.name).to.eql("Samurai");
    expect(warrior.primaryWeapon).not.to.eql(undefined);
    expect(warrior.primaryWeapon.name).to.eql("Katana");
    expect(warrior.secondaryWeapon).not.to.eql(undefined);
    expect(warrior.secondaryWeapon.name).to.eql("Shuriken");

  });

  it("Should be able to multi-inject a property", () => {

    const TYPES = {
      Warrior: "Warrior",
      Weapon: "Weapon"
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Katana";
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Shuriken";
      }
    }

    interface Warrior {
      name: string;
      weapons: Weapon[];
    }

    @injectable()
    class Samurai implements Warrior {

      public name: string;

      @multiInject(TYPES.Weapon)
      public weapons!: Weapon[];

      public constructor() {
        this.name = "Samurai";
      }
    }

    const container = new Container();
    container.bind<Warrior>(TYPES.Warrior).to(Samurai);
    container.bind<Weapon>(TYPES.Weapon).to(Katana);
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken);

    const warrior = container.get<Warrior>(TYPES.Warrior);
    expect(warrior.name).to.eql("Samurai");
    expect(warrior.weapons[0]).not.to.eql(undefined);
    expect(warrior.weapons[0]?.name).to.eql("Katana");
    expect(warrior.weapons[1]).not.to.eql(undefined);
    expect(warrior.weapons[1]?.name).to.eql("Shuriken");

  });

  it("Should be able to inject a property in a base class", () => {

    const TYPES = {
      Warrior: "Warrior",
      Weapon: "Weapon"
    };

    const TAGS = {
      Primary: "Primary",
      Priority: "Priority",
      Secondary: "Secondary"
    };

    interface Weapon {
      name: string;
    }

    @injectable()
    class Katana implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Katana";
      }
    }

    @injectable()
    class Shuriken implements Weapon {
      public name: string;
      public constructor() {
        this.name = "Shuriken";
      }
    }

    interface Warrior {
      name: string;
      primaryWeapon: Weapon;
    }

    @injectable()
    class BaseWarrior implements Warrior {

      public name: string;

      @inject(TYPES.Weapon)
      @tagged(TAGS.Priority, TAGS.Primary)
      public primaryWeapon!: Weapon;

      public constructor(@unmanaged() name: string) {
        this.name = name;
      }
    }

    @injectable()
    class Samurai extends BaseWarrior {

      @inject(TYPES.Weapon)
      @tagged(TAGS.Priority, TAGS.Secondary)
      public secondaryWeapon!: Weapon;

      public constructor() {
        super("Samurai");
      }
    }

    const container = new Container();
    container.bind<Warrior>(TYPES.Warrior).to(Samurai);
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetTagged(TAGS.Priority, TAGS.Primary);
    container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetTagged(TAGS.Priority, TAGS.Secondary);

    const samurai = container.get<Samurai>(TYPES.Warrior);
    expect(samurai.name).to.eql("Samurai");
    expect(samurai.secondaryWeapon).not.to.eql(undefined);
    expect(samurai.secondaryWeapon.name).to.eql("Shuriken");
    expect(samurai.primaryWeapon).not.to.eql(undefined);
    expect(samurai.primaryWeapon.name).to.eql("Katana");

  });

  it("Should be able to flag a property injection as optional", () => {

    const TYPES = {
      Route: "Route",
      Router: "Router"
    };

    interface Route {
      name: string;
    }

    @injectable()
    class Router {

      @inject(TYPES.Route) @optional()
      private route!: Route;

      public getRoute(): Route {
        return this.route;
      }

    }

    const container = new Container();

    container.bind<Router>(TYPES.Router).to(Router);

    const router1 = container.get<Router>(TYPES.Router);
    expect(router1.getRoute()).to.eql(undefined);

    container.bind<Route>(TYPES.Route).toConstantValue({ name: "route1" });

    const router2 = container.get<Router>(TYPES.Router);
    expect(router2.getRoute().name).to.eql("route1");

  });

});