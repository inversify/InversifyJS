# Changelog
All notable changes to this project from 4.14.0 forward will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.14.0] - 2018-10-16
### Added 
- Updating constructor injection wiki document with concrete injection example #922

### Changed
- Change GUID to incremented counter for better performance #882

### Fixed
- fix broken compilation by adding `.toString()` so symbols serialization #893
- Fix problem with applying options on Container.resolve (fix #914) #915
- Fixed documentation issues
