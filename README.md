# Readme

All steps followed to make this work:

yarn add typescript -D -W
yarn add @types/node -D -W

Root tsconfig from <https://www.baltuta.eu/posts/typescript-lerna-monorepo-the-setup> and `references` from <https://cryogenicplanet.tech/posts/typescript-monorepo>

lerna create shared with following initial package.json

```
{
  "name": "shared",
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
