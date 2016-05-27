# Environment support and polyfills

InversifyJS requires a modern JavaScript engine with support for the 
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), 
[Metadata Reflection API](http://rbuckton.github.io/ReflectDecorators/#reflect) and 
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects. 
If your environment don't support one of these you will need to import a shim or polypill.

## Metadata Reflection API
Required always. Use [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) as polypill.
```
$ npm install reflect-metadata
```
The type definitions for reflect-metadata are included in the npm package. You need to add the following reference:
```
/// <reference path="node_modules/reflect-metadata/reflect-metadata.d.ts" />
```
Finally, import reflect-metadata:
```
import "reflect-metadata";
```
This will create the Reflect object as a global.

## Promise
Required only if you use want to 
[inject a provider](https://github.com/inversify/InversifyJS#injecting-a-provider-asynchronous-factory). 
Use the [bluebird](https://www.npmjs.com/package/bluebird) as polyfill.
```
$ npm install bluebird
$ typings install bluebird
```
After installing it add a reference to the `bluebird.d.ts` file:
```
/// <reference path="typings/main.d.ts" />
```
Finally, import bluebird:
```
import "bluebird";
```
This will create the Promise object as a global.

## Proxy
Required only if you want to [inject a proxy](https://github.com/inversify/InversifyJS#injecting-a-proxy). 
Use [harmony-proxy](https://www.npmjs.com/package/harmony-proxy) as polyfill.

**Important** There is an issue with this feature at the moment. 
You can track the progress [here](https://github.com/inversify/InversifyJS/issues/106).
