import { expect } from 'chai';
import * as ERROR_MSGS from '../../src/constants/error_msgs';
import { Container, inject, injectable } from '../../src/inversify';

describe('Issue 543', () => {

  it('Should throw correct circular dependency path', () => {

    const TYPE = {
      Child: Symbol.for('Child'),
      Child2: Symbol.for('Child2'),
      Circular: Symbol.for('Circular'),
      Irrelevant: Symbol.for('Irrelevant1'),
      Root: Symbol.for('Root')
    };

    interface IIrrelevant { }
    interface ICircular { }
    interface IChild { }
    interface IChild2 { }

    @injectable()
    class Irrelevant implements IIrrelevant { }

    @injectable()
    class Child2 implements IChild2 {
      public circ: ICircular;
      public constructor(
        @inject(TYPE.Circular) circ: ICircular
      ) {
        this.circ = circ;
      }
    }

    @injectable()
    class Child implements IChild {
      public irrelevant: IIrrelevant;
      public child2: IChild2;
      public constructor(
        @inject(TYPE.Irrelevant) irrelevant: IIrrelevant,
        @inject(TYPE.Child2) child2: IChild2
      ) {
        this.irrelevant = irrelevant;
        this.child2 = child2;
      }
    }

    @injectable()
    class Circular implements Circular {
      public irrelevant: IIrrelevant;
      public child: IChild;
      public constructor(
        @inject(TYPE.Irrelevant) irrelevant: IIrrelevant,
        @inject(TYPE.Child) child: IChild
      ) {
        this.irrelevant = irrelevant;
        this.child = child;
      }
    }

    @injectable()
    class Root {
      public irrelevant: IIrrelevant;
      public circ: ICircular;
      public constructor(
        @inject(TYPE.Irrelevant) irrelevant1: IIrrelevant,
        @inject(TYPE.Circular) circ: ICircular
      ) {
        this.irrelevant = irrelevant1;
        this.circ = circ;
      }
    }

    const container = new Container();
    container.bind<Root>(TYPE.Root).to(Root);
    container.bind<Irrelevant>(TYPE.Irrelevant).to(Irrelevant);
    container.bind<Circular>(TYPE.Circular).to(Circular);
    container.bind<Child>(TYPE.Child).to(Child);
    container.bind<Child2>(TYPE.Child2).to(Child2);

    function throws() {
      return container.get(TYPE.Root);
    }

    expect(throws).to.throw(
      `${ERROR_MSGS.CIRCULAR_DEPENDENCY} Symbol(Root) --> Symbol(Circular) --> Symbol(Child) --> Symbol(Child2) --> Symbol(Circular)`
    );

  });

});