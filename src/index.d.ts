import { ObjectId } from "mongodb";

declare module "zod" {
  namespace z {
    export function objectId(): z.ZodType<
      string | ObjectId,
      z.ZodTypeDef,
      string | ObjectId
    >;
  }
}
