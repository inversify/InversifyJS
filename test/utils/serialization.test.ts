import { expect } from 'chai';
import { TargetTypeEnum } from '../../src/constants/literal_types';
import { Target } from '../../src/planning/target';
import { getFunctionName, getSymbolDescription, listMetadataForTarget } from '../../src/utils/serialization';

describe('Serialization', () => {

  it('Should return a good function name', () => {

    function testFunction() {
      return false;
    }

    expect(getFunctionName(testFunction)).eql('testFunction');

  });

  it('Should return a good function name by using the regex', () => {

    const testFunction = { name: null };
    testFunction.toString = () =>
      'function testFunction';

    expect(getFunctionName(testFunction)).eql('testFunction');

  });

  it('Should not fail when target is not named or tagged', () => {
    const serviceIdentifier = 'SomeTypeId';
    const target = new Target(TargetTypeEnum.Variable, '', serviceIdentifier);
    const list = listMetadataForTarget(serviceIdentifier, target);
    expect(list).to.eql(` ${serviceIdentifier}`);
  });

  it('Should extract symbol description', () => {
    const symbolWithDescription = Symbol('description');
    expect(getSymbolDescription(symbolWithDescription)).to.equal('description');

    const symbolWithoutDescription = Symbol();
    expect(getSymbolDescription(symbolWithoutDescription)).to.equal('');
  });

});