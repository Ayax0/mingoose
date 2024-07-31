import type {
  FindOneAndReplaceOptions,
  FindOneAndUpdateOptions,
} from "mongodb";

export const defaultReplaceOptions = <FindOneAndReplaceOptions>{
  returnDocument: "after",
};

export const defaultUpdateOptions = <FindOneAndUpdateOptions>{
  returnDocument: "after",
};
