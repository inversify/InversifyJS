import { expect } from 'chai';
import { QueryableString } from '../../src/planning/queryable_string';

describe('QueryableString', () => {

  it('Should be able to set its own properties', () => {
    const queryableString = new QueryableString('some_text');
    expect(queryableString.value()).to.eql('some_text');
  });

  it('Should be able to return its value', () => {
    const queryableString = new QueryableString('some_text');
    expect(queryableString.value()).to.eql('some_text');
    expect(queryableString.value() === 'some_other_text').to.eql(false);
  });

  it('Should be able to identify if it"s value starts with certain text', () => {
    const queryableString = new QueryableString('some_text');
    expect(queryableString.startsWith('some')).to.eql(true);
    expect(queryableString.startsWith('s')).to.eql(true);
    expect(queryableString.startsWith('me')).to.eql(false);
    expect(queryableString.startsWith('_text')).to.eql(false);
  });

  it('Should be able to identify if it"s value ends with certain text', () => {
    const queryableString = new QueryableString('some_text');
    expect(queryableString.endsWith('_text')).to.eql(true);
    expect(queryableString.endsWith('ext')).to.eql(true);
    expect(queryableString.endsWith('_tex')).to.eql(false);
    expect(queryableString.endsWith('some')).to.eql(false);
  });

  it('Should be able to identify if it"s value is equals to certain text', () => {
    const queryableString = new QueryableString('some_text');
    expect(queryableString.equals('some_text')).to.eql(true);
    expect(queryableString.contains('some_text ')).to.eql(false);
    expect(queryableString.contains('som_text')).to.eql(false);
  });

});