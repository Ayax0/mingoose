import type {
  BSON,
  BulkWriteOptions,
  DeleteOptions,
  DeleteResult,
  Document,
  Filter,
  FindCursor,
  FindOneAndDeleteOptions,
  FindOneAndReplaceOptions,
  FindOneAndUpdateOptions,
  FindOptions,
  InsertManyResult,
  InsertOneResult,
  ModifyResult,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithId,
  WithoutId,
} from "mongodb";

export interface MingooseHooks {
  open: () => void | Promise<void>;
  close: () => void | Promise<void>;
  error: (error: Error) => void | Promise<void>;
}

export interface ModelHooks<
  DocType extends Document = Document,
  InputDocType = DocType,
> {
  "pre:deleteMany": (
    filter?: Filter<DocType>,
    options?: DeleteOptions,
  ) => void | Promise<void>;
  "post:deleteMany": (result: DeleteResult) => void | Promise<void>;
  "pre:deleteOne": (
    filter?: Filter<DocType>,
    options?: DeleteOptions,
  ) => void | Promise<void>;
  "post:deleteOne": (result: DeleteResult) => void | Promise<void>;
  "pre:find": (
    filter?: Filter<DocType>,
    options?: FindOptions<DocType>,
  ) => void | Promise<void>;
  "post:find": (result: FindCursor<WithId<DocType>>) => void | Promise<void>;
  "pre:findOne": (
    filter?: Filter<DocType>,
    options?: FindOptions<DocType>,
  ) => void | Promise<void>;
  "post:findOne": (
    result: DocType | WithId<DocType> | null,
  ) => void | Promise<void>;
  "pre:findOneAndDelete": (
    filter: Filter<DocType>,
    options?: FindOneAndDeleteOptions,
  ) => void | Promise<void>;
  "post:findOneAndDelete": (
    result: WithId<DocType> | ModifyResult<DocType> | null,
  ) => void | Promise<void>;
  "pre:findOneAndReplace": (
    filter: Filter<DocType>,
    replacement: WithoutId<DocType>,
    options?: FindOneAndReplaceOptions,
  ) => void | Promise<void>;
  "post:findOneAndReplace": (
    result: ModifyResult<DocType> | WithId<DocType> | null,
  ) => void | Promise<void>;
  "pre:findOneAndUpdate": (
    filter: Filter<DocType>,
    update: UpdateFilter<DocType>,
    options?: FindOneAndUpdateOptions,
  ) => void | Promise<void>;
  "post:findOneAndUpdate": (
    result: WithId<DocType> | ModifyResult<DocType> | null,
  ) => void | Promise<void>;
  "pre:insertMany": (
    docs: InputDocType[],
    options?: BulkWriteOptions,
  ) => void | Promise<void>;
  "post:insertMany": (
    result: InsertManyResult<DocType>,
  ) => void | Promise<void>;
  "pre:insertOne": (
    doc: InputDocType,
    options?: BulkWriteOptions,
  ) => void | Promise<void>;
  "post:insertOne": (result: InsertOneResult<DocType>) => void | Promise<void>;
  "pre:updateMany": (
    filter: Filter<DocType>,
    update: UpdateFilter<DocType> | BSON.Document[],
    options?: UpdateOptions,
  ) => void | Promise<void>;
  "post:updateMany": (result: UpdateResult<DocType>) => void | Promise<void>;
  "pre:updateOne": (
    filter: Filter<DocType>,
    update: UpdateFilter<DocType> | BSON.Document[],
    options?: UpdateOptions,
  ) => void | Promise<void>;
  "post:updateOne": (result: UpdateResult<DocType>) => void | Promise<void>;
  "pre:validate": (doc: InputDocType) => void | Promise<void>;
  "post:validate": (result: DocType) => void | Promise<void>;
  "validate:error": (error: unknown) => void | Promise<void>;
}
