# Mingoose

<!-- automd:badges color=yellow license name="@nextlvlup/mingoose" bundlephobia -->

[![npm version](https://img.shields.io/npm/v/@nextlvlup/mingoose?color=yellow)](https://npmjs.com/package/@nextlvlup/mingoose)
[![npm downloads](https://img.shields.io/npm/dm/@nextlvlup/mingoose?color=yellow)](https://npmjs.com/package/@nextlvlup/mingoose)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@nextlvlup/mingoose?color=yellow)](https://bundlephobia.com/package/@nextlvlup/mingoose)
[![license](https://img.shields.io/github/license/Ayax0/mingoose?color=yellow)](https://github.com/Ayax0/mingoose/blob/main/LICENSE)

<!-- /automd -->

This package is a minimal MongoDB client heavily inspired by mongoose. It was developed with first-party Typescript support in mind and is intended to make it easier to define strongly typed database models using Zod in order to reuse them in other parts of the application. This package is by no means feature complete.

## Usage

Install package:

<!-- automd:pm-install -->

```sh
# ✨ Auto-detect
npx nypm install @nextlvlup/mingoose

# npm
npm install @nextlvlup/mingoose

# yarn
yarn add @nextlvlup/mingoose

# pnpm
pnpm install @nextlvlup/mingoose

# bun
bun install @nextlvlup/mingoose
```

<!-- /automd -->

Import:

<!-- automd:jsimport cjs cdn name="@nextlvlup/mingoose" imports="createMingoose,defineModel" -->

**ESM** (Node.js, Bun)

```js
import { createMingoose, defineModel } from "@nextlvlup/mingoose";
```

**CommonJS** (Legacy Node.js)

```js
const { createMingoose, defineModel } = require("@nextlvlup/mingoose");
```

**CDN** (Deno, Bun and Browsers)

```js
import {
  createMingoose,
  defineModel,
} from "https://esm.sh/@nextlvlup/mingoose";
```

<!-- /automd -->

Open Connection:

```ts
import { createMingoose } from "@nextlvlup/mingoose";

const db = createMingoose("mongodb://myuser:mypassword@localhost:27017/mydatabase");
db.hooks.hook("open", () => console.log("db connected"));
db.hooks.hook("error", (error) => console.log("db error:", error));
db.hooks.hook("close", () => console.log("db connection closed"));
await db.connect();
```

Define Model:

```ts
import { objectId, defineModel } from "@nextlvlup/mingoose";
import { z } from "zod";

const schema = z.object({
  // the _id field must be defined and it must be optional.
  _id: objectId().optional(),
  username: z.string(),
  password: z.string(),
  permissionLevel: z.number().default(0)
});

const userDb = defineModel(db, schema);

userDb.find();
userDb.findById();
userDb.findByIdAndDelete();
userDb.findByIdAndUpdate();
userDb.findOne();
userDb.findOneAndDelete();
userDb.findOneAndReplace();
userDb.findOneAndUpdate();
userDb.insertMany();
userDb.insertOne();
userDb.updateMany();
userDb.updateOne();
userDb.count();

userDb.hooks.hook("pre:find", (filter, options) => {});
userDb.hooks.hook("post:find", (result) => {});
```

## Features

- Schema validation
  - ✅ insert
  - ✅ replace
  - ❌ update
- Hooks
  - ✅ pre
  - ✅ post
- Middleware
  - ❌ pre
  - ❌ post

### Hooks
The hooks are not intended as middleware. They can be used to execute additional actions, but the hooks cannot be used to influence the action itself.

## Development

<details>

<summary>local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

</details>

## License

<!-- automd:contributors license=MIT -->

Published under the [MIT](https://github.com/Ayax0/mingoose/blob/main/LICENSE) license.
Made by [community](https://github.com/Ayax0/mingoose/graphs/contributors) 💛
<br><br>
<a href="https://github.com/Ayax0/mingoose/graphs/contributors">
<img src="https://contrib.rocks/image?repo=Ayax0/mingoose" />
</a>

<!-- /automd -->

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
