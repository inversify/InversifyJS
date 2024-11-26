import { expect } from 'chai';

import { decorate } from '../../src/annotation/decorator_utils';
import { injectable } from '../../src/annotation/injectable';
import { targetName } from '../../src/annotation/target_name';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import type { interfaces } from '../../src/inversify';
import { Metadata } from '../../src/planning/metadata';
import * as Stubs from '../utils/stubs';

describe('@targetName', () => {
  it('Should generate metadata if declared parameter names', () => {
    @injectable()
    class Warrior {
      public katana: Stubs.Katana;
      public shuriken: Stubs.Shuriken;

      constructor(
        @targetName('katana') katana: Stubs.Katana,
        @targetName('shuriken') shuriken: Stubs.Shuriken,
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const metadata: interfaces.MetadataMap = Reflect.getMetadata(
      METADATA_KEY.TAGGED,
      Warrior,
    ) as interfaces.MetadataMap;

    expect(metadata['0']).to.be.instanceof(Array);
    expect(metadata['1']).to.be.instanceof(Array);
    expect(metadata['2']).to.eql(undefined);

    const zeroIndexedMetadata: interfaces.Metadata[] = metadata[
      '0'
    ] as interfaces.Metadata[];
    const oneIndexedMetadata: interfaces.Metadata[] = metadata[
      '1'
    ] as interfaces.Metadata[];

    const expectedFirstMetadata: Metadata[] = [
      new Metadata(METADATA_KEY.NAME_TAG, 'katana'),
    ];

    const expectedSecondMetadata: Metadata[] = [
      new Metadata(METADATA_KEY.NAME_TAG, 'shuriken'),
    ];

    expect(zeroIndexedMetadata).to.deep.equal(expectedFirstMetadata);
    expect(oneIndexedMetadata).to.deep.equal(expectedSecondMetadata);
  });

  it('Should be usable in VanillaJS applications', () => {
    type Katana = unknown;
    type Shuriken = unknown;

    const vanillaJsWarrior: (primary: unknown, secondary: unknown) => void =
      function (_primary: Katana, _secondary: Shuriken) {};

    decorate(targetName('primary'), vanillaJsWarrior, 0);
    decorate(targetName('secondary'), vanillaJsWarrior, 1);

    const metadata: interfaces.MetadataMap = Reflect.getMetadata(
      METADATA_KEY.TAGGED,
      vanillaJsWarrior,
    ) as interfaces.MetadataMap;

    expect(metadata['0']).to.be.instanceof(Array);
    expect(metadata['1']).to.be.instanceof(Array);
    expect(metadata['2']).to.eql(undefined);

    const zeroIndexedMetadata: interfaces.Metadata[] = metadata[
      '0'
    ] as interfaces.Metadata[];
    const oneIndexedMetadata: interfaces.Metadata[] = metadata[
      '1'
    ] as interfaces.Metadata[];

    const expectedFirstMetadata: Metadata[] = [
      new Metadata(METADATA_KEY.NAME_TAG, 'primary'),
    ];

    const expectedSecondMetadata: Metadata[] = [
      new Metadata(METADATA_KEY.NAME_TAG, 'secondary'),
    ];

    expect(zeroIndexedMetadata).to.deep.equal(expectedFirstMetadata);
    expect(oneIndexedMetadata).to.deep.equal(expectedSecondMetadata);
  });
});
