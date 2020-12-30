# 安装

你可以用 npm 获取最先发布版本以及类型定义：

```
npm install inversify@2.0.0-rc.14 reflect-metadata --save
```

InversifyJS 类型定义包含在 inversify npm 包中。InversifyJS 需要 `experimentalDecorators`、 `emitDecoratorMetadata` 和 `lib` 编译选项开启在 `tsconfig.json` 文件中。

```js
{
    "compilerOptions": {
        "target": "es5",
        "lib": ["es6"],
        "types": ["reflect-metadata"],
        "module": "commonjs",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

InversifyJS 需要一个支持下面特性的现代 JavaScript 引擎：

- [Reflect metadata](https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) (仅在使用 [provider injection](https://github.com/inversify/InversifyJS#injecting-a-provider-asynchronous-factory) 时需要)
- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) (仅在使用 [activation handlers](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md) 时需要)

如果你的环境不支持其中的特性，那么需要引入 shim 或者 polyfill。

**查看 [环境支持和 polyfills](environment.md) 页面获取更多信息。**
