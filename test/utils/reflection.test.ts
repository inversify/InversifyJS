import { expect } from 'chai';
import sinon from 'sinon';

import {
  Container,
  inject,
  injectable,
  interfaces,
  LazyServiceIdentifier,
} from '../../src/inversify';
import { MetadataReader } from '../../src/planning/metadata_reader';
import { getDependencies } from '../../src/planning/reflection_utils';

describe('Reflection Utilities Unit Tests', () => {
  it('Should unwrap LazyServiceIdentifier in getConstructorArgsAsTarget', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Katana: Symbol.for('Katana'),
      Ninja: Symbol.for('Ninja'),
    };

    @injectable()
    class Ninja implements Ninja {
      private readonly _katana: Katana;

      constructor(
        @inject(new LazyServiceIdentifier(() => TYPES.Katana)) katana: Katana,
      ) {
        this._katana = katana;
      }

      public fight() {
        return this._katana.hit();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(Ninja);
    container.bind<Katana>(TYPES.Katana).to(Katana);

    const unwrapSpy: sinon.SinonSpy<[], interfaces.ServiceIdentifier> =
      sinon.spy(LazyServiceIdentifier.prototype, 'unwrap');

    const dependencies: interfaces.Target[] = getDependencies(
      new MetadataReader(),
      Ninja,
    );

    expect(dependencies.length).to.be.eql(1);
    sinon.assert.calledOnce(unwrapSpy);

    sinon.restore();
  });
});
