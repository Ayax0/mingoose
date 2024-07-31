import type { ObjectId, WithId } from "mongodb";
import { Model } from "../model";
import { z } from "zod";

export type ObjectIdLike = string | number | ObjectId | Uint8Array;

// biome-ignore lint/suspicious/noExplicitAny: any is required
export type InferModelType<T extends Model<any, any>> = WithId<
  z.infer<T["schema"]>
>;
