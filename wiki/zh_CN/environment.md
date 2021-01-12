# 环境支持和 polyfills

InversifyJS 需要一个现代的 JavaScript 引擎，需要支持 
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)、
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)、
[Metadata Reflection API](http://rbuckton.github.io/ReflectDecorators/#reflect) 和
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 对象。 
如果你的环境不支持这些的化，就需要引入 shim 或者 polyfill。

## 元数据反射接口
> :警告: ** `reflect-metadata` polyfill 仅在进入应用时需要引入一次**，因为反射对象是一个全局单例。更多详情参见[这里](https://github.com/inversify/InversifyJS/issues/262#issuecomment-227593844)。

始终需要。使用[reflect-metadata](https://www.npmjs.com/package/reflect-metadata)作为 polyfill。

```
$ npm install reflect-metadata
```

reflect-metadata 的类型定义已在 npm 包中被包含。你需要添加如下引用到 `tsconfig.json` 中的类型字段：

```
"types": ["reflect-metadata"]
```

最后，引入 reflect-metadata。如果你使用 Node.js 那么可以用：

```
import "reflect-metadata";
```

如果你在使用网页浏览器那么可以使用 script 标签：

```
<script src="./node_modules/reflect-metadata/Reflect.js"></script>
```

这将创建全局反射对象。

## Map
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) 在使用 InversifyJS 3 或者更高版本时需要。

大多数现代 JavaScript 引擎支持 map，但如果你需要支持旧浏览器，那么需要使用 map polyfill (比如 [es6-map](https://www.npmjs.com/package/es6-map))。

## Promise
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 仅在使用 
[注入提供者](https://github.com/inversify/InversifyJS#injecting-a-provider-asynchronous-factory) 时需要。

多数现代 JavaScript 引擎支持 promise，但如果你需要支持就浏览器，那么需要使用 promise polyfill (比如 [es6-promise](https://github.com/stefanpenner/es6-promise) 或者 [bluebird](https://www.npmjs.com/package/bluebird))。

## Proxy
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 仅在使用 [注入代理](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md) 时需要。

如今（2016年9月）代理还没有被很好地支持，所以你很可能需要使用 proxy polyfill。比如，我们使用 [harmony-proxy](https://www.npmjs.com/package/harmony-proxy) 作为 polyfill 来运行我们的单元测试。
