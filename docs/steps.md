# Steps

## Initial setup

```
yarn add typescript -D -W
yarn add @types/node -D -W
yarn add -D -W ts-node
```

Root tsconfig from <https://www.baltuta.eu/posts/typescript-lerna-monorepo-the-setup> and `references` from <https://cryogenicplanet.tech/posts/typescript-monorepo>

## Create shared package

`lerna create shared` with following initial package.json

```
{
  "name": "@monorepo/shared",
  "version": "1.0.0",
  "description": "> TODO: description",
  "author": "jeremyr23 <jeremyr@theodo.fr>",
  "homepage": "",
  "license": "ISC",
  "main": "index.js",
  "directories": {
    "lib": "lib",
    "test": "__tests__"
  },
  "files": [
    "lib"
  ],
  "scripts": {
    "test": "echo \"Error: run tests from root\" && exit 1"
  }
}
```

Initial tsconfig in shared

```
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist" // Your outDir
  },
  "include": ["./lib"]
}
```

At this point, `lerna run start` **should** build files in shared. Let's try it.
We get an error:

```
No inputs were found in config file '/home/jeremy/dev/jeremy/templates/lerna-repo/packages/shared/tsconfig.json'. Specified 'include' paths were '["./lib"]' and 'exclude' paths were '["./dist"]'.
```

This error happened because there were no `.ts` or `.tsx` files in `shared`. After renaming `shared.js` to `shared.ts`, the command succeeds and builds output in `shared/dist`.

I renamed the `lib` folder to `src` and added `constants` and `utils` folders. Added `baseUrl: './src` to `tsconfig.json` so I can absolute reference folders in `shared/index.ts`

## Add eslint globally

Ran `yarn add -D -W @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-prettier prettier`
Created base files at project root `.prettierrc`

```
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

and `.eslintrc`

```
{
  "root": true,
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:prettier/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/unified-signatures": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/unbound-method": "off",
    "dot-notation": "error",
    "eqeqeq": ["error", "smart"],
    "guard-for-in": "error",
    "no-bitwise": "error",
    "no-console": "warn",
    "no-eval": "error",
    "no-invalid-this": "off",
    "no-new-wrappers": "error",
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",
    "no-throw-literal": "error",
    "no-undef-init": "error",
    "no-underscore-dangle": "error",
    "object-shorthand": "error",
    "prefer-const": "error",
    "no-restricted-imports": [
      "error",
      {
        // Lodash tree shaking isn"t working so directly importing lodash results in importing the whole library.
        // This rule should prevent importing the whole lodash library.
        // https://lodash.com/per-method-packages
        "paths": [
          {
            "name": "lodash",
            "message": "Please use lodash/{module} import instead"
          }
        ]
      }
    ],
    "import/no-extraneous-dependencies": ["off"],
    "padding-line-between-statements": [
      "error",
      {
        "blankLine": "always",
        "prev": "*",
        "next": "return"
      }
    ],
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
```

added `"lint": "eslint --ext=jsx,ts,tsx src"` in `shared/package.json`.
Ran `lerna run lint` and got following error:

```
Error: Error while loading rule '@typescript-eslint/prefer-nullish-coalescing': You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.
```

Without the line `"@typescript-eslint/prefer-nullish-coalescing": "error",`, `lerna run lint` works and return valid errors and warnings, and errors correctly show in VSCode. `lerna run lint:fix` also works fine.

Let's add `@typescript-eslint/prefer-nullish-coalescing` and fix the `parserOptions.project` issue.
Adding those lines in `.eslintrc`

```
  "parserOptions": {
    "project": ["./tsconfig.json"]
  },
```

Solved the issue (see <https://github.com/prettier/prettier-eslint/issues/201#issuecomment-901299351>)

**Only in VSCode**, in files, e.g `shared/src/utils/apiRoutes.ts`, we get an error message (note: we don't get it in `shared/src/shared.ts`)

```
Parsing error: "parserOptions.project" has been set for @typescript-eslint/parser.
The file does not match your project config: packages/shared/src/utils/apiRoutes.ts.
The file must be included in at least one of the projects provided.eslint
```

**Changing the names of these files solved the issue, WTF**. Restarting VSCode made the issue show up again, in the files with the new names.
This really seems to be an issue with VSCode, let's set that aside for now and move on.
Currently disabling `@typescript-eslint/prefer-nullish-coalescing` and removing `parserOptions.project`.

## Add nextjs barebones

```
yarn add -W react react-dom next next-transpile-modules
yarn add -D -W @types/next @types/react
cd packages && mkdir frontend && cd frontend && yarn init -y
```

Base `package.json`:

```
{
  "name": "@monorepo/frontend",
  "version": "1.0.0",
  "main": "index.js",
  "description": "> TODO: description",
  "license": "MIT",
  "dependencies": {
    "@monorepo/shared": "*" // this is important
  }
}
```

Add `tsconfig.json`

```
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "lib": ["dom", "dom.iterable", "esnext"],
    "noEmit": true
  },
  "include": ["./src"]
}
```

Add `.eslintrc.js` in `packages/frontend`:

```
module.exports = {
  extends: [
    '../../.eslintrc.js',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:jest-dom/recommended',
    'react-app',
    'plugin:jsx-a11y/recommended',
  ],
  parser: '@typescript-eslint/parser',
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
  plugins: ['jest-dom', 'testing-library', 'import', 'jsx-a11y', 'risxss'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-string-refs': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    // Specific NextJS accessibility config
    // Not necessary with NextJS links
    'jsx-a11y/anchor-is-valid': 'off',
    // Add alt attributes to NextJS Images
    'jsx-a11y/alt-text': [
      2,
      {
        img: ['Image'],
      },
    ],
    'risxss/catch-potential-xss-react': 'error',
    'react/display-name': 'off',
  },
};
```

And packages:

```
lerna add -D --scope=@monorepo/frontend eslint-plugin-react
lerna add -D --scope=@monorepo/frontend eslint-plugin-jest-dom
lerna add -D --scope=@monorepo/frontend eslint-config-next
lerna add -D --scope=@monorepo/frontend eslint-config-react-app
lerna add -D --scope=@monorepo/frontend eslint-plugin-react-app
lerna add -D --scope=@monorepo/frontend eslint-plugin-risxss
```

Note that in this case, the override works within VSCode and cli (at least when only `pages/_app.tsx` and `pages/index.tsx` exist).

Next step: import something from `@monorepo/shared`

First issue: if I add `import {} from '@monorepo/shared';` in `index.tsx`, I get an error message `Cannot find module '@monorepo/shared' or its corresponding type declarations`

I had to set `"main": "src/index.tsx"` in `packages/shared/package.json` to be able to do `import { toto } from '@monorepo/shared';`

However, at this point, there is no auto import, and I get an eslint error `Invalid type "any" of template literal expression.eslint@typescript-eslint/restrict-template-expressions)`

I will attempt to remove all node_modules and reinstall. It didn't work.

## VSCode auto import from shared

So, our next major challenge is to enable auto import from `@monorepo/shared`
Currently, if I start with `import {} from '@monorepo/shared';`, and then write `toto`, VSCode will correctly suggest that I import it from `@monorepo/shared`

I tried to update root `tsconfig.json`, for instance by adding

```
    "paths": {
      "@monorepo/shared": ["./packages/shared/src"]
    }
```

which didn't work.

Tried to clone <https://github.com/NiGhTTraX/ts-monorepo> to see if auto imports work there - they don't.

After hours of trying to fix this, I am temporarily giving up, as having a monorepo without this is still better than having separate repos.
For now, the best I've gotten is to have `import {} from '@monorepo/shared';` at the top of the file.

## Add jest

```
yarn add -D -W jest
```

Inital `jest.config.js` and `jest.config.base.js` from <https://github.com/facebook/jest/issues/3112#issuecomment-398581705>

Added a file in `frontend/tests/toto.test.ts`
Got ts errors `Unsafe call of any typed value` on jest keywords in VSCode. After reloading VSCode, errors disappear.

Added `"test": "jest"` in root `package.json`, which output is:

```
Validation Error:

  Module ts-jest in the transform option was not found.
         <rootDir> is: /home/jeremy/dev/jeremy/templates/lerna-repo

  Configuration Documentation:
  https://jestjs.io/docs/configuration
```

I run `yarn add -D -W ts-jest`, but then get

```
Validation Error:

  Directory /home/jeremy/dev/jeremy/templates/lerna-repo/src in the roots[0] option was not found.

  Configuration Documentation:
  https://jestjs.io/docs/configuration
```

So I updated `"test": "lerna run test"` in `package.json` and added `"test": "jest"` in `packages/frontend/package.json`
Now, if I run `yarn test` at the root, the test is run correctly in `frontend`.

For this setup, I declared a function `export const getToto = () => 'toto';`, and the test

```
import { getToto } from '../src/toto';

test('toto', () => {
  expect(getToto()).toEqual('toto');
});
```

Now, I'd like to test with importing something from `@monorepo/shared`. So I updated the function to

```
import { toto } from '@monorepo/shared';

export const getToto = () => toto;
```

And now, running jest, I get error:

```
Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    Here's what you can do:
     ??? If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     ??? If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     ??? To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     ??? If you need a custom transformation specify a "transform" option in your config.
     ??? If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configuration
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transformation

    Details:

    /home/jeremy/dev/jeremy/templates/lerna-repo/packages/shared/src/index.tsx:1
    ({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,jest){import { apiRoutes } from './utils/apiRoutes';
                                                                                      ^^^^^^

    SyntaxError: Cannot use import statement outside a module

    > 1 | import { toto } from '@monorepo/shared';
        | ^
      2 |
      3 | export const getToto = () => toto;
```

`Cannot use import statement outside a module` occurs if I forget to add `'^.+\\.ts$': 'ts-jest',` in `transform` in `jest.config.base.ts`,

So, is the error in `import { toto } from '@monorepo/shared';` linked to `import` or to `@monorepo/shared`? Let's import something else to find out.

If I add `frontend/src/titi.ts`, and `import { titi } from './titi';` in `toto.ts`, the test passes. Let's put back `import { toto } from '@monorepo/shared';`.

It... works?!

Let's remove `babel-jest` and `@babel/preset-env` from root `package.json` and see if it still works. It still works.

Let's commit what we have now, and go back to what we had before to really understand the issue.

This was our original error:

```
    /home/jeremy/dev/jeremy/templates/lerna-repo/packages/shared/src/index.tsx:1
    ({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,jest){import { apiRoutes } from './utils/apiRoutes';
```

It basically means that `shared/src/index.tsx` isn't a module for jest. Looking back at `jest.config.base.js` at that time, we had

```
transform: {
        "^.+\\.ts$": "ts-jest"
    },
```

Missing the line `'^.+\\.tsx$': 'ts-jest',`

## Summary

At this point, we have two packages: `frontend` and `shared`. `frontend` imports functions and constants from `shared`.
Both packages have `tsc`, `lint` and `test` enabled.
Next step: deploy `frontend` to vercel, before moving on to adding our next package: `mobile`.

## Adding public folder and importing image

First, we notice that since `next` isn't in our dependencies, we don't have auto-import for `next/image`. We'll look into that later.

However, when I try to do `import logo from 'public/vercel.svg';`, I get a TS error (but the code works in dev)

```
Cannot find module 'public/vercel.svg' or its corresponding type declarations
```

Since it is a ts error, it will prevent use from compiling and therefore deploying our code to Vercel, so we need to fix it.
I've tried adding `.babelrc`, as in my other nextjs monorepo, without success.
Adding `frontend/types/index.d.ts` with content

```
declare module '*.svg' {
  const component: React.FC<React.SVGProps<SVGSVGElement>>;

  export default component;
}
```

solved the TS issue.
However, we still get an eslint error `Unsafe assignment of an any value`, **only in VSCode**. Restarting VSCode doesn't solve the issue.
Adding `"eslint.workingDirectories": ["packages/frontend"]` in `.vscode/settings.json` solved the issue.

## Deploying next to vercel

Let's run `yarn build:vercel` locally. It runs successfully.
Let's deploy our repository to vercel. It worked on first try! :tada:

## Adding React Native

Following <https://docs.expo.dev/guides/monorepos/>
`expo init packages/mobile`, and select blank template
Create `metro.config.js`, update `package.json` as said in the docs.
Let's run `yarn dev:mobile` from root. We get

```
@monorepo/mobile: [18:47:56] Unable to resolve module react-native from /home/jeremy/dev/jeremy/templates/lerna-repo/node_modules/expo/build/Expo.fx.js: react-native could not be found within the project or in these directories:
@monorepo/mobile: [18:47:56]   ../../node_modules/expo/node_modules
@monorepo/mobile: [18:47:56]   ../../node_modules
```

The error message kind of makes sense, since `react-native` is in `packages/mobile/node_modules`. But why doesn't it look there?
However, looking at the source, of the error, we see the file tying to import `react-native` is `lerna-repo/node_modules/expo/build/Expo.fx.js`

Let's look at our `metro.config.js` in our other other monorepo. It is different. First, let's copy/paste it blindly and see what happens. Now we have another error:

```
@monorepo/mobile: [18:53:07] Unable to resolve module @babel/runtime/helpers/interopRequireDefault from /home/jeremy/dev/jeremy/templates/lerna-repo/packages/mobile/index.js: @babel/runtime/helpers/interopRequireDefault could not be found within the project or in these directories:
@monorepo/mobile: [18:53:07]   node_modules
@monorepo/mobile: [18:53:07]   node_modules
@monorepo/mobile: [18:53:07]   ../../node_modules
```

Multiple sources say to add `@babel/runtime` to `dependencies` to fix this. Let's try that. It didn't work.
Googling that error showed me that I encountered it before, if I had taken notes last time it would have been faster this time.
I tried to clear the cache with `expo r -c`, without success. Let's add `@babel/core`. Still doesn't work.
Let's delete all `node_modules` and try again. Still doesn't work.
Let's try adding `'module:metro-react-native-babel-preset'` to babel presets (because it is in the other monorepo). Still doesn't work.

Let's get back to the config suggested by expo and work from there.
Again, we get our error

```
@monorepo/mobile: [19:09:51] Unable to resolve module react-native from /home/jeremy/dev/jeremy/templates/lerna-repo/node_modules/expo/build/Expo.fx.js: react-native could not be found within the project or in these directories:
@monorepo/mobile: [19:09:51]   ../../node_modules/expo/node_modules
@monorepo/mobile: [19:09:51]   ../../node_modules
```

First, let's reword the file to have `module.exports = (...)`. Then, let's update `workspaceRoot` from `path.resolve(__dirname, '../..')` to `__dirname + '/../..'`

**All of the above didn't work, so I decided to go with the `expo-yarn-workspaces` route.**
Heavily inspired by <https://github.com/expo/expo/tree/master/packages/expo-yarn-workspaces>

```
lerna add --scope=@monorepo/mobile -D expo-yarn-workspaces
```

Add `"postinstall": "expo-yarn-workspaces postinstall"` in `packages/mobile/package.json`.
Updated `"bootstrap": "yarn install; lerna bootstrap; lerna run --scope=@monorepo/mobile postinstall",`
In root `package.json`, replace `"workspaces"` by

```
"workspaces": {
    "packages": [
      "packages/*"
    ],
    "nohoist": [
      "**/react-native",
      "**/react-native/**",
      "**/expo",
      "**/expo/**"
    ]
  }
```

We get error:

```
@monorepo/mobile: [21:08:23] Starting project at /home/jeremy/dev/jeremy/templates/lerna-repo/packages/mobile
@monorepo/mobile: [21:08:23] Developer tools running on http://localhost:19002
@monorepo/mobile: [21:08:25] Cannot find module 'metro-config/src/defaults/defaults'
```

`yarn add -W metro-config` to fix

At first, I used `metro.config.js` provided by `expo-yarn-workspaces`:

```
const { createMetroConfiguration } = require('expo-yarn-workspaces');

module.exports = createMetroConfiguration(__dirname);
```

And got error:

```
@monorepo/mobile: [21:13:26] Unable to resolve module react-native from /home/jeremy/dev/jeremy/templates/lerna-repo/node_modules/expo-status-bar/build/setStatusBarNetworkActivityIndicatorVisible.js: react-native could not be found within the project or in these directories:
@monorepo/mobile: [21:13:26]   ../../node_modules
@monorepo/mobile: [21:13:26]
@monorepo/mobile: [21:13:26] If you are sure the module exists, try these steps:
@monorepo/mobile: [21:13:26]  1. Clear watchman watches: watchman watch-del-all
@monorepo/mobile: [21:13:26]  2. Delete node_modules and run yarn install
@monorepo/mobile: [21:13:26]  3. Reset Metro's cache: yarn start --reset-cache
@monorepo/mobile: [21:13:26]  4. Remove the cache: rm -rf /tmp/metro-*
@monorepo/mobile: [21:13:26] > 1 | import { StatusBar } from 'react-native';
```

So, I took a bit of config from the other monorepo, and finally `metro.config.js` looks like

```
const { createMetroConfiguration } = require('expo-yarn-workspaces');

const path = require('path');

const config = createMetroConfiguration(__dirname);
const nodeModulesPaths = [path.resolve(path.join(__dirname, './node_modules'))];
config.resolver.nodeModulesPaths = nodeModulesPaths;

module.exports = config;
```

Which works (the app compiles and I can import `toto` from `@monorepo/shared`).
Auto-import is the same as in `frontend`.

To add jest, I copied the files from `frontend`. Amazing, it worked.

I now have a few eslint errors in vscode, in `.js` files where I use `require` (but I don't have them in `frontend`).
I tried adding `"packages/mobile", "packages/shared` in `.vscode/settings.json`, which didn't work.
It doesn't seem easy to fix, and honestly isn't that much of a big deal right now.

## Compiling React Native app

We are going to use EAS. First, I copied `eas.json` from my react native template:

```
{
  "cli": {
    "version": ">= 0.43.0"
  },
  "build": {
    "production": {
      "node": "16.13.0",
      "env": {
        "BASE_BACKEND_URL": "https://jeremyrdjangotemplate.herokuapp.com/"
      }
    },
    "productionApk": {
      "extends": "production",
      "android": {
        "buildType": "apk"
      }
    },
    "development": {
      "extends": "production",
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": { "extends": "production", "distribution": "internal" }
  },
  "submit": {
    "production": {}
  }
}
```

Per the `expo-yarn-workspaces` documentation, I should add the env variable `"ENTRY_FILE": "./__generated__/AppEntry.js"`
Let's add `"build:apk": "eas build --platform android --profile productionApk"` to `scripts` in `packages/mobile/package.json` and `"build:apk": "lerna run --scope=@monorepo/mobile --stream build:apk"` in root `package.json`
Got error

```
@monorepo/mobile: - Linking to project @jeremyr/mobile
@monorepo/mobile: ??? Created @jeremyr/mobile (???https://expo.dev/accounts/jeremyr/projects/mobile???) on Expo
@monorepo/mobile: ????  Android application id Learn more: https://expo.fyi/android-package
@monorepo/mobile:     Error: Input is required, but stdin is not readable.
```

This message seems to indicate that `eas` prompts things to the user. Let's build `yarn build:apk` from `packages/mobile`. It asked `Generate a new Android Keystore?`. Success!

Now that the build is done, let's try it again from the root. It works! :tada:

## Add Nest

Documentation about NestJs in this kind of monorepo doesn't seem super straightforward, as it was the case for Expo.
So let's start by creating a regular nest project with `nest new packages/backend`.

Let's start by adding `@monorepo/shared` to `backend/package.json`, and change the app name to `@monorepo/backend`.
The project actually comes with a lot of libraries installed, like eslint, prettier, ts.

If we run `yarn dev:backend`, we get a nice "Hello World!" on `localhost:3000`.
Let's try running the tests. Everything passes. Amazing.

Let's bootstrap the repo and try to import `toto` from shared.

If I put `import {} from '@monorepo/shared';` in `backend/src/app.service.ts`, I get ts error:

```
Module '@monorepo/shared' was resolved to '/home/jeremy/dev/jeremy/templates/lerna-repo/packages/shared/src/index.tsx', but '--jsx' is not set
```

Setting `"jsx": "preserve"` in `tsconfig.json` solves the issue (I also needed to restart VSCode). With that, auto import once `import {} from '@monorepo/shared';` is present works. Let's see if it works when running Nest. It. Does. Amazing.

But now, `jest` fails in `backend` with the classic `SyntaxError: Cannot use import statement outside a module`. Let's create a `jest.config.js` to try and fix that.

Now we get

```
Multiple configurations found:
    * /home/jeremy/dev/jeremy/templates/lerna-repo/packages/backend/jest.config.js
    * `jest` key in /home/jeremy/dev/jeremy/templates/lerna-repo/packages/backend/package.json

  Implicit config resolution does not allow multiple configuration files.
  Either remove unused config files or select one explicitly with `--config`.
```

Let's see if we can factorize all that.
With a bit of refactoring, I managed to extend `jest.config.base.js`, even in `backend/src/tests/jest-e2e.js`.

## Build NestJs

I tried to do `rimraf dist && nest build`, then `node dist/main`, and encountered an error:

```
@monorepo/backend: $ node dist/main
@monorepo/backend: /home/jeremy/dev/jeremy/templates/lerna-repo/packages/shared/src/index.tsx:1
@monorepo/backend: import { apiRoutes } from './utils/apiRoutes';
@monorepo/backend: ^^^^^^
@monorepo/backend: SyntaxError: Cannot use import statement outside a module
```

I wondered why it would try to import from `shared/src/index.tsx`, and not `shared/src/dist/index.jsx`, turns out it was because of `"main": "src/index.tsx",` in `shared/package/json`. I replaced it with `"main": "dist/src/index.jsx",` and boom, `node dist/main` works. :tada:

Let's see if I still have the hot reload in development.
By running the build command on watch mode in `shared`, we have hot reload on all apps. :tada:

## Summary

I have built a monorepo with 4 packages:

- backend, a barebones NestJs
- frontend, a barebones NextJs
- mobile, a barebones ReactNative
- shared, a module imported by the other 3

By running `yarn dev:shared`, `yarn dev:backend`, `yarn dev:frontend` and `yarn dev:mobile`, I have all 3 apps running with hot reload, including from shared.
I can build the apps (I need to check if I have add commands to build `shared` before building frontend on vercel, I think I do because `dist` shouldn't be in the repo), and deploy NextJs and React Native. I will work on deploying NestJs tomorrow.

Next steps:

- extend root `.eslintrc.js` in `backend`
- extend root `tsconfig.json` in `backend`
- fix build command on vercel
- dockerize backend, add postgres
- deploy backend on Heroku, link with a DB (start with this article <https://blog.tooljet.com/deploying-nest-js-application-on-heroku/>)
- verify I have installed all developer tools that are on my other templates
- start adding features

## Extend eslintrc and tsconfig in Nest

`.eslintrc.js` simply becomes

```
module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
};
```

`tsconfig.json` simply becomes

```
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "outDir": "./dist",
    "baseUrl": "./src",
    "incremental": true,
    "forceConsistentCasingInFileNames": false,
    "target": "es2017"
  },
  "include": ["./src"],
  "exclude": ["node_modules"]
}
```

## Fix build command on vercel

Let's try to push main again an see what happens. I expect the command to fail since `shared/dist` is in `.gitignore`.
The build indeed fails with message:

```
info  - Checking validity of types...
Failed to compile.
./src/pages/index.tsx:5:33
Type error: Cannot find module '@monorepo/shared' or its corresponding type declarations.
  3 | import logo from 'public/vercel.svg';
  4 |
> 5 | import { apiRoutes, toto } from '@monorepo/shared';
  6 |
  7 | console.log('hey');
  8 |
error Command failed with exit code 1.
```

Note: I could have simply deleted `shared/dist` locally and run `yarn build:vercel` to do it locally.
Let's build without deleting `shared/dist`. It worked. Let's remove `shared/dist` and see if we have the same error as in vercel.
We indeed have the same error message. Nice.
Let's add `yarn build:shared` at the beginning of `build:vercel`, and retry locally. It worked. Let's push and see what happens.
It works! :tada:

## Dockerize backend, add postgres

Let's add `docker-compose.yml` and `Dockerfile.local` to begin with. First, I create them at root so I can access `shared` from the dockerfile.

`docker-compose.yaml`

```
version: '3.7'

services:
  backend:
    container_name: backend
    build:
      context: .
      dockerfile: Dockerfile.local
    restart: always
    volumes:
      - ./:/usr/src/app
    ports:
      - '8000:3000'
    depends_on:
      - db

  db:
    image: postgres:10.6-alpine
    environment:
      - POSTGRES_DB=db-pg
      - POSTGRES_USER=db-pg
      - POSTGRES_PASSWORD=!ChangeMe!
    volumes:
      - db-data:/var/lib/postgresql/data:rw
    ports:
      - '5432:5432'

volumes:
  db-data: {}
```

`Dockerfile.local`

```
FROM node:14.18-alpine

RUN npm i -g lerna

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/
COPY lerna.json ./
RUN yarn install

RUN lerna bootstrap
COPY . .

CMD [ "yarn", "dev:backend" ]
```

With this configuration, we have hot reload on `backend`, and if we run `yarn dev:shared` in parallel, also hot reload on `shared`.
It is important to note that `WORKDIR` in dockerfile has the same path as `services.backend.volumes` in `docker-compose.yml` for hot reload to work, in our case we have:

```
services:
  backend:
    [...]
    volumes:
      - ./:/usr/src/app
```

And

```
WORKDIR /usr/src/app
```

The only other tweak I had to do is put `"@monorepo/shared": "file:../shared",` in `backend/package.json`. Let's check if it was necessary.
If I put it back as before, it works too.

Note: db seems to persist between up & down.

## Run NestJS with Dockerfile.prod

I created a `Dockerfile.prod`

```
FROM node:14.18-alpine

RUN npm i -g lerna

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/
COPY lerna.json ./
RUN yarn install

RUN lerna bootstrap
COPY . .

RUN yarn build:shared
RUN yarn build:backend

CMD [ "yarn", "backend:prod" ]
```

To build it, run `docker build -f Dockerfile.prod -t backend .`
To run it, run `docker run -d -p 3000:3000 backend`. Here, `-d` makes it run in detached mode, and `-p 3000:3000` tells docker to direct local port 3000 to port 3000 in the docker.
To stop it, run `docker ps -a` to get the `container_id`, then `docker kill <container_id>`.

## Deploy NestJS to Heroku

To deploy docker to heroku, first login and set the stack to `container`:

```
heroku login
heroku git:remote -a jeremyr-nestjs-docker
heroku stack:set container
heroku container:login
```

In Heroku, the process running must be `web`, otherwise we get these kinds of errors:

```
2022-01-19T12:56:13.678610+00:00 heroku[router]: at=error code=H14 desc="No web processes running" method=GET path="/" host=jeremyr-nestjs-docker.herokuapp.com request_id=54d4b8c3-ade8-45b5-9cf0-bcf9087f2412 fwd="109.5.248.128" dyno= connect= service= status=503 bytes= protocol=https
```

To push a dockerfile to heroku, run:

```
heroku container:push <process_type> --recursive --app <app_name>
```

Where `<process_type>` refers to both the name of the process running (therefore it must be called `web`), and the extension of the dockerfile (`Dockerfile.<process_type>`). So I had to rename `Dockerfile.prod` to `Dockerfile.web` to solve the above error.
After that, I encountered another error:

```
2022-01-19T13:27:26.237955+00:00 heroku[web.1]: Error R10 (Boot timeout) -> Web process failed to bind to $PORT within 60 seconds of launch
2022-01-19T13:27:26.283776+00:00 heroku[web.1]: Stopping process with SIGKILL
2022-01-19T13:27:26.434491+00:00 heroku[web.1]: Process exited with status 137
2022-01-19T13:27:26.664652+00:00 heroku[web.1]: State changed from starting to crashed
2022-01-19T13:27:29.888526+00:00 heroku[router]: at=error code=H10 desc="App crashed" method=GET path="/" host=jeremyr-nestjs-docker.herokuapp.com request_id=f90a9283-edf9-4f94-8002-c70bb8c26b29 fwd="109.5.248.128" dyno= connect= service= status=503 bytes= protocol=https
```

Which means that the application didn't bind to the port exposed by Heroku. To do so, we need to make a small change in `backend/src/main.ts`:

`await app.listen(process.env.PORT || 3000);` instead of `await app.listen(3000);`

Then, we can run

`heroku container:push web --recursive --app <app_name>`, or even `heroku container:push web --recursive`

And finally

`heroku container:release web`.

NestJs now runs on heroku! :tada:

You can check this with `heroku ps`, output should be something like

```
=== web (Free): /bin/sh -c node\ packages/backend/dist/src/main (1)
web.1: up 2022/01/19 14:41:25 +0100 (~ 13m ago)
```

## Next steps

Now that every app is deployed I will:

- add an ORM and a DB connexion for Nest
- check that all dev tools are setup
- start implementing features

## Cloning the repo

After I first cloned the repo, everything was working fine.
I cloned it again, and now `yarn dev:backend` fails with

```
@monorepo/backend: Error: Cannot find module '/home/jeremy/dev/jeremy/templates/lerna-repo-v1/packages/backend/dist/main'
@monorepo/backend:     at Function.Module._resolveFilename (internal/modules/cjs/loader.js:902:15)
@monorepo/backend:     at Function.Module._load (internal/modules/cjs/loader.js:746:27)
@monorepo/backend:     at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:76:12)
@monorepo/backend:     at internal/main/run_main_module.js:17:47
```

Let's try building the backend and retrying.

The output of `yarn build:backend` is strange, there is nothing in `dist` except `tsconfig.build.tsbuildinfo`.

I had added `"noEmit": true` in `backend/tsconfig.json`, which breaks Nest in dev and prod.

The fix was to remove it, and add the `--noEmit` flag to the tsc command in `backend/package.json`.

I also noticed an error when building the apk, eas couldn't find `@monorepo/shared`. I'm guessing it's because `dist` wasn't pushed to eas. Why did it work before? I don't know. Maybe I added it to `.gitignore` after its creation and it was pushed.

In any case, I fixed the issue by adding `"eas-build-post-install": "cd ../.. && yarn build:shared",` in `mobile/package.json`, which is triggered after eas installs dependencies.
