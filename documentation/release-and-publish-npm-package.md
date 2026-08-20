# Release and Publish the NPM Package

This document describes how to release a new version of the
`@digitalservicebund/a2j-xjustiz-bridge` package and publish it to the public
[NPM
registry](https://www.npmjs.com/package/@digitalservicebund/a2j-xjustiz-bridge).

## Preconditions

- Ensure that the changes for the release are merged into `main`.
- Ensure that the working tree is clean.
- Check the
  [existing tags](https://github.com/digitalservicebund/a2j-xjustiz-bridge/tags)
  and determine the next semantic version. Tags use the `v` prefix, for example
  `v0.5.0`.

## Create the Release

1. Change into the package directory:

   ```sh
   cd package
   ```

2. Bump the version according to the changes since the previous tag:

   ```sh
   pnpm version patch
   # or: pnpm version minor
   # or: pnpm version major
   ```

   The command updates the version in `package/package.json` and creates the
   corresponding Git commit and tag. To use an explicit commit message instead
   of the default version-tag message, pass `--message`:

   ```sh
   pnpm version minor --message "chore: bump minor version of library for release"
   ```

3. Push the commit and tag to GitHub

4. Open
   [Releases](https://github.com/digitalservicebund/a2j-xjustiz-bridge/releases)
   and select **Draft a new release**.

5. Select the newly created tag, for example `v0.5.0`.

6. Set the release title to the version without the `v` prefix, for example
   `0.5.0`.

7. Add release notes that summarize the changes between the previous tag and the
   new tag.

8. Select **latest** as the release label when this is the latest stable
   release.

9. Select **Publish release**.

GitHub makes source archives available for the published release. The NPM
package is published separately in the next step.

## Publish the Package

1. Open the
   [publish library to NPM package registry workflow](https://github.com/digitalservicebund/a2j-xjustiz-bridge/actions/workflows/publish.yaml).

2. Select **Run workflow**.

3. In **Branch**, open the **Tags** tab and select the newly created tag.

4. Select **Run workflow**.

The workflow checks out the selected tag and runs `task publish`. This builds
and tests the library before publishing it. Publishing requires approval for the
`npm-publish-library` GitHub environment. Wait for an authorized maintainer to
approve the workflow.

## Verify the Publication

After the workflow completes:

1. Confirm that the published version matches the GitHub release.
2. Confirm that the package can be installed from the public registry.
