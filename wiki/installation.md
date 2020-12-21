# Installation

You can get the latest release and the type definitions using npm:

```
npm install inversify@5.0.5 reflect-metadata --save
```

Or using yarn:
```
yarn add inversify@5.0.5 reflect-metadata
```

The InversifyJS type definitions are included in the inversify npm package. InversifyJS requires the `experimentalDecorators`, `emitDecoratorMetadata`and `lib` compilation options in your `tsconfig.json` file.

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

InversifyJS requires a modern JavaScript engine with support for:

- [Reflect metadata](https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) (Only required if using [provider injection](https://github.com/inversify/InversifyJS#injecting-a-provider-asynchronous-factory))
- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) (Only required if using [activation handlers](https://github.com/inversify/InversifyJS/blob/master/wiki/activation_handler.md))

If your environment don't support one of these you will need to import a shim or polyfill.

**Check out the [Environment support and polyfills](https://github.com/inversify/InversifyJS/blob/master/wiki/environment.md)
page in the wiki to learn more.**
