import type {
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
  OptionalUnlessRequiredId,
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
  Output extends Document = Document,
  Input = Output,
> {
  "pre:deleteMany": (
    filter?: Filter<Output>,
    options?: DeleteOptions,
  ) => void | Promise<void>;
  "post:deleteMany": (result: DeleteResult) => void | Promise<void>;
  "pre:deleteOne": (
    filter?: Filter<Output>,
    options?: DeleteOptions,
  ) => void | Promise<void>;
  "post:deleteOne": (result: DeleteResult) => void | Promise<void>;
  "pre:find": (
    filter?: Filter<Output>,
    options?: FindOptions<Output>,
  ) => void | Promise<void>;
  "post:find": (result: FindCursor<WithId<Output>>) => void | Promise<void>;
  "pre:findOne": (
    filter?: Filter<Output>,
    options?: FindOptions<Output>,
  ) => void | Promise<void>;
  "post:findOne": (
    result: Output | WithId<Output> | null,
  ) => void | Promise<void>;
  "pre:findOneAndDelete": (
    filter: Filter<Output>,
    options?: FindOneAndDeleteOptions,
  ) => void | Promise<void>;
  "post:findOneAndDelete": (
    result: WithId<Output> | ModifyResult<Output> | null,
  ) => void | Promise<void>;
  "pre:findOneAndReplace": (
    filter: Filter<Output>,
    replacement: WithoutId<Output>,
    options?: FindOneAndReplaceOptions,
  ) => void | Promise<void>;
  "post:findOneAndReplace": (
    result: ModifyResult<Output> | WithId<Output> | null,
  ) => void | Promise<void>;
  "pre:findOneAndUpdate": (
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options?: FindOneAndUpdateOptions,
  ) => void | Promise<void>;
  "post:findOneAndUpdate": (
    result: WithId<Output> | ModifyResult<Output> | null,
  ) => void | Promise<void>;
  "pre:insertMany": (
    docs: OptionalUnlessRequiredId<Output>[],
    options?: BulkWriteOptions,
  ) => void | Promise<void>;
  "post:insertMany": (result: InsertManyResult<Output>) => void | Promise<void>;
  "pre:insertOne": (
    doc: OptionalUnlessRequiredId<Output>,
    options?: BulkWriteOptions,
  ) => void | Promise<void>;
  "post:insertOne": (result: InsertOneResult<Output>) => void | Promise<void>;
  "pre:updateMany": (
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options?: UpdateOptions,
  ) => void | Promise<void>;
  "post:updateMany": (result: UpdateResult<Output>) => void | Promise<void>;
  "pre:updateOne": (
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options?: UpdateOptions,
  ) => void | Promise<void>;
  "post:updateOne": (result: UpdateResult<Output>) => void | Promise<void>;
  "pre:validate": (doc: Input) => void | Promise<void>;
  "post:validate": (result: Output) => void | Promise<void>;
  "pre:validateWithoutId": (doc: WithoutId<Input>) => void | Promise<void>;
  "post:validateWithoutId": (doc: WithoutId<Output>) => void | Promise<void>;
  "validate:error": (error: unknown) => void | Promise<void>;
}

export interface TestHooks {
  test: (input: string) => number | Promise<number>;
  test2: (input: string) => number | Promise<number>;
}
