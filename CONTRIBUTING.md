## Git workflow

This repo uses the [GitHub flow](https://guides.github.com/introduction/flow/).

`main` is the main branch and is [protected](https://docs.github.com/en/github/administering-a-repository/about-protected-branches). All changes must be PR'd, reviewed, and squashed when merging.

### Commit style

This repository uses [Conventional Commits](https://www.conventionalcommits.org) for simple yet meaningful commit messages. Not only are they user-friendly, they are also machine-readable for automated release notes and versioning.


It has the following formats:

#### Without scope

```
<type>: <subject>
```

#### With scope
```
<type>(<scope>): <subject>
```

#### Types

Version influencing types:
- `fix`: user-facing bug fix (patch version bump 🏥)
- `feat`: user-facing feature (minor version bump 🌟)

Other types:
- `revert`: reverts a previous commit
- `docs`: changes to the documentation
- `build`: changes that affect the build system or external dependencies
- `test`: adding missing tests, refactoring tests; no production code change
- `refactor`: refactoring production code, eg. renaming a variable
- `style`: formatting, missing semi colons, etc; no production code change
- `perf`: changes that improve performance
- `ci`: changes to CI configuration files and scripts (eg. GitHub Actions)
- `chore`: updating grunt tasks etc; no production code change

If deciding between `feat` or `fix` vs another type, choose `feat` or `fix` because they influence the version bump appropriately.

Ensure that all your commits contain a relevant message and nothing generic, as they will be used as part of the release notes after the squash and merge of a PR.

- ✅ chore: split linting command
- ✅ fix: properly set status code on errors
- ❌ chore: update package.json
- ❌ fix: code review changes

**Note that because of the squash and merge, by default the commit message will be the PR title.**

## Releasing

Merging to `main` will trigger a release GitHub Actions workflow that will appropriately version-bump based on semantic commit messages, and make a GitHub release.
