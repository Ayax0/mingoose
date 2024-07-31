import { ObjectId } from "mongodb";
import { z } from "zod";

export const objectId = () =>
  z
    .instanceof(ObjectId)
    .or(
      z.string().transform((val, ctx) => {
        if (ObjectId.isValid(val)) return new ObjectId(val);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "invalide objectId",
        });
        return z.NEVER;
      }),
    )
    .or(
      z.number().transform((val, ctx) => {
        if (ObjectId.isValid(val)) return ObjectId.createFromTime(val);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "invalide objectId",
        });
        return z.NEVER;
      }),
    );
