# 可传递的绑定

可传递的类型绑定允许声明一个被之前声明过的类型绑定解决了的类型绑定。

可传递的类型绑定可以使用 `toService` 方法声明：

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

还有一个工具函数叫 `multiBindToService` 允许我们一次声明多个可传递的绑定。

如，不这样写：

```ts
container.bind(DatabaseTransactionLog).toService(MySqlDatabaseTransactionLog);
container.bind(TransactionLog).toService(DatabaseTransactionLog);
```

而是使用 `multiBindToService` 来这样写：

```ts
multiBindToService(container)(MySqlDatabaseTransactionLog)
    (DatabaseTransactionLog, TransactionLog);
```
