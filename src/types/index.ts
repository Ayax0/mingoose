import type { ObjectId, WithId } from "mongodb";
import type { z } from "zod";
import type { Model } from "../model";

export type ObjectIdLike = string | number | ObjectId | Uint8Array;

// biome-ignore lint/suspicious/noExplicitAny: any is required
export type InferModelType<T extends Model<any, any>> = WithId<
  z.infer<T["schema"]>
>;
