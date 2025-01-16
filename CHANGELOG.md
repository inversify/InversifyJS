# Changelog
All notable changes to this project from 5.0.0 forward will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.0.0-alpha.0]

### Added
- Added `BindInFluentSyntax`.
- Added `BindInWhenOnFluentSyntax`.
- Added `BindOnFluentSyntax`.
- Added `BindingScope`.
- Added `BindToFluentSyntax`.
- Added `BindWhenFluentSyntax`.
- Added `BindWhenOnFluentSyntax`.
- Added `ContainerModuleLoadOptions`.
- Added `DynamicValueBuilder`.
- Added `Factory`.
- Added `GetOptions`.
- Added `GetOptionsTagConstraint`.
- Added `IsBoundOptions`.
- Added `MetadataName`.
- Added `MetadataTag`.
- Added `MetadataTargetName`.
- Added `OptionalGetOptions`.
- Added `Provider`.
- Added `ResolutionContext`.
- Added `bindingScopeValues`.
- Added `bindingTypeValues`.
- Added `injectFromBase` decorator.

### Changed
- Updated `injectable` with optional `scope`.
- [Breaking] Updated `ContainerModule` constructor to receive a callback with `ContainerModuleLoadOptions` instead of `interfaces.ContainerModuleCallBack`.
- [Breaking] Updated `ContainerModule`.load to return `Promise<void>`.
- Updated `ContainerOptions` with `parent`.
- Updated `ContainerOptions` without `autoBindInjectable` and `skipBaseClassChecks`.
- [Breaking] Updated `Container` to no longer expose `id`, `parent` nor `options`.
- [Breaking] Updated `Container` with no `applyCustomMetadataReader`, `applyMiddleware`, `createChild`, `merge` and `rebind` methods.
- [Breaking] Updated `Container` with no `isCurrentBound`, `isBoundNamed`, `isBoundTagged` methods in favor of using `Container.isBound` with `isBoundOptions`.
- [Breaking] Updated `Container` with no `getNamed`, `getTagged`, `tryGet`, `tryGetNamed` and `tryGetTagged` methods in favor of `Container.get` with `OptionalGetOptions` options.
- [Breaking] Updated `Container` with no `getNamedAsync`, `getTaggedAsync`, `tryGetAsync`, `tryGetNamedAsync` and `tryGetTaggedAsync` methods in favor of `Container.getAsync` with `OptionalGetOptions` options.
- [Breaking] Updated `Container` with no `getAllNamed`, `getAllTagged`, `tryGetAll`, `tryGetAllNamed` and `tryGetAllTagged` methods in favor of `Container.getAll` with `GetOptions` options.
- [Breaking] Updated `Container` with no `getAllNamedAsync`, `getAllTaggedAsync`, `tryGetAllAsync`, `tryGetAllNamedAsync` and `tryGetAllTaggedAsync` methods in favor of `Container.getAllAsync` with `GetOptions` options.
- [Breaking] Updated `Container` with no `loadAsync` in favor of an async `Container.load`.
- [Breaking] Updated `Container` with no `unbindAsync` in favor of an async `Container.unbind`.
- [Breaking] Updated `Container` with no `unbindAllAsync` in favor of an async `Container.unbindAll`.
- [Breaking] Updated `Container` with no `unloadAsync` in favor of an async `Container.unload`.


### Fixed
- Updated `decorate` to no longer require a unexpected prototypes to decorate property nor methods.

