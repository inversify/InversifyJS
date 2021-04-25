# Changelog
All notable changes to this project from 5.0.0 forward will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.1.1] - 2021-04-25
-Fix pre-publish for build artifacts

## [5.1.0] - 2021-04-25
### Added
- Upgrade information for v4.x to v5.x

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
