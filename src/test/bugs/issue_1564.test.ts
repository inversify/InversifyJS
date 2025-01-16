import { expect } from 'chai';
import { describe, it } from 'mocha';

import { Container, inject, injectable } from '../..';

describe('Issue 1564', () => {
  it('should not throw on getting async services bound using "toService"', async () => {
    @injectable()
    class Database {
      constructor() {
        console.log('new Database');
      }
    }

    @injectable()
    class Service1 {
      constructor(@inject(Database) public database: Database) {
        console.log('new Service1');
      }
    }

    @injectable()
    class Service2 {
      constructor(@inject(Service1) public service1: Service1) {
        console.log('new Service2');
      }
    }

    const container: Container = new Container({ defaultScope: 'Request' });

    container.bind(Database).toDynamicValue(async () => {
      console.log('connecting to db...');
      return new Database();
    });

    container.bind(Service1).toSelf();
    container.bind(Service2).toSelf();

    container.bind('services').toService(Service1);
    container.bind('services').toService(Service2);

    const result: unknown[] = await container.getAllAsync('services');

    expect(result).to.have.length(2);
  });
});
