# Changelog
All notable changes to this project from 5.0.0 forward will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

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
- `injectable` decorator is no longer required.

### Fixed
- Fixed `Target.getNameTag` with the right type: `number | string | symbol`.

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
