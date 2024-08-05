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
      _id: objectId(),
      username: z.string(),
      password: z.string(),
      reference: objectId()
    })
  );

  const schema = z.object({
    _id: objectId().optional(),
    username: z.string(),
    password: z.string(),
    reference: objectId()
  });

  const schema2 = schema.omit({ _id: true });
  type test = z.output<typeof schema2>;

  interface Test {
    _id: string;
    username: string;
  }

  const insert = await user.insertOne({
    username: "TestUser",
    password: "12345678",
    reference: "ssfddsf",
  });

  const doc = await user.findById(insert.insertedId);
  console.log(doc);
}

run();
