# Testing

Testing is an essential aspect of software development, ensuring that your code behaves as expected and remains
maintainable over time. This document guides you through two approaches to testing with InversifyJS, using a consistent
example to demonstrate and evaluate the principles.

Consider the following classes for our examples:

```typescript
import { injectable } from 'inversify';

@injectable()
export class UserDAL {
  getUsers(): User[] | [] { return [] }
}

@injectable()
export class UserApiService {
  fetchUsers(): User[] | [] { return [] }
}

@injectable()
export class UserService {
  constructor(private userDal: UserDAL, private userApi: UserApiService) {}

  getAllUsers(): User[] {
    const fromDb = this.userDal.getUsers();
    const fromApi = this.userApi.fetchUsers();

    return [...fromDb, ...fromApi];
  }
}
```

## Integration Tests

Integration tests ensure that different parts of your application work together harmoniously. These tests are 
crucial for verifying the interactions between your classes and their dependencies, much like how components 
interact in a real-world scenario.

### Real Instances and Mocks

In integration testing, the decision to use real instances or mocks depends on the test's focus. For instance, when
testing UserService that interacts with a database and an API, you might want to use a mock database or a mock API
client in some scenarios, while in others, you might prefer the real implementations to ensure full interaction.

In the following example, we decide to mock the API but let the database run:
```typescript
import { Container } from 'inversify';
import { UserService } from './user.service';
import { UserDAL } from './user.dal';
import { UserApiService } from './user.api.service';

describe('Fetching Users Integration Test', () => {
  let userService: UserService;
  let mockUserApiService: jest.Mocked<UserApiService>;

  beforeAll(() => {
    const container: Container = new Container();

    container.bind(UserService).toSelf();
    container.bind(UserDAL).toSelf();

    mockUserApiService = { fetchUsers: jest.fn().mockReturnValue([{ id: 1, name: 'Mock User from API' }]) };
    container.bind(UserApiService).toConstantValue(mockUserApiService);

    userService = container.get(UserService);
  });

  test('should fetch users from both DAL and API', async () => {
    const users = userService.getAllUsers();
    expect(users).toHaveLength(3); // Assuming 2 users from DAL and 1 mock user from API
    expect(mockUserApiService.fetchUsers).toHaveBeenCalled();
  });
});
```

In this example, we use a real `UserDAL` instance and a mock `UserApiService`. The test verifies that `UserService`
correctly integrates the data from both the database and the API.

## Unit Tests

Unit testing is about isolating a single unit of work and validating its correctness. This isolation is crucial for
pinpointing issues and ensuring that each component functions and behaves as expected, independently.
Unlike integration tests, unit tests mock all class dependencies to validate the code behavior. Here, we mock both
`UserDAL` and `UserApiService` for testing `UserService`.

```typescript
import { Container } from 'inversify';
import { UserService } from './user.service';
import { UserDAL } from './user.dal';
import { UserApiService } from './user.api.service';

describe('User Service Unit Spec', () => {
  let userService: UserService;
  let mockUserDal: jest.Mocked<UserDal>;
  let mockUserApiService: jest.Mocked<UserApiService>;

  beforeAll(() => {
    const container: Container = new Container();

    container.bind(UserService).toSelf();

    mockUserDal = { getUsers: jest.fn().mockReturnValue([{ id: 1, name: 'Mock User from DB' }]) };
    mockUserApiService = { fetchUsers: jest.fn().mockReturnValue([{ id: 2, name: 'Mock User from API' }]) };

    // Bind the mocks to the container
    container.bind<UserDAL>(UserDAL).toConstantValue(mockUserDal as UserDAL);
    container.bind<UserApiService>(UserApiService).toConstantValue(mockUserApiService as UserApiService);

    // Get the instance of UserService
    userService = container.get(UserService);
  });

  test('getting all users should return combined users from DAL and API', async () => {
    const users = userService.getAllUsers();
    expect(users).toHaveLength(2);
    expect(mockUserApiService.fetchUsers).toHaveBeenCalled();
  });
});
```

## Unit Tests using Automock

Automock is a stand-alone unit testing library. It improves the unit testing process by offering a virtual,
isolated environment and automated mock generation, allowing for the creation of efficient test suites and
an overall enhanced testing experience.

#### Setting Up Automock with InversifyJS

Integrating Automock with InversifyJS involves a few straightforward steps. You'll need to install
`@automock/jest` or `@automock/sinon`, along with the InversifyJS adapter `@automock/adapters.inversify`.

For Jest:

```bash
$ npm i -D @automock/jest @automock/adapters.inversify
```

For Sinon:

```bash
$ npm i -D @automock/sinon @automock/adapters.inversify
```

### A Practical Example

Here's an example of using Automock in a unit test, using the same `UserService` as before:

```typescript
import { TestBed } from '@automock/jest';
import { UserService } from './user.service';
import { UserDAL } from './user.dal';
import { UserApiService } from './user.api.service';

describe('User Service Unit Spec', () => {
  let userService: UserService;
  let mockUserDal: jest.Mocked<UserDAL>;
  let mockUserApiService: jest.Mocked<UserApiService>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create<UserService>(UserService);

    mockUserDal = unitRef.get(UserDAL);
    mockUserApiService = testBed.get(UserApiService);

    userService = unit;
  });

  test('getting all users should return combined users from DAL and API', async () => {
    mockUserDal.getUsers.mockResolvedValue([{ id: 1, name: 'Mock User from DAL' }]);
    mockUserApiService.fetchUsers.mockResolvedValue([{ id: 2, name: 'Mock User from API' }]);

    const users = await userService.getAllUsers();

    expect(users.length).toBe(2);
    expect(users[0].name).toBe('Mock User from DAL');
    expect(users[1].name).toBe('Mock User from API');

    expect(mockUserDal.getUsers).toHaveBeenCalled();
    expect(mockUserApiService.fetchUsers).toHaveBeenCalled();
  });
});
```

In this example, we use `TestBed.create(UserService)` to automatically mock the dependencies of `UserService`. The 
test verifies that `UserService` integrates data from both the mocked `UserDAL` and `UserApiService`.

For full examples and the InversifyJS guide, visit Automock documentation:
* [https://github.com/automock/automock](https://github.com/automock/automock)
* [https://automock.dev](https://automock.dev) 
