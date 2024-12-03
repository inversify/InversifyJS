import { Newable } from '@inversifyjs/common';
import { expect } from 'chai';

import { getBaseType } from '../../utils/get_base_type';

describe(getBaseType.name, () => {
  describe('having a type with base type', () => {
    let baseTypeFixture: Newable;
    let typeFixture: Newable;

    before(() => {
      class BaseType {}

      baseTypeFixture = BaseType;
      typeFixture = class extends BaseType {};
    });

    describe('when called', () => {
      let result: unknown;

      before(() => {
        result = getBaseType(typeFixture);
      });

      it('should return base type', () => {
        expect(result).to.eq(baseTypeFixture);
      });
    });
  });

  describe('having a type with no base type', () => {
    let typeFixture: Newable;

    before(() => {
      typeFixture = Object;
    });

    describe('when called', () => {
      let result: unknown;

      before(() => {
        result = getBaseType(typeFixture);
      });

      it('should return undefined', () => {
        expect(result).to.eq(undefined);
      });
    });
  });
});
