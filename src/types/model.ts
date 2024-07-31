import { WithId } from "mongodb";
import { Model } from "../model";
import { z } from "zod";

// biome-ignore lint/suspicious/noExplicitAny: any is required
export type InferModelType<T extends Model<any, any>> = WithId<
  z.infer<T["schema"]>
>;
