import { z } from "zod";
import { ObjectId } from "mongodb";
import type { ObjectIdLike } from "../types/mongodb";

export function objectId() {
  return z
    .custom<ObjectIdLike>((id) => ObjectId.isValid(id))
    .transform<ObjectId>((id) => new ObjectId(id));
}
