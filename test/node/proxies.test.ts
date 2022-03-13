import { expect } from 'chai';
import { interfaces } from '../../src/interfaces/interfaces';
import { Container, inject, injectable } from '../../src/inversify';

describe('InversifyJS', () => {

  it('Should support the injection of proxied objects', () => {

    const weaponId = 'Weapon';
    const warriorId = 'Warrior';

    interface Weapon {
      use(): void;
    }

    @injectable()
    class Katana implements Weapon {
      public use() {
        return 'Used Katana!';
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

    const container = new Container();
    container.bind<Warrior>(warriorId).to(Ninja);
    const log: string[] = [];

    container.bind<Weapon>(weaponId).to(Katana).onActivation((context: interfaces.Context, weapon: Weapon) => {
      const handler = {
        apply(target: any, thisArgument: any, argumentsList: any[]) {
          log.push(`Starting: ${new Date().getTime()}`);
          const result = target.apply(thisArgument, argumentsList);
          log.push(`Finished: ${new Date().getTime()}`);
          return result;
        }
      };
      weapon.use = new Proxy(weapon.use, handler);
      return weapon;
    });

    const ninja = container.get<Warrior>(warriorId);
    ninja.weapon.use();

    expect(log.length).eql(2);
    expect(log[0]?.indexOf('Starting: ')).not.to.eql(-1);
    expect(log[1]?.indexOf('Finished: ')).not.to.eql(-1);

  });

});