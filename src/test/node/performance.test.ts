import { expect } from 'chai';
import { performance } from 'perf_hooks';

import { Container } from '../../index';

describe('Performance', () => {
  function registerN(times: number) {
    const result: {
      container: Container;
      register: number;
    } = {
      container: new Container(),
      register: -1,
    };

    for (let i: number = 0; i < times; i++) {
      const start: number = performance.now();
      result.container
        .bind(`SOME_ID_${i.toString()}`)
        .toConstantValue({ test: i });
      const end: number = performance.now();
      result.register = end - start;
    }

    return result;
  }

  function resolveN(container: Container, times: number) {
    const result: {
      avg: number;
      max: number;
      min: number;
    } = {
      avg: -1,
      max: -1,
      min: Number.MAX_SAFE_INTEGER,
    };

    const items: number[] = [];

    for (let i: number = 0; i < times; i++) {
      const start: number = performance.now();
      container.get(`SOME_ID_${times.toString()}`);
      const end: number = performance.now();
      const total: number = end - start;

      if (total < result.min) {
        result.min = total;
      }
      if (total > result.max) {
        result.max = total;
      }

      items.push(total);
    }

    result.avg =
      items.reduce((p: number, c: number) => p + c, 0) / items.length;

    return result;
  }

  it('Should be able to register 1 binding in less than 1 ms', () => {
    const result1: {
      container: Container;
      register: number;
    } = registerN(1);
    expect(result1.register).to.below(1);
    expect(result1.register).to.below(1);
  });

  it('Should be able to register 5 bindings in less than 1 ms', () => {
    const result5: {
      container: Container;
      register: number;
    } = registerN(5);
    expect(result5.register).to.below(1);
  });

  it('Should be able to register 1K bindings in less than 1 ms', () => {
    const result1K: {
      container: Container;
      register: number;
    } = registerN(1000);
    expect(result1K.register).to.below(1);
  });

  it('Should be able to register 5K bindings in less than 1 ms', () => {
    const result5K: {
      container: Container;
      register: number;
    } = registerN(5000);
    expect(result5K.register).to.below(1);
  });

  it('Should be able to register 1 bindings in less than 1 ms', () => {
    const container1: Container = registerN(1000).container;
    const result1: {
      avg: number;
      max: number;
      min: number;
    } = resolveN(container1, 5);
    expect(result1.avg).to.below(1);
  });

  it('Should be able to register 5 bindings in less than 1 ms', () => {
    const container5: Container = registerN(1000).container;
    const result5: {
      avg: number;
      max: number;
      min: number;
    } = resolveN(container5, 5);
    expect(result5.avg).to.below(1);
  });

  it('Should be able to register 1K bindings in less than 1 ms', () => {
    const container1K: Container = registerN(1000).container;
    const result1K: {
      avg: number;
      max: number;
      min: number;
    } = resolveN(container1K, 5);
    expect(result1K.avg).to.below(1);
  });

  it('Should be able to register 5K bindings in less than 1 ms', () => {
    const container5K: Container = registerN(5000).container;
    const result5K: {
      avg: number;
      max: number;
      min: number;
    } = resolveN(container5K, 5);
    expect(result5K.avg).to.below(1);
  });

  it('Should be able to register 10K bindings in less than 1 ms', () => {
    const container10K: Container = registerN(10000).container;
    const result10K: {
      avg: number;
      max: number;
      min: number;
    } = resolveN(container10K, 5);
    expect(result10K.avg).to.below(1);
  });
});
