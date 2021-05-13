import { expect } from "chai";
import { normalizeTags } from "../../src/utils/tags"

describe('tags', () => {
  it('Should normalize spread tag', () => {
    expect(normalizeTags(['throwable', false])).to.deep.equal([['throwable', false]])
  })

  it('Should normalize set of tags with a single tag', () => {
    expect(normalizeTags([[['throwable', false]]])).to.deep.equal([['throwable', false]])
  })

  it('Should normalize set of tags with multiple tags', () => {
    expect(normalizeTags([[['throwable', false], ['spikes', 3]]])).to.deep.equal([['throwable', false], ['spikes', 3]])
  })
})