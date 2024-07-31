import { ObjectId } from "mongodb";
import type { WithId } from "mongodb";
import type { ObjectIdLike } from "../types";

export function parseObjectIdLike<DocType>(id: ObjectIdLike) {
  return { _id: new ObjectId(id) as WithId<DocType>["_id"] };
}
