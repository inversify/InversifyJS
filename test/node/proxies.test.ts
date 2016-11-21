import { expect } from "chai";
import { interfaces } from "../../src/interfaces/interfaces";
import { Container, injectable, inject } from "../../src/inversify";
import * as Proxy from "harmony-proxy";

describe("InversifyJS", () => {

    it("Should support the injection of proxied objects", () => {

        let weaponId = "Weapon";
        let warriorId = "Warrior";

        interface Weapon {
            use: () => void;
        }

        @injectable()
        class Katana implements Weapon {
            public use() {
                return "Used Katana!";
            }
        }

        interface Warrior {
            weapon: Weapon;
        }

        @injectable()
        class Ninja implements Warrior {
            public weapon: Weapon;
            public constructor(@inject(weaponId) weapon: Weapon) {
                this.weapon = weapon;
            }
        }

        let container = new Container();
        container.bind<Warrior>(warriorId).to(Ninja);
        let log: string[] = [];

        container.bind<Weapon>(weaponId).to(Katana).onActivation((context: interfaces.Context, katana: Katana) => {
            let handler = {
                apply: function(target: any, thisArgument: any, argumentsList: any[]) {
                    log.push(`Starting: ${new Date().getTime()}`);
                    let result = target.apply(thisArgument, argumentsList);
                    log.push(`Finished: ${new Date().getTime()}`);
                    return result;
                }
            };
            katana.use = new Proxy(katana.use, handler);
            return katana;
        });

        let ninja = container.get<Warrior>(warriorId);
        ninja.weapon.use();

        expect(log.length).eql(2);
        expect(log[0].indexOf(`Starting: `)).not.to.eql(-1);
        expect(log[1].indexOf(`Finished: `)).not.to.eql(-1);

    });

});
