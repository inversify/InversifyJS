import {
  ClassElementMetadataKind,
  LegacyTargetImpl as TargetImpl,
} from '@inversifyjs/core';
import { expect } from 'chai';

import { TargetTypeEnum } from '../../constants/literal_types';
import {
  getFunctionName,
  getSymbolDescription,
  listMetadataForTarget,
} from '../../utils/serialization';

describe('Serialization', () => {
  it('Should return a good function name', () => {
    function testFunction() {
      return false;
    }

    expect(getFunctionName(testFunction)).eql('testFunction');
  });

  it('Should return a good function name by using the regex', () => {
    const testFunction: {
      name: null;
    } = { name: null };
    testFunction.toString = () => 'function testFunction';

    expect(getFunctionName(testFunction)).eql('testFunction');
  });

  it('Should not fail when target is not named or tagged', () => {
    const serviceIdentifier: string = 'SomeTypeId';

    const target: TargetImpl = new TargetImpl(
      '',
      {
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        targetName: undefined,
        value: serviceIdentifier,
      },
      TargetTypeEnum.Variable,
    );

    const list: string = listMetadataForTarget(serviceIdentifier, target);
    expect(list).to.eql(` ${serviceIdentifier}`);
  });

  it('Should extract symbol description', () => {
    const symbolWithDescription: symbol = Symbol('description');
    expect(getSymbolDescription(symbolWithDescription)).to.equal('description');

    const symbolWithoutDescription: symbol = Symbol();
    expect(getSymbolDescription(symbolWithoutDescription)).to.equal('');
  });
});
