import { expect } from 'chai';
import { Container, inject, injectable, optional } from '../../src/inversify';

describe('@optional', () => {

  it('Should allow to flag dependencies as optional', () => {

    @injectable()
    class Katana {
      public name: string;
      public constructor() {
        this.name = 'Katana';
      }
    }

    @injectable()
    class Shuriken {
      public name: string;
      public constructor() {
        this.name = 'Shuriken';
      }
    }

    @injectable()
    class Ninja {
      public name: string;
      public katana: Katana;
      public shuriken: Shuriken;
      public constructor(
        @inject('Katana') katana: Katana,
        @inject('Shuriken') @optional() shuriken: Shuriken
      ) {
        this.name = 'Ninja';
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();

    container.bind<Katana>('Katana').to(Katana);
    container.bind<Ninja>('Ninja').to(Ninja);

    let ninja = container.get<Ninja>('Ninja');
    expect(ninja.name).to.eql('Ninja');
    expect(ninja.katana.name).to.eql('Katana');
    expect(ninja.shuriken).to.eql(undefined);

    container.bind<Shuriken>('Shuriken').to(Shuriken);

    ninja = container.get<Ninja>('Ninja');
    expect(ninja.name).to.eql('Ninja');
    expect(ninja.katana.name).to.eql('Katana');
    expect(ninja.shuriken.name).to.eql('Shuriken');

  });

  it('Should allow to set a default value for dependencies flagged as optional', () => {

    @injectable()
    class Katana {
      public name: string;
      public constructor() {
        this.name = 'Katana';
      }
    }

    @injectable()
    class Shuriken {
      public name: string;
      public constructor() {
        this.name = 'Shuriken';
      }
    }

    @injectable()
    class Ninja {
      public name: string;
      public katana: Katana;
      public shuriken: Shuriken;
      public constructor(
        @inject('Katana') katana: Katana,
        @inject('Shuriken') @optional() shuriken: Shuriken = { name: 'DefaultShuriken' }
      ) {
        this.name = 'Ninja';
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container = new Container();

    container.bind<Katana>('Katana').to(Katana);
    container.bind<Ninja>('Ninja').to(Ninja);

    let ninja = container.get<Ninja>('Ninja');
    expect(ninja.name).to.eql('Ninja');
    expect(ninja.katana.name).to.eql('Katana');
    expect(ninja.shuriken.name).to.eql('DefaultShuriken');

    container.bind<Shuriken>('Shuriken').to(Shuriken);

    ninja = container.get<Ninja>('Ninja');
    expect(ninja.name).to.eql('Ninja');
    expect(ninja.katana.name).to.eql('Katana');
    expect(ninja.shuriken.name).to.eql('Shuriken');

  });

});