import { ObjectId } from "mongodb";
import { z } from "zod";

(z as any).objectId = () =>
  z
    .custom<string | ObjectId>((id) => ObjectId.isValid(id))
    .transform((id) => (typeof id === "string" ? new ObjectId(id) : id));

export { z, z as default } from "zod";