### Removed
- [Breaking] Removed deprecated `LazyServiceIdentifer`. Use `LazyServiceIdentifier` instead.
- [Breaking] Removed `BindingScopeEnum`. Use `bindingScopeValues` instead.
- [Breaking] Removed `BindingTypeEnum`.
- [Breaking] Removed `TargetTypeEnum`.
- [Breaking] Removed `METADATA_KEY`.
- [Breaking] Removed `AsyncContainerModule`. Use `ContainerModule` instead.
- [Breaking] Removed `createTaggedDecorator`.
- [Breaking] Removed `MetadataReader`.
- [Breaking] Removed `id`.
- [Breaking] Removed `interfaces` types. Rely on new types instead.
- [Breaking] Removed `traverseAncerstors`.
- [Breaking] Removed `taggedConstraint`.
- [Breaking] Removed `namedConstraint`.
- [Breaking] Removed `typeConstraint`.
- [Breaking] Removed `getServiceIdentifierAsString`.
- [Breaking] Removed `multiBindToService`.


## [6.2.1]

### Fixed
- Added missing `LazyServiceIdentifer`.

## [6.2.0]

### Added
- Added `interfaces.GetAllOptions`.

### Changed
- Updated `container.getAll` with `options` optional param.
- Updated `container.getAllAsync` with `options` optional param.
- Updated `interfaces.NextArgs` with optional `isOptional` param.
- Updated `container` with `tryGet`.
- Updated `container` with `tryGetAsync`.
- Updated `container` with `tryGetTagged`.
- Updated `container` with `tryGetTaggedAsync`.
- Updated `container` with `tryGetNamed`.
- Updated `container` with `tryGetNamedAsync`.
- Updated `container` with `tryGetAll`.
- Updated `container` with `tryGetAllAsync`.
- Updated `container` with `tryGetAllTagged`.
- Updated `container` with `tryGetAllTaggedAsync`.
- Updated `container` with `tryGetAllNamed`.
- Updated `container` with `tryGetAllNamedAsync`.

## [6.2.0-beta.1]

### Added

### Changed
- Updated `interfaces.NextArgs` with optional `isOptional` param.
- Updated `container` with `tryGet`.
- Updated `container` with `tryGetAsync`.
- Updated `container` with `tryGetTagged`.
- Updated `container` with `tryGetTaggedAsync`.
- Updated `container` with `tryGetNamed`.
- Updated `container` with `tryGetNamedAsync`.
- Updated `container` with `tryGetAll`.
- Updated `container` with `tryGetAllAsync`.
- Updated `container` with `tryGetAllTagged`.
- Updated `container` with `tryGetAllTaggedAsync`.
- Updated `container` with `tryGetAllNamed`.
- Updated `container` with `tryGetAllNamedAsync`.

### Fixed

## [6.2.0-beta.0]

### Added
- Added `interfaces.GetAllOptions`.

### Changed
- Updated `container.getAll` with `options` optional param.
- Updated `container.getAllAsync` with `options` optional param.

### Fixed

## [6.1.6]

### Fixed
- Fixed unexpected property access while running planning checks on injected base types.
- Updated ESM sourcemaps to refelct the right source code files.

## [6.1.5]

### Changed
- Updated library to import `reflect-metadata`. Importing `reflect-metadata` before bootstraping a module in the userland is no longer required.

### Fixed
- Updated ESM build to provide proper types regardless of the ts resolution module strategy in the userland.
- Fixed container to properly resolve async `.toService` bindings.
- Fixed `.toService` binding to properly disable caching any values.

## [6.1.5-beta.2]

### Fixed
- Updated ESM bundled types to solve circularly referenced types.

## [6.1.5-beta.1]

### Fixed
- Updated ESM build to provide proper types regardless of the ts resolution module strategy in the userland.

## [6.1.5-beta.0]

### Changed
- Updated library to import `reflect-metadata`. Importing `reflect-metadata` before bootstraping a module in the userland is no longer required.

### Fixed
- Fixed container to properly resolve async `.toService` bindings.
- Fixed `.toService` binding to properly disable caching any values.

## [6.1.4]

### Changed
- Updated planner with better error description when a binding can not be properly resolved.

### Fixed
- Updated container to allow deactivating singleton undefined values.
- Updated ESM build to be compatible with both bundler and NodeJS module resolution algorithms.

