import type { Condition, WithId } from "mongodb";

type Filter<TSchema> = {
  [P in keyof WithId<TSchema>]?: Condition<WithId<TSchema>[P]>;
} & RootFilterOperators<WithId<TSchema>>;

interface RootFilterOperators<TSchema> extends Document {
  $and?: Filter<TSchema>[];
  $nor?: Filter<TSchema>[];
  $or?: Filter<TSchema>[];
  $text?: {
    $search: string;
    $language?: string;
    $caseSensitive?: boolean;
    $diacriticSensitive?: boolean;
  };
  $comment?: string | Document;
}

export type MatchOptions<TSchema> = {
  [P in keyof WithId<TSchema>]?: Condition<WithId<TSchema>[P]>;
} & RootFilterOperators<WithId<TSchema>>;

//  | "$near" | "$nearSphere"
