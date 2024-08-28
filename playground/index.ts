import { createMingoose, defineModel, objectId } from "../src";
import { z } from "zod";
import { QueryBuilder } from "../src/aggregation/queryBuilder";

async function run() {
  const db = createMingoose("mongodb://admin:password@localhost:27017");
  db.hooks.hook("open", () => console.log("db connected"));
  db.hooks.hook("error", () => console.error("db error"));
  db.hooks.hook("close", () => console.log("db connection closed"));
  await db.connect();

  const schema = z.object({
    _id: objectId().optional(),
    username: z.string(),
    password: z.string(),
    reference: objectId()
  });

  const user = defineModel(
    db,
    schema,
    "user"
  );

  const test = new QueryBuilder<z.infer<typeof schema>>().match().exec();
  type test2 = typeof test;
  
  const out = await user.collection.aggregate().match({
    username: "TestUser2"
  })
  .lookup({
    from: user.collection.collectionName,
    localField: "reference",
    foreignField: "_id",
    as: "reference"
  })
  .unwind("$reference")
  .next();

  console.log(out);
}

run();