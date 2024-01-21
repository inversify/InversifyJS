# How to release a new version?

:warning: This document is for the development team not the users of InversifyJS.

:warning: You need to do this fast because nothing can be merged to master during the release. If something is merged into master you will need to start again from step 2.

:warning: Prerequisite: Logging in npm using your CLI. Instructions can be found [here](https://npme.npmjs.com/docs/cli/configuration.html#logging-in).

To create a new release, you must:

1. Increase [the version number](https://github.com/inversify/InversifyJS/blob/master/package.json#L3) in the `package.json` file in the master branch.

2. Create a [new release tag in GitHub](https://github.com/inversify/InversifyJS/releases/new). The name of the release and the tag should be the version number used in the `package.json` file during the previous step.

3. Clone the repo `git clone https://github.com/inversify/InversifyJS.git`.

4. Ensure that the latest tag has been fetched with `git fetch --tags`.

5. Install dependencies with `npm install`.

6. Publish release with `npm run publish-please`.
