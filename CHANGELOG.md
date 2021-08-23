# Changelog
All notable changes to this project from 5.0.0 forward will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
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

## [Unreleased]
-Feat add API method for check dependency only in current container

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
