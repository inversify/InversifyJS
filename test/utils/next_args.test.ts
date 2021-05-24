import { expect } from "chai";
import * as sinon from "sinon";
import { interfaces } from "../../src/inversify";
import { NextArgs } from "../../src/utils/next_args";

describe('NextArgs', () => {
  function nextArgsTest(
    tags: interfaces.Tag[],
    middleware: interfaces.Middleware,
    expectedTags: interfaces.Tag[]) {
    const nextArgs = new NextArgs({ avoidConstraints: true, isMultiInject: true, serviceIdentifier: "sid", tags })
    const planAndResolveFake = sinon.fake()
    middleware(planAndResolveFake)(nextArgs);
    expect(planAndResolveFake.callCount).eq(1)
    const planAndResolveArgs: interfaces.NextArgs<unknown> = planAndResolveFake.getCall(0).firstArg
    const resolvedTags = NextArgs.getTags(planAndResolveArgs);
    expect(resolvedTags.length).to.equal(expectedTags.length);
    resolvedTags.forEach((tag, i) => {
      const expectedTag = expectedTags[i];
      expect(tag[0]).to.equal(expectedTag[0]);
      expect(tag[1]).to.equal(expectedTag[1]);
    })
  }

  describe("old middlware", () => {
    describe("same object", () => {
      describe("no initial tag", () => {
        it("should work when no tags and no change", () => {
          nextArgsTest([], (next => nextArgs => {
            return next(nextArgs);
          }), []);
        })
        it("should work when no tags and adds with key/value", () => {
          nextArgsTest([], (next => nextArgs => {
            nextArgs.key = "key";
            nextArgs.value = "value";
            return next(nextArgs);
          }), [["key", "value"]]);
        });
      })
      describe("single tag", () => {
        it("should work when do nothing", () => {
          nextArgsTest([["key", "value"]], (next => nextArgs => {
            return next(nextArgs);
          }), [["key", "value"]]);
        });
        it("Should work when change key", () => {
          nextArgsTest([["key", "value"]], (next => nextArgs => {
            nextArgs.key = "key2";
            return next(nextArgs);
          }), [["key2", "value"]]);
        })
        it("Should work when change value", () => {
          nextArgsTest([["key", "value"]], (next => nextArgs => {
            nextArgs.value = "value2";
            return next(nextArgs);
          }), [["key", "value2"]]);
        })
      });
      describe("multi tag", () => {
        it("should apply key value change", () => {
          nextArgsTest([["key", "value"], ["key2", "value2"]], (next => nextArgs => {
            nextArgs.key = "new key";
            nextArgs.value = "new value";
            return next(nextArgs);
          }), [["new key", "new value"], ["key2", "value2"]]);
        })
      });
    });

    describe("different object", () => {
      describe("but does not copy tags", () => {
        describe("no tags", () => {
          it("should work when no tags and no change", () => {
            nextArgsTest([], (next => nextArgs => {
              return next(nextArgs);
            }), []);
          })
          it("should work when no tags and adds with key/value", () => {
            nextArgsTest([], (next => nextArgs => {
              const { tags, ...copy } = { ...nextArgs };
              copy.key = "key";
              copy.value = "value";
              return next(copy);
            }), [["key", "value"]]);
          });
        });
        describe("single tag", () => {
          it("should work if does nothing", () => {
            nextArgsTest([["key", "value"]], (next => nextArgs => {
              const { tags, ...copy } = { ...nextArgs };
              return next(copy);
            }), [["key", "value"]]);
          })
          it("should work when tag and changes key", () => {
            nextArgsTest([["key", "value"]], (next => nextArgs => {
              const { tags, ...copy } = { ...nextArgs };
              copy.key = "key2";
              return next(copy);
            }), [["key2", "value"]]);
          });
          it("should work when tag and changes value", () => {
            nextArgsTest([["key", "value"]], (next => nextArgs => {
              const { tags, ...copy } = { ...nextArgs };
              copy.value = "value2";
              return next(copy);
            }), [["key", "value2"]]);
          });
        })
        describe("multi tags", () => {
          //this loses additional tags - then an exception can be thrown
          // TODO how are we going to detect that?
        })
      });

      describe("but does copy tags", () => {
        it("should use the key change", () => {
          nextArgsTest([["key", "value"]], (next => nextArgs => {
            const copy = { ...nextArgs };
            copy.key = "new key";
            return next(copy);
          }), [["new key", "value"]]);
        });

        it("should use the value change", () => {
          nextArgsTest([["key", "value"]], (next => nextArgs => {
            const copy = { ...nextArgs };
            copy.value = "new value";
            return next(copy);
          }), [["key", "new value"]]);
        })
      });
    })
  });

  describe("new middleware", () => {
    describe("same object", () => {
      describe("no initial tag", () => {
        it("should work when no tags and no change", () => {
          nextArgsTest([], (next => nextArgs => {
            return next(nextArgs);
          }), []);
        })
        it("should work when no tags and adds to tags array", () => {
          nextArgsTest([], (next => nextArgs => {
            nextArgs.tags?.push(["key", "value"])
            return next(nextArgs);
          }), [["key", "value"]]);
        });

        it("should work when no tags and sets a new tags array", () => {
          nextArgsTest([], (next => nextArgs => {
            nextArgs.tags = [["key", "value"]];
            return next(nextArgs);
          }), [["key", "value"]]);
        });
      });

      describe("initial multitags", () => {
        it("should work when multi tags and no change", () => {
          nextArgsTest([["key1", "value1"], ["key2", "value2"]], (next => nextArgs => {
            return next(nextArgs);
          }), [["key1", "value1"], ["key2", "value2"]]);
        })

        it("should work when multi tags and add tag", () => {
          nextArgsTest([["key1", "value1"], ["key2", "value2"]], (next => nextArgs => {
            nextArgs.tags?.push(["key3", "value3"]);
            return next(nextArgs);
          }), [["key1", "value1"], ["key2", "value2"], ["key3", "value3"]]);
        })

        it("should work when multi tags and sets a new tags array", () => {
          nextArgsTest([["key1", "value"], ["key2", "value2"]], (next => nextArgs => {
            nextArgs.tags = [["key3", "value3"], ["key4", "value4"]];
            return next(nextArgs);
          }), [["key3", "value3"], ["key4", "value4"]]);
        })
      })
    })

    describe("different object", () => {
      describe("same tags array", () => {
        it("should notice the change", () => {
          nextArgsTest([["key1", "value1"], ["key2", "value2"]], (next => nextArgs => {
            const copy = { ...nextArgs };
            copy.tags?.push(["key3", "value3"])
            return next(copy);
          }), [["key1", "value1"], ["key2", "value2"], ["key3", "value3"]]);
        })
      })
      describe("different tags array", () => {
        it("should use these tags", () => {
          nextArgsTest([["key1", "value1"], ["key2", "value2"]], (next => nextArgs => {
            const copy = { ...nextArgs };
            copy.tags = [["key3", "value3"], ["key4", "value4"]];
            return next(copy);
          }), [["key3", "value3"], ["key4", "value4"]]);
        });
      })
    })
  })

  describe("mixed middlewares", () => {
      describe("different object", () => {
        const oldMiddleware: interfaces.Middleware = (next) => (nextArgs) => {
          nextArgs.value = 'my_value'
          return next(nextArgs)
        }
        const newMiddleware: interfaces.Middleware = (next) => (nextArgs) => {
          nextArgs.tags = nextArgs.tags?.map(([ key, value ]) => ([ key, `${value}_suffix`]))
          next(nextArgs)
        }
        it('should work with both old and new middlewares alongside', () => {
          nextArgsTest(
            [['key1', 'value1'], ['key2', 'value2']],
            (next) => oldMiddleware(newMiddleware(next)),
            [['key1', 'my_value_suffix'], ['key2', 'value2_suffix']])
        })

        it('should work with both new and old middlewares alongside', () => {
          nextArgsTest(
            [['key1', 'value1'], ['key2', 'value2']],
            (next) => newMiddleware(oldMiddleware(next)),
            [['key1', 'my_value'], ['key2', 'value2_suffix']])
        })
      })
  })
})