# Readme

All steps followed to make this work:

## Initial setup

```
yarn add typescript -D -W
yarn add @types/node -D -W
yarn add -D -W ts-node
```

Root tsconfig from <https://www.baltuta.eu/posts/typescript-lerna-monorepo-the-setup> and `references` from <https://cryogenicplanet.tech/posts/typescript-monorepo>

## Create shared package

lerna create shared with following initial package.json

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

At this point, `lerna run start` **should** build files in shared. Let's try it
We get an error

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

yarn add -W react react-dom next next-transpile-modules
yarn add -D -W @types/next @types/react
cd packages && mkdir frontend && cd frontend && yarn init -y

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
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

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
