# Readme

This is a monorepo built using Lerna, Yarn workspaces, Typescript, Eslint and Jest.

It contains four packages:

- `shared` for code shared between other packages
- `backend`, a NestJS backend
- `frontend`, a NextJS frontend
- `mobile`, a React Native app built with Expo

With following features:

- everything is written in Typescript
- all packages have jest, eslint and typechecking
- all packages (except `shared`) can import stuff from `shared`, with correct typechecking. If suggestions don't show up as they should, try adding `import {} from '@monorepo/shared'` at the top of a file.

## Local Development

### Requirements

Node >= 14.

Lerna `npm install -g lerna`.

EAS `npm install -g eas-cli`.

[Expo Go](https://expo.dev/client) to develop on mobile.

### Setup

`yarn bootstrap` at the root of the repo.

### Dev

From the root, (I suggest running those commands in separate terminal windows):

```
yarn dev:shared # start with this one, otherwise other packages will miss the dependency
docker-compose up --build
yarn dev:frontend
yarn dev:mobile
```

By default, frontend listens on `localhost:3000` and backend on `localhost:8000`.

## Tests

`yarn test` at the root.

## Lint

`yarn lint` at the root.

## Typechecking

`yarn tsc` at the root.

## Deployment

### Frontend

Using [Vercel](https://vercel.com/new), create a new project, override:

- Build Comand with `yarn build:vercel`
- Install Command with `yarn bootstrap`

### Backend

Using [Heroku](https://dashboard.heroku.com/apps), create a new projet, then

```
heroku login
heroku git:remote -a <project_name>
heroku stack:set container
heroku container:login
heroku container:push web --recursive --app <app_name>
heroku container:release web
```

### Mobile

#### Requirements

If you haven't already, run `yarn bootstrap`.

We use Expo and EAS to build the mobile app, so if you haven't already, login to EAS `eas login`.

#### Build

For your **first build**, you can't run `yarn build:apk` from the root because EAS will prompt you for a new Android Keystore.

So, simply run `cd packages/mobile && yarn build:apk`

For subsequent builds, you can run `yarn build:apk` from the root.
