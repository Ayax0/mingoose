import { createMingoose, defineModel, objectId } from "../src";
import { z } from "zod";
// import type { MatchOptions } from "../src/types/aggregation";

async function run() {
  const db = createMingoose("mongodb://admin:password@localhost:27017");
  db.hooks.hook("open", () => console.log("db connected"));
  db.hooks.hook("error", () => console.error("db error"));
  db.hooks.hook("close", () => console.log("db connection closed"));
  await db.connect();

  const user = defineModel(
    db,
    z.object({
      _id: objectId().optional(),
      username: z.string(),
      password: z.string(),
      reference: objectId()
    }),
    "user"
  );

  // user.insertOne({
  //   username: "TestUser2",
  //   password: "test123",
  //   reference: 0
  // });

  // const match: MatchOptions<{ name: string }> = {  };

  // user.find({})

  
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