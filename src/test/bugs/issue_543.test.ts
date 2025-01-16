import { expect } from 'chai';

import { Container, inject, injectable } from '../../index';

describe('Issue 543', () => {
  it('Should throw correct circular dependency path', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPE = {
      Child: Symbol.for('Child'),
      Child2: Symbol.for('Child2'),
      Circular: Symbol.for('Circular'),
      Irrelevant: Symbol.for('Irrelevant1'),
      Root: Symbol.for('Root'),
    };

    @injectable()
    class Irrelevant {}

    @injectable()
    class Child2 {
      public circ: unknown;
      constructor(@inject(TYPE.Circular) circ: unknown) {
        this.circ = circ;
      }
    }

    @injectable()
    class Child {
      public irrelevant: Irrelevant;
      public child2: Child2;
      constructor(
        @inject(TYPE.Irrelevant) irrelevant: Irrelevant,
        @inject(TYPE.Child2) child2: Child2,
      ) {
        this.irrelevant = irrelevant;
        this.child2 = child2;
      }
    }

    @injectable()
    class Circular {
      public irrelevant: Irrelevant;
      public child: Child;
      constructor(
        @inject(TYPE.Irrelevant) irrelevant: Irrelevant,
        @inject(TYPE.Child) child: Child,
      ) {
        this.irrelevant = irrelevant;
        this.child = child;
      }
    }

    @injectable()
    class Root {
      public irrelevant: Irrelevant;
      public circ: Circular;
      constructor(
        @inject(TYPE.Irrelevant) irrelevant1: Irrelevant,
        @inject(TYPE.Circular) circ: Circular,
      ) {
        this.irrelevant = irrelevant1;
        this.circ = circ;
      }
    }

    const container: Container = new Container();
    container.bind<Root>(TYPE.Root).to(Root);
    container.bind<Irrelevant>(TYPE.Irrelevant).to(Irrelevant);
    container.bind<Circular>(TYPE.Circular).to(Circular);
    container.bind<Child>(TYPE.Child).to(Child);
    container.bind<Child2>(TYPE.Child2).to(Child2);

    function throws() {
      return container.get(TYPE.Root);
    }

    expect(throws).to.throw(
      'Circular dependency found: Symbol(Root) -> Symbol(Circular) -> Symbol(Child) -> Symbol(Child2) -> Symbol(Circular)',
    );
  });
});
