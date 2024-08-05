import { ObjectId } from "mongodb";
import type { ObjectIdLike } from "../types";

export function parseObjectIdLike(id: ObjectIdLike) {
  if (typeof id === "string") return new ObjectId(id);
  if (typeof id === "number") return ObjectId.createFromTime(id);
  return id;
}
