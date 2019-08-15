# Experiments with dependencies for javascript libraries

This seems to be a [consistent issue](https://github.com/yarnpkg/yarn/issues/1503) for library authors:

> How can you test your peerDependencies for your package/library without duplication in devDependencies?

This repo attempts to document examples where this problem arises and provide a potential workaround. There are still [open questions](#open-questions) at the bottom of this readme.

## TL;DR

Move your tests to a separate `tests` package that installs `peerDependencies` as `dependencies`.

Also, don't forget to remove `node_modules` from your package when using local dependencies (`"my-package": "file:../../my-package"`). yarn/npm will happily pull that right in and cause conflict mayhem.

## Notes

Each scenario below comes with a branch. Once in the branch, just:

```
cd client-app
yarn install --force
yarn start
```

This will recompile the library (`my-package`) and reinstall it.

## Scenarios

### Scenario 1: Your Package

branch: [starting-point](https://github.com/jamstooks/package-peer-dependencies/tree/starting-point)

You've built a package, it doesn't have tests, but it works just fine. Your `package.json` might look something like this:

```json
{
  "name": "my-package",
  "main": "dist/index.js",
  "scripts": {
    "build": "babel ./src/ --out-dir ./dist --copy-files --ignore '**/*.test.js'"
  },
  "peerDependencies": {
    "react": "^16.9.0",
    "react-dom": "^16.9.0"
  }
}
```

### Scenario 2: Real Life

branch: [everything-is-broken](https://github.com/jamstooks/package-peer-dependencies/tree/everything-is-broken)

This is the real world, so you decide to write tests... now your `packages.json` needs `devDependencies` and starts to look more like this:

```json
{
  "name": "my-package",
  "main": "dist/index.js",
  "scripts": {
    "build": "babel ./src/ --out-dir ./dist --copy-files --ignore '**/*.test.js'",
    "test": "jest"
  },
  "devDependencies": {
    "@babel/cli": "^7.5.5",
    "@babel/core": "^7.5.5",
    "@babel/preset-env": "^7.5.5",
    "@babel/preset-react": "^7.0.0",
    "enzyme": "3.10.0",
    "enzyme-adapter-react-16": "1.14.0",
    "jest": "^24.8.0",
    "react": "^16.9.0",
    "react-dom": "^16.9.0"
  },
  "peerDependencies": {
    "react": "^16.9.0",
    "react-dom": "^16.9.0"
  },
  "jest": {
    "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"]
  }
}
```

Since `yarn`/`npm` don't support the installation of `peerDependencies`, you have to duplicate them in `devDependencies` in order to run `yarn test`. This really stinks, not just because it's unnecessary duplication, but when testing this package locally, you'll use local dependencies, like `"my-package": "file:/path/to/my-package"` and if you don't clear out `node_modules` from `my-packages` _every time_ you'll end up corrupting your client's installed modules and see something like this:

```
Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
```

Incidentally, I have no idea why this is default functionality for npm/yarn. It's super annoying. That being said, you can always add the purging of `node_modules` to your build script... see the [the-workaround](https://github.com/jamstooks/package-peer-dependencies/tree/the-workaround) branch for an example of `build:fresh` that I am using in some projects.

### Scenario 3: Extracting Tests

branch: [master](https://github.com/jamstooks/package-peer-dependencies/tree/master)

Since there's no easy way to `yarn install --include-peers` as of yet, the best solution I can think of is to extract/hoist your tests into another package that installs the peer dependencies and runs the tests.

This has two benefits. First, you won't break the apps of anyone using your package and second, you will also be e2e testing your package, in a way... ensuring that your `dist` is built properly, you're exporting all your components correctly and that sort of thing.

In this scenario, your package's `package.json` is as slim as it was in [Scenario #1](#scenario-1-your-package) and all your testing packages are in the `devDependencies` of your testing package, further slimming your overall package.

## Open Questions :confused: :confounded: :disappointed: :weary:

Why does [Scenario #2](#scenario-2-real-life) fail? When our client app's `dependencies` exactly match the `devDependencies` from `my-package`, shouldn't yarn/npm just figure this out and only use the one?

This doesn't fix all scenarios... you may still need `devDependencies` in your package that can't be extracted into the external test package and I don't know how conflicts can be avoided there. In [Scenario #3](#scenario-3-extracting-tests) I'm still using `babel` in `devDependencies` and that doesn't appear to cause conflicts down the line. I wonder why? That brings us back to the first question above.

What about other `devDependencies` like `storybook` for building a demo? Should that be in it's own app too? This kind of thing could add a fair number of extra apps to your package.
