import { expect } from "chai";
import { injectable, inject, LazyServiceIdentifer, Container } from '../../src/inversify';
import { getDependencies } from '../../src/planning/reflection_utils';
import { MetadataReader } from "../../src/planning/metadata_reader";
import sinon from "sinon";

describe('Reflection Utilities Unit Tests', () => {

    it('Should unwrap LazyServiceIdentifier in getConstructorArgsAsTarget', () => {

        interface Ninja {
            fight(): string;
        }

        interface Katana {
            hit(): string;
        }

        @injectable()
        class Katana implements Katana {
            public hit() {
                return "cut!";
            }
        }

        const TYPES = {
            Katana: Symbol.for("Katana"),
            Ninja: Symbol.for("Ninja"),
        };

        @injectable()
        class Ninja implements Ninja {

        private _katana: Katana;

        public constructor(
            @inject(new LazyServiceIdentifer(() => TYPES.Katana)) katana: Katana,
        ) {
            this._katana = katana;
        }

        public fight() { return this._katana.hit(); }

        }

        const container = new Container();
        container.bind<Ninja>(TYPES.Ninja).to(Ninja);
        container.bind<Katana>(TYPES.Katana).to(Katana);

        const unwrapSpy = sinon.spy(LazyServiceIdentifer.prototype, 'unwrap');

        const dependencies = getDependencies(new MetadataReader(), Ninja);

        expect(dependencies.length).to.be.eql(1);
        sinon.assert.calledOnce(unwrapSpy);

        sinon.restore();
    });
});
