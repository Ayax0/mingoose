import { ObjectId } from "mongodb";
import type { InsertOneResult } from "mongodb";
import { describe, it } from "vitest";
import { z } from "zod";
import { Types, createMingoose, defineModel, objectId } from "../src";
import type { Mingoose, Model, ZodObjectId } from "../src";
import waitForHook from "./utils.ts/waitForHook";

const schema = z.object({
  _id: objectId().optional(),
  name: z.string(),
  age: z.number(),
  reference: Types.objectId(),
});

type UserRawShape = typeof schema.shape;
type UserOutput = z.objectOutputType<UserRawShape, z.ZodTypeAny>;
type UserInput = z.objectInputType<UserRawShape, z.ZodTypeAny>;

let db: Mingoose;
let user: Model<
  // @ts-expect-error: i dont know what i'm doing here
  UserRawShape,
  "strip",
  z.ZodTypeAny,
  UserOutput,
  UserInput,
  ZodObjectId
>;
let insert: InsertOneResult<UserOutput>;

describe("mingoose", () => {
  it("connect to server", async ({ expect }) => {
    db = createMingoose(globalThis.__MONGO_URI__);
    db.connect();

    expect(await waitForHook(db.hooks, "open", 3000)).toBeTruthy();
  });

  it("define schema", ({ expect }) => {
    user = defineModel(db, schema);

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
