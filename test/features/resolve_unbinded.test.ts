import { expect } from 'chai';
import { Container, injectable } from '../../src/inversify';

describe('Container.prototype.resolve', () => {
  it('Should be able to resolve a class that has not binded', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    @injectable()
    class Ninja implements Ninja {
      public katana: Katana;
      public constructor(katana: Katana) {
        this.katana = katana;
      }
      public fight() {
        return this.katana.hit();
      }
    }

    const container = new Container();
    container.bind(Katana).toSelf();

    const tryGet = () => container.get(Ninja);
    expect(tryGet).to.throw('No matching bindings found for serviceIdentifier: Ninja');

    const ninja = container.resolve(Ninja);
    expect(ninja.fight()).to.eql('cut!');
  });
});
