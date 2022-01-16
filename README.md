# Readme

All steps followed to make this work:

## Initial setup

yarn add typescript -D -W
yarn add @types/node -D -W

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
