# Transitive bindings

A transitive type binding allows as to declare a type binding that is resolved by a previously declared type binding.

A transitive binding can be declared using the `toService` method:

```ts
@injectable()
class MySqlDatabaseTransactionLog {
    public time: number;
    public name: string;
    public constructor() {
        this.time = new Date().getTime();
        this.name = "MySqlDatabaseTransactionLog";
    }
}

@injectable()
class DatabaseTransactionLog {
    public time: number;
    public name: string;
}

@injectable()
class TransactionLog {
    public time: number;
    public name: string;
}

const container = new Container();
container.bind(MySqlDatabaseTransactionLog).toSelf().inSingletonScope();
container.bind(DatabaseTransactionLog).toService(MySqlDatabaseTransactionLog);
container.bind(TransactionLog).toService(DatabaseTransactionLog);

const mySqlDatabaseTransactionLog = container.get(MySqlDatabaseTransactionLog);
const databaseTransactionLog = container.get(DatabaseTransactionLog);
const transactionLog = container.get(TransactionLog);

expect(mySqlDatabaseTransactionLog.name).to.eq("MySqlDatabaseTransactionLog");
expect(databaseTransactionLog.name).to.eq("MySqlDatabaseTransactionLog");
expect(transactionLog.name).to.eq("MySqlDatabaseTransactionLog");
expect(mySqlDatabaseTransactionLog.time).to.eq(databaseTransactionLog.time);
expect(databaseTransactionLog.time).to.eq(transactionLog.time);
```

There is also an utility function named `multiBindToService` which allows us to declare multiple transitive bindings in one go.

For example, instead of writing the following:

```ts
container.bind(DatabaseTransactionLog).toService(MySqlDatabaseTransactionLog);
container.bind(TransactionLog).toService(DatabaseTransactionLog);
```

We can use `multiBindToService` to write the following:

```ts
multiBindToService(container)(MySqlDatabaseTransactionLog)
    (DatabaseTransactionLog, TransactionLog);
```
