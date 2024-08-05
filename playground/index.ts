import { createMingoose, defineModel, objectId } from "../src";
import { z } from "zod";

async function run() {
  const db = createMingoose("http://localhost:27017");
  db.hooks.hook("open", () => console.log("db connected"));
  db.hooks.hook("error", () => console.error("db error"));
  await db.connect();

  const user = defineModel(
    db,
    z.object({
      username: z.string(),
      password: z.string(),
      reference: objectId()
    })
  );

  const insert = await user.insertOne({
    username: "TestUser",
    password: "12345678",
    reference: "ssfddsf",
  });

  const doc = await user.findById(insert.insertedId);
  console.log(doc);
}

run();
