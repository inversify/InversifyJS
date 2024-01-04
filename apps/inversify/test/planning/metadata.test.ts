import { expect } from 'chai';
import { Metadata } from '../../src/planning/metadata';

describe('Metadata', () => {

  it('Should set its own properties correctly', () => {
    const m = new Metadata('power', 5);
    expect(m.key).to.equals('power');
    expect(m.value).to.equals(5);
  });

});