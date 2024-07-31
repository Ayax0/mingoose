import { WithId } from "mongodb";
import { Model } from "../model";
import { z } from "zod";

export type InferRawModel<T extends Model<any>> = WithId<z.infer<T["schema"]>>;
