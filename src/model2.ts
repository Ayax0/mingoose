import { createHooks, type Hookable } from "hookable";
import {
  Collection,
  type FindOneAndDeleteOptions,
  type ModifyResult,
  type Filter,
  type FindCursor,
  type FindOptions,
  type WithId,
  type WithoutId,
  type FindOneAndReplaceOptions,
  type ObjectId,
  type UpdateFilter,
  type FindOneAndUpdateOptions,
  type BulkWriteOptions,
  type InsertManyResult,
  type OptionalUnlessRequiredId,
  type InsertOneOptions,
  type InsertOneResult,
  type UpdateOptions,
  type UpdateResult,
} from "mongodb";
import { z } from "zod";
import type { ModelHooks } from "./types/hooks";
import type { Mingoose } from "./types/mingoose";

export class Model<
  ZodRawShape extends z.ZodRawShape & { [K in "_id"]: IdType },
  UnknownKeys extends z.UnknownKeysParam,
  Catchall extends z.ZodTypeAny,
  Output extends z.objectOutputType<ZodRawShape, Catchall, UnknownKeys>,
  Input extends z.objectInputType<ZodRawShape, Catchall, UnknownKeys>,
  IdType = ObjectId,
> {
  private collection: Collection<Output>;

  schema: z.ZodObject<ZodRawShape, UnknownKeys, Catchall, Output, Input>;
  hooks: Hookable<ModelHooks<Output, Input>>;

  constructor(
    mingoose: Mingoose,
    schema: z.ZodObject<ZodRawShape, UnknownKeys, Catchall, Output, Input>,
    name: string,
  ) {
    // @ts-expect-error: missing type definition
    // biome-ignore format: ts-expect
    this.collection = new Collection(mingoose._client.db(), pluralize(name));
    this.schema = schema;
    this.hooks = createHooks();
  }

  validate(doc: Input): Output {
    return this.schema.parse(doc);
  }

  validateWithoutId(doc: WithoutId<Input>): WithoutId<Output> {
    return this.schema
      .extend({ _id: z.never() })
      .omit({ _id: true })
      .parse(doc) as WithoutId<Output>;
  }

  findById(_id: IdType, options?: FindOptions<Output>) {
    const _filter = { _id } as Filter<Output>;
    return this.findOne(_filter, options);
  }

  findByIdAndDelete(
    _id: IdType,
    options: FindOneAndDeleteOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  findByIdAndDelete(
    _id: IdType,
    options: FindOneAndDeleteOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  findByIdAndDelete(
    _id: IdType,
    options: FindOneAndDeleteOptions,
  ): Promise<WithId<Output> | null>;
  findByIdAndDelete(_id: IdType): Promise<WithId<Output> | null>;
  findByIdAndDelete(
    _id: IdType,
    options?: FindOneAndDeleteOptions,
  ): Promise<WithId<Output> | ModifyResult<Output> | null> {
    const _filter = { _id } as Filter<Output>;
    return options
      ? this.findOneAndDelete(_filter, options)
      : this.findOneAndDelete(_filter);
  }

  async findByIdAndReplace(
    _id: IdType,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  async findByIdAndReplace(
    _id: IdType,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  async findByIdAndReplace(
    _id: IdType,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions,
  ): Promise<WithId<Output> | null>;
  async findByIdAndReplace(
    _id: IdType,
    replacement: WithoutId<Input>,
  ): Promise<WithId<Output> | null>;
  async findByIdAndReplace(
    _id: IdType,
    replacement: WithoutId<Input>,
    options?: FindOneAndReplaceOptions,
  ): Promise<ModifyResult<Output> | WithId<Output> | null> {
    const _filter = { _id } as Filter<Output>;
    return options
      ? this.findOneAndReplace(_filter, replacement, options)
      : this.findOneAndReplace(_filter, replacement);
  }

  findByIdAndUpdate(
    _id: IdType,
    update: UpdateFilter<Output>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  findByIdAndUpdate(
    _id: IdType,
    update: UpdateFilter<Output>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  findByIdAndUpdate(
    _id: IdType,
    update: UpdateFilter<Output>,
    options: FindOneAndUpdateOptions,
  ): Promise<WithId<Output> | null>;
  findByIdAndUpdate(
    _id: IdType,
    update: UpdateFilter<Output>,
  ): Promise<WithId<Output> | null>;
  findByIdAndUpdate(
    _id: IdType,
    update: UpdateFilter<Output>,
    options?: FindOneAndUpdateOptions,
  ): Promise<WithId<Output> | ModifyResult<Output> | null> {
    const _filter = { _id } as Filter<Output>;
    return options
      ? this.findOneAndUpdate(_filter, update, options)
      : this.findOneAndUpdate(_filter, update);
  }

  find(
    filter?: Filter<Output>,
    options?: FindOptions<Output>,
  ): FindCursor<WithId<Output>> {
    return filter
      ? this.collection.find(filter, options)
      : this.collection.find();
  }

  findOne(
    filter?: Filter<Output>,
    options?: FindOptions,
  ): Promise<WithId<Output> | null> {
    return filter
      ? this.collection.findOne(filter, options)
      : this.collection.findOne();
  }

  async findOneAndDelete(
    filter: Filter<Output>,
    options: FindOneAndDeleteOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  async findOneAndDelete(
    filter: Filter<Output>,
    options: FindOneAndDeleteOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  async findOneAndDelete(
    filter: Filter<Output>,
    options: FindOneAndDeleteOptions,
  ): Promise<WithId<Output> | null>;
  async findOneAndDelete(
    filter: Filter<Output>,
  ): Promise<WithId<Output> | null>;
  async findOneAndDelete(
    filter: Filter<Output>,
    options?: FindOneAndDeleteOptions,
  ): Promise<WithId<Output> | ModifyResult<Output> | null> {
    return options
      ? this.collection.findOneAndDelete(filter, options)
      : this.collection.findOneAndDelete(filter);
  }

  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions,
  ): Promise<WithId<Output> | null>;
  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
  ): Promise<WithId<Output> | null>;
  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
    options?: FindOneAndReplaceOptions,
  ): Promise<ModifyResult<Output> | WithId<Output> | null> {
    const _replacement = this.validateWithoutId(replacement);
    return options
      ? this.collection.findOneAndReplace(filter, _replacement, options)
      : this.collection.findOneAndReplace(filter, _replacement);
  }

  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options: FindOneAndUpdateOptions,
  ): Promise<WithId<Output> | null>;
  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
  ): Promise<WithId<Output> | null>;
  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options?: FindOneAndUpdateOptions,
  ): Promise<WithId<Output> | ModifyResult<Output> | null> {
    return options
      ? this.collection.findOneAndUpdate(filter, update, options)
      : this.collection.findOneAndUpdate(filter, update);
  }

  async insertMany(
    docs: Input[],
    options?: BulkWriteOptions,
  ): Promise<InsertManyResult<Output>> {
    const _docs = docs.map((doc) =>
      this.schema.parse(doc),
    ) as OptionalUnlessRequiredId<Output>[];
    return this.collection.insertMany(_docs, options);
  }

  async insertOne(
    doc: Input,
    options?: InsertOneOptions,
  ): Promise<InsertOneResult<Output>> {
    const _doc = this.schema.parse(doc) as OptionalUnlessRequiredId<Output>;
    return this.collection.insertOne(_doc, options);
  }

  async updateMany(
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options?: UpdateOptions,
  ): Promise<UpdateResult<Output>> {
    return this.collection.updateMany(filter, update, options);
  }

  async updateOne(
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options?: UpdateOptions,
  ): Promise<UpdateResult<Output>> {
    return this.collection.updateOne(filter, update, options);
  }
}
