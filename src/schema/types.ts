import { ObjectId } from "mongodb";
import { z } from "zod";

export const schema = (shape: z.ZodRawShape, params?: z.RawCreateParams) =>
  z.object({ _id: objectId(), ...shape }, params);

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

export type ZodObjectId = ReturnType<typeof objectId>;
export type ZodObjectId2 = z.ZodUnion<
  [
    z.ZodUnion<
      [
        z.ZodType<ObjectId, z.ZodTypeDef, ObjectId>,
        z.ZodEffects<z.ZodString, ObjectId, string>,
      ]
    >,
    z.ZodEffects<z.ZodNumber, ObjectId, number>,
  ]
>;
