# Environment support and polyfills

InversifyJS requires a modern JavaScript engine with support for the 
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), 
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map),
[Metadata Reflection API](http://rbuckton.github.io/ReflectDecorators/#reflect) and 
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects. 
If your environment don't support one of these you will need to import a shim or polyfill.

## Metadata Reflection API
Required always. Use [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) as polyfill.

```
$ npm install reflect-metadata
```

`reflect-metadata` will be automatically imported by inversify. This will create the Reflect object as a global.

## Map
[Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) are required when using InversifyJS 3 or higher.

Most modern JavaScript engines support map but if you need to support old browsers you will need to use a map polyfill (e.g. [es6-map](https://www.npmjs.com/package/es6-map)).

## Promise
[Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are required if you want to:

[Inject a provider](https://github.com/inversify/InversifyJS/blob/master/wiki/provider_injection.md) or
[inject dynamic values asynchronously](https://github.com/inversify/InversifyJS/blob/master/wiki/value_injection.md).

Handle [post construction](https://github.com/inversify/InversifyJS/blob/master/wiki/post_construct.md) and [activation](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md), or [pre destroy](https://github.com/inversify/InversifyJS/blob/master/wiki/pre_destroy.md) and [deactivation](https://github.com/inversify/InversifyJS/blob/master/wiki/deactivation_handler.md) asynchronously.

Most modern JavaScript engines support promises but if you need to support old browsers you will need to use a promise polyfill (e.g. [es6-promise](https://github.com/stefanpenner/es6-promise) or [bluebird](https://www.npmjs.com/package/bluebird)).

## Proxy
[Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) are only required only if you want to [inject a proxy](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md). 

As today (September 2016) proxies are not very well supported and it is very likely that you will need to use a proxy polyfill. For example, we use [harmony-proxy](https://www.npmjs.com/package/harmony-proxy) as polyfill to run our unit tests.
