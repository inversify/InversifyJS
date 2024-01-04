import { expect } from 'chai';
import { decorate } from '../../src/annotation/decorator_utils';
import { injectable } from '../../src/annotation/injectable';
import { targetName } from '../../src/annotation/target_name';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import * as Stubs from '../utils/stubs';

describe('@targetName', () => {

  it('Should generate metadata if declared parameter names', () => {

    @injectable()
    class Warrior {

      public katana: Stubs.Katana;
      public shuriken: Stubs.Shuriken;

      public constructor(
        @targetName('katana') katana: Stubs.Katana,
        @targetName('shuriken') shuriken: Stubs.Shuriken
      ) {

        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const metadata = Reflect.getMetadata(METADATA_KEY.TAGGED, Warrior);
    expect(metadata['0']).to.be.instanceof(Array);
    expect(metadata['1']).to.be.instanceof(Array);
    expect(metadata['2']).to.eql(undefined);

    expect(metadata['0'][0].key).to.be.eql(METADATA_KEY.NAME_TAG);
    expect(metadata['0'][0].value).to.be.eql('katana');
    expect(metadata['1'][0].key).to.be.eql(METADATA_KEY.NAME_TAG);
    expect(metadata['1'][0].value).to.be.eql('shuriken');

  });

  it('Should be usable in VanillaJS applications', () => {

    interface Katana { }
    interface Shuriken { }

    const VanillaJSWarrior = function (primary: Katana, secondary: Shuriken) {
      // ...
    };

    decorate(targetName('primary'), VanillaJSWarrior, 0);
    decorate(targetName('secondary'), VanillaJSWarrior, 1);

    const metadata = Reflect.getMetadata(METADATA_KEY.TAGGED, VanillaJSWarrior);
    expect(metadata['0']).to.be.instanceof(Array);
    expect(metadata['1']).to.be.instanceof(Array);
    expect(metadata['2']).to.eql(undefined);

    expect(metadata['0'][0].key).to.be.eql(METADATA_KEY.NAME_TAG);
    expect(metadata['0'][0].value).to.be.eql('primary');
    expect(metadata['1'][0].key).to.be.eql(METADATA_KEY.NAME_TAG);
    expect(metadata['1'][0].value).to.be.eql('secondary');

  });

});