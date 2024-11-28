import { expect } from 'chai';

import { BindingScopeEnum, Container, injectable } from '../../src/index';

describe('Issue 706', () => {
  it('Should expose BindingScopeEnum as part of the public API', () => {
    @injectable()
    class SomeClass {
      public time: number;
      constructor() {
        this.time = new Date().getTime();
      }
    }

    const container: Container = new Container({
      defaultScope: BindingScopeEnum.Singleton,
    });

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPE = {
      SomeClass: Symbol.for('SomeClass'),
    };

    container.bind<SomeClass>(TYPE.SomeClass).to(SomeClass);

    const instanceOne: SomeClass = container.get<SomeClass>(TYPE.SomeClass);
    const instanceTwo: SomeClass = container.get<SomeClass>(TYPE.SomeClass);

    expect(instanceOne.time).to.eq(instanceTwo.time);
  });
});
