import 'reflect-metadata';

import { expect } from 'chai';

import { postConstruct } from '../..';

describe('@postConstruct', () => {
  it('Should throw when applied multiple times', () => {
    function setup() {
      class Katana {
        @postConstruct()
        @postConstruct()
        public testMethod1() {
          /* ... */
        }
      }
      Katana.toString();
    }
    expect(setup).to.throw('');
  });
});
