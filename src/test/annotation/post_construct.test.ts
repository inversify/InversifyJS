import { expect } from 'chai';

import { postConstruct } from '../..';

describe('@postConstruct', () => {
  it('Should throw when applied multiple times', () => {
    function setup() {
      class Katana {
        @postConstruct()
        public testMethod1() {
          /* ... */
        }

        @postConstruct()
        public testMethod2() {
          /* ... */
        }
      }
      Katana.toString();
    }
    expect(setup).to.throw('');
  });
});
