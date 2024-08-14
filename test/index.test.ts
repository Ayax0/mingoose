import { ObjectId } from "mongodb";
import type { InsertOneResult } from "mongodb";
import { describe, it } from "vitest";
import { z } from "zod";
import { Types, createMingoose, defineModel, objectId } from "../src";
import type { Mingoose, Model, ObjectIdLike } from "../src";
import waitForHook from "./utils.ts/waitForHook";

interface User {
  name: string;
  age: number;
  reference: ObjectId;
}

interface UserInput {
  name: string;
  age: number;
  reference: ObjectIdLike;
}

let db: Mingoose;
let user: Model<User, UserInput>;
let insert: InsertOneResult<User>;

describe("mingoose", () => {
  it("connect to server", async ({ expect }) => {
    db = createMingoose(globalThis.__MONGO_URI__);
    db.connect();

    expect(await waitForHook(db.hooks, "open", 3000)).toBeTruthy();
  });

  it("define schema", ({ expect }) => {
    user = defineModel(
      db,
      z.object({
        _id: objectId(),
        name: z.string(),
        age: z.number(),
        reference: Types.objectId(),
      }),
    );

    expect(user.schema).toBeDefined();
  });

  it("insert document", async ({ expect }) => {
    insert = await user.insertOne({
      name: "Test",
      age: 20,
      reference: new ObjectId(),
    });

    expect(insert.insertedId).toBeDefined();
  });

  it("find document by id", async ({ expect }) => {
    const doc = await user.findById(insert.insertedId);
    expect(doc?.name).toBe("Test");
  });

  it("update document by id", async ({ expect }) => {
    const doc = await user.findByIdAndUpdate(insert.insertedId, {
      $set: { name: "Test2" },
    });
    expect(doc?.name).toBe("Test2");
  });

  it("replace document by id", async ({ expect }) => {
    const doc = await user.findByIdAndReplace(insert.insertedId, {
      name: "Test3",
      age: 24,
      reference: new ObjectId(),
    });

    expect(doc?.name).toBe("Test3");
  });

  it("delete document by id", async ({ expect }) => {
    const res = await user.findByIdAndDelete(insert.insertedId, {
      includeResultMetadata: true,
    });
    expect(res.ok).toBe(1);
  });
});
