import { expect } from 'chai';

import * as ERROR_MSGS from '../../constants/error_msgs';

describe('ERROR_MSGS', () => {
  it('Should be able to customize POST_CONSTRUCT_ERROR', () => {
    const error: string = ERROR_MSGS.POST_CONSTRUCT_ERROR('a', 'b');
    expect(error).eql('@postConstruct error in class a: b');
  });

  it('Should properly stringify symbol in LAZY_IN_SYNC', () => {
    const error: string = ERROR_MSGS.LAZY_IN_SYNC(Symbol('a'));
    expect(error).eql(
      `You are attempting to construct Symbol(a) in a synchronous way but it has asynchronous dependencies.`,
    );
  });

  it('Should properly stringify class in LAZY_IN_SYNC', () => {
    const error: string = ERROR_MSGS.LAZY_IN_SYNC(class B {});
    expect(error).eql(
      `You are attempting to construct [function/class B] in a synchronous way but it has asynchronous dependencies.`,
    );
  });

  it('Should properly stringify string in LAZY_IN_SYNC', () => {
    const error: string = ERROR_MSGS.LAZY_IN_SYNC('c');
    expect(error).eql(
      `You are attempting to construct 'c' in a synchronous way but it has asynchronous dependencies.`,
    );
  });
});
