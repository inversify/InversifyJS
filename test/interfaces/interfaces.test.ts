import { interfaces } from '../../src/interfaces/interfaces';
import {Container, injectable} from '../../src/inversify';
import {expect} from 'chai';

describe('interfaces', () => {
  @injectable()
  class Foo {
    foo: string = '';
  }

  @injectable()
  class Bar {
    bar: string = '';
  }

  describe('Container', () => {
    let foo: Foo;
    let foos: Foo[];

    beforeEach(() => {
      // tslint:disable-next-line: no-unused-expression
      foo;
      // tslint:disable-next-line: no-unused-expression
      foos;
    });

    describe('no binding map', () => {
      let container: interfaces.Container;

      beforeEach(() => {
        container = new Container();
      });

      describe('bind()', () => {
        it('binds without a type argument', () => {
          container.bind('foo').to(Foo);
          container.bind(Foo).to(Foo);
        });

        it('checks bindings with an explicit type argument', () => {
          container.bind<Foo>('foo').to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.bind<Foo>('foo').to(Bar);
        });

        it('binds a class as a service identifier', () => {
          container.bind(Foo).to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.bind(Foo).to(Bar);
        });
      });

      describe('get()', () => {
        beforeEach(() => {
          container.bind('foo').to(Foo);
          container.bind('bar').to(Bar);
          container.bind(Foo).to(Foo);
          container.bind(Bar).to(Bar);
        });

        it('gets an anonymous binding', () => {
          foo = container.get('foo');
        });

        it('enforces type arguments', () => {
          foo = container.get<Foo>('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foo = container.get<Bar>('bar');
        });

        it('gets a class identifier', () => {
          foo = container.get(Foo);
          // @ts-expect-error :: can't assign Bar to Foo
          foo = container.get(Bar);
        });

        it('gets all', () => {
          foos = container.getAll<Foo>('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foos = container.getAll<Bar>('bar');
        });
      });
    });

    describe('binding map', () => {
      let container: interfaces.Container<{foo: Foo; bar: Bar}>;

      beforeEach(() => {
        container = new Container();
      });

      describe('bind()', () => {
        it('enforces strict bindings', () => {
          container.bind('foo').to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.bind('foo').to(Bar);
          // @ts-expect-error :: unknown service identifier
          container.bind('unknown').to(Foo);
        });
      });

      describe('get()', () => {
        beforeEach(() => {
          container.bind('foo').to(Foo);
          container.bind('bar').to(Bar);
        });

        it('enforces strict bindings', () => {
          foo = container.get('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foo = container.get('bar');
          // @ts-expect-error :: unknown service identifier
          expect(() => container.get('unknown')).to.throw('No matching bindings');
        });

        it('gets all', () => {
          foos = container.getAll('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foos = container.getAll('bar');
        });
      });
    });
  });
});
