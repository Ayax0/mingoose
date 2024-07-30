import { ObjectId } from "mongodb";
import { monfox, z } from "../src";

async function run() {
  try {
    const db = monfox("mongodb://localhost:27017/test");

    const schema = db.defineModel(
      "input",
      z.object({
        name: z.string(),
        age: z.number(),
        reference: z.objectId(),
        sub: z.object({
          test: z.string(),
        }),
      })
    );

    schema.hooks.hook("post:insertOne", (doc) => console.log(doc));

    schema.insertOne({
      name: "test",
      age: 18,
      reference: new ObjectId(),
      sub: {
        test: "hallo",
      },
    });

    schema.findOne();
  } catch (error) {
    console.error("db connection failed.", error);
  }
}

run();
