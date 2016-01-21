import { expect } from 'chai';
import { Inject } from "../source/inversify";

describe('Inject Annotation', () => {
   it('should resolve a single marked type argument to the type rather than the name', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(aType) { }"; }

      let injectionResolver = Inject("IType");

      injectionResolver(injectable, null, 0);

      expect(injectable.argumentTypes.length).to.equal(1);
      expect(injectable.argumentTypes[0]).to.equal("IType");
   });

   it('should resolve the first marked type to the annotated and second to the named', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(aType, bType) { }"; }

      let injectionResolver = Inject("IType");

      injectionResolver(injectable, null, 0);

      expect(injectable.argumentTypes.length).to.equal(2);
      expect(injectable.argumentTypes[0]).to.equal("IType");
      expect(injectable.argumentTypes[1]).to.equal("bType");
   });

   it('should resolve the first type to the named and second to the annotated', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(aType, bType) { }"; }

      let injectionResolver = Inject("IType");

      injectionResolver(injectable, null, 1);

      expect(injectable.argumentTypes.length).to.equal(2);
      expect(injectable.argumentTypes[0]).to.equal("aType");
      expect(injectable.argumentTypes[1]).to.equal("IType");
   });

   it('should resolve the first marked type to the annotated and second to the named with different argument names', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(something, somethingElse) { }"; }

      let injectionResolver = Inject("Resolvable");

      injectionResolver(injectable, null, 0);

      expect(injectable.argumentTypes.length).to.equal(2);
      expect(injectable.argumentTypes[0]).to.equal("Resolvable");
      expect(injectable.argumentTypes[1]).to.equal("somethingElse");
   });

   it('should resolve the first type to the named and second to the annotated with different argument names', function () {
      let injectable = <InjectableConstructorInterface>{};
      injectable.toString = function() { return "function(something, somethingElse) { }"; }

      let injectionResolver = Inject("Resolvable");

      injectionResolver(injectable, null, 1);

      expect(injectable.argumentTypes.length).to.equal(2);
      expect(injectable.argumentTypes[0]).to.equal("something");
      expect(injectable.argumentTypes[1]).to.equal("Resolvable");
   });
});
