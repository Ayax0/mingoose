import { ObjectId } from "mongodb";
import { db } from "./db";
import user from "./models/user";

async function run() {
  db.hooks.hook("open", () => console.log("db connected"));
  db.hooks.hook("error", () => console.error("db error"));
  await db.connect();

  const insert = await user.insertOne({
    username: "TestUser",
    password: "12345678",
    reference: new ObjectId(),
  });

  const doc = await user.findById(insert.insertedId);
  console.log(doc);
}

run();