## [6.1.4-beta.1]

### Fixed
- Updated ESM build to be compatible with both bundler and NodeJS module resolution algorithms.

## [6.1.4-beta.0]

### Changed
- Updated planner with better error description when a binding can not be properly resolved.

## [6.1.3]

### Fixed
- Updated ESM build with missing types.

## [6.1.2]

### Changed
- Updated `package.json` to include the `exports` field for better bundler support.

### Fixed
- Updated fetch metadata flows with better error descriptions.

## [6.1.2-beta.1]

### Changed
- Updated `package.json` to include the `exports` field for better bundler support.

## [6.1.2-beta.0]

### Fixed
- Updated fetch metadata flows with better error descriptions.

## [6.1.1]

### Fixed
- Bumped `@inversifyjs/common` and `@inversifyjs/core` fixing wrong dev engines constraints.

## [6.1.0]

### Changed
- Updated `ServiceIdentifier` to rely on `Function` instead of `Abstract<T>`.

### Fixed
- Fixed `Target.getNameTag` with the right type: `number | string | symbol`.
- Fixed `interfaces.ModuleActivationStore.addDeactivation` to enforce `serviceIdentifier` and `onDeactivation` are consistent.
- Fixed `interfaces.ModuleActivationStore.addActivation` to enforce `serviceIdentifier` and `onDeactivation` are consistent.

## [6.0.3]

### Fixed
property injection tagged as @optional no longer overrides default values with `undefined`.
Updated `targetName` to be a valid `typescript@5` decorator.

## [6.0.2]

### Added
Brought tests up to 100% Code Coverage

### Changed
LazyIdentfier Tests
Removed browser test pipeline, browserify, karma (#1542)
Update all dependencies except typescript (#1531)

### Fixed
Less than 100% code coverage
Use default class property for @optional injected properties (#1467)
Remove circular import (#1516)
Fix strict type checking on @unmanaged decorator (#1499)
Fix typo (LazyServiceIdentifer -> LazyServiceIdentifier) (#1483)
Fix typo (circular dependency error message) (#1485)

## [6.0.1] - 2021-10-14
### Added
- add API method for check dependency only in current container
- createTaggedDecorator #1343
- Async bindings #1132
- Async binding resolution (getAllAsync, getAllNamedAsync, getAllTaggedAsync, getAsync, getNamedAsync, getTaggedAsync, rebindAsync, unbindAsync, unbindAllAsync, unloadAsync) #1132
- Global onActivation / onDeactivation #1132
- Parent/Child onActivation / onDeactivation #1132
- Module onActivation / onDeactivation #1132
- Added @preDestroy decorator #1132

### Changed
- @postConstruct can target an asyncronous function #1132
- Singleton scoped services cache resolved values once the result promise is fulfilled #1320

### Fixed
- only inject decorator can be applied to setters #1342
- Container.resolve should resolve in that container #1338

## [5.1.1] - 2021-04-25
-Fix pre-publish for build artifacts

## [5.1.0] - 2021-04-25
### Added
- Upgrade information for v4.x to v5.x

### Changed
- Update BindingToSyntax with `.toAutoNamedFactory()`.

### Fixed
- Fix `Target.isTagged()` to exclude `optional` from tag injections #1190.
- Update `toConstructor`, `toFactory`, `toFunction`, `toAutoFactory`, `toProvider` and `toConstantValue` to have singleton scope #1297.
- Fix injection on optional properties when targeting ES6 #928

## [5.0.1] - 2018-10-17
### Added
- Updating constructor injection wiki document with concrete injection example #922

### Changed
- Change GUID to incremented counter for better performance #882

### Fixed
- fix broken compilation by adding `.toString()` so symbols serialization #893
- Fix problem with applying options on Container.resolve (fix #914) #915
- Fixed documentation issues

## [4.14.0] - 2018-10-16
Deprecated - Replaced by 5.0.1
