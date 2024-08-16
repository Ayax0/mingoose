import defu from "defu";
import { createHooks } from "hookable";
import type { Hookable } from "hookable";
import { Collection } from "mongodb";
import type {
  BulkWriteOptions,
  EstimatedDocumentCountOptions,
  Filter,
  FindCursor,
  FindOneAndDeleteOptions,
  FindOneAndReplaceOptions,
  FindOneAndUpdateOptions,
  FindOptions,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  ModifyResult,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithId,
  WithoutId,
} from "mongodb";
import { basename } from "pathe";
import { z } from "zod";
import { defaultReplaceOptions, defaultUpdateOptions } from "./_defaults/model";
import type { ModelHooks } from "./types/hooks";
import type { Mingoose } from "./types/mingoose";
import { caller } from "./utils/caller";
import { pluralize } from "./utils/pluralize";

export function defineModel<
  ZodRawShape extends z.ZodRawShape & { [K in "_id"]: IdType },
  UnknownKeys extends z.UnknownKeysParam,
  Catchall extends z.ZodTypeAny,
  Output extends z.objectOutputType<ZodRawShape, Catchall, UnknownKeys>,
  Input extends z.objectInputType<ZodRawShape, Catchall, UnknownKeys>,
  IdType extends z.ZodOptional<z.ZodTypeAny>,
>(
  mingoose: Mingoose,
  schema: z.ZodObject<ZodRawShape, UnknownKeys, Catchall, Output, Input>,
  name?: string,
): Model<ZodRawShape, UnknownKeys, Catchall, Output, Input, IdType> {
  const _caller = caller();
  const _name = name || (_caller ? basename(_caller).split(".")[0] : undefined);

  if (!_name) throw new Error("model name could not be determined");
  return new Model<ZodRawShape, UnknownKeys, Catchall, Output, Input, IdType>(
    mingoose,
    schema,
    _name,
  );
}

export class Model<
  ZodRawShape extends z.ZodRawShape & { [K in "_id"]: IdType },
  UnknownKeys extends z.UnknownKeysParam,
  Catchall extends z.ZodTypeAny,
  Output extends z.objectOutputType<ZodRawShape, Catchall, UnknownKeys>,
  Input extends z.objectInputType<ZodRawShape, Catchall, UnknownKeys>,
  IdType extends z.ZodOptional<z.ZodTypeAny>,
> {
  collection: Collection<Output>;

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

  private validate(doc: Input): Output {
    this.hooks.callHook("pre:validate", doc);
    const validated = this.schema.parse(doc);
    this.hooks.callHook("post:validate", validated);
    return validated;
  }

  private validateWithoutId(doc: WithoutId<Input>): WithoutId<Output> {
    this.hooks.callHook("pre:validateWithoutId", doc);
    const validated = this.schema
      .extend({ _id: z.never() })
      .omit({ _id: true })
      .parse(doc) as WithoutId<Output>;
    this.hooks.callHook("post:validateWithoutId", validated);
    return validated;
  }

  findById(_id: z.input<IdType>, options?: FindOptions<Output>) {
    const _filter = { _id } as Filter<Output>;
    return this.findOne(_filter, options);
  }

  findByIdAndDelete(
    _id: z.input<IdType>,
    options: FindOneAndDeleteOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  findByIdAndDelete(
    _id: z.input<IdType>,
    options: FindOneAndDeleteOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  findByIdAndDelete(
    _id: z.input<IdType>,
    options: FindOneAndDeleteOptions,
  ): Promise<WithId<Output> | null>;
  findByIdAndDelete(_id: z.input<IdType>): Promise<WithId<Output> | null>;
  findByIdAndDelete(
    _id: z.input<IdType>,
    options?: FindOneAndDeleteOptions,
  ): Promise<WithId<Output> | ModifyResult<Output> | null> {
    const _filter = { _id } as Filter<Output>;
    return options
      ? this.findOneAndDelete(_filter, options)
      : this.findOneAndDelete(_filter);
  }

  async findByIdAndReplace(
    _id: z.input<IdType>,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  async findByIdAndReplace(
    _id: z.input<IdType>,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  async findByIdAndReplace(
    _id: z.input<IdType>,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions,
  ): Promise<WithId<Output> | null>;
  async findByIdAndReplace(
    _id: z.input<IdType>,
    replacement: WithoutId<Input>,
  ): Promise<WithId<Output> | null>;
  async findByIdAndReplace(
    _id: z.input<IdType>,
    replacement: WithoutId<Input>,
    options?: FindOneAndReplaceOptions,
  ): Promise<ModifyResult<Output> | WithId<Output> | null> {
    const _filter = { _id } as Filter<Output>;
    return options
      ? this.findOneAndReplace(_filter, replacement, options)
      : this.findOneAndReplace(_filter, replacement);
  }

  findByIdAndUpdate(
    _id: z.input<IdType>,
    update: UpdateFilter<Output>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  findByIdAndUpdate(
    _id: z.input<IdType>,
    update: UpdateFilter<Output>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  findByIdAndUpdate(
    _id: z.input<IdType>,
    update: UpdateFilter<Output>,
    options: FindOneAndUpdateOptions,
  ): Promise<WithId<Output> | null>;
  findByIdAndUpdate(
    _id: z.input<IdType>,
    update: UpdateFilter<Output>,
  ): Promise<WithId<Output> | null>;
  findByIdAndUpdate(
    _id: z.input<IdType>,
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
    this.hooks.callHook("pre:find", filter, options);
    const _result = filter
      ? this.collection.find(filter, options)
      : this.collection.find();
    this.hooks.callHook("post:find", _result);
    return _result;
  }

  async findOne(
    filter?: Filter<Output>,
    options?: FindOptions,
  ): Promise<Output | WithId<Output> | null> {
    this.hooks.callHook("pre:findOne", filter, options);
    const _result = filter
      ? await this.collection.findOne(filter, options)
      : await this.collection.findOne();
    this.hooks.callHook("post:findOne", _result);
    return _result;
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
    this.hooks.callHook("pre:findOneAndDelete", filter, options);
    const _result = options
      ? await this.collection.findOneAndDelete(filter, options)
      : await this.collection.findOneAndDelete(filter);
    this.hooks.callHook("post:findOneAndDelete", _result);
    return _result;
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
    const _options = defu(options, defaultReplaceOptions);
    this.hooks.callHook(
      "pre:findOneAndReplace",
      filter,
      _replacement,
      _options,
    );
    const _result = await this.collection.findOneAndReplace(
      filter,
      _replacement,
      _options,
    );
    this.hooks.callHook("post:findOneAndReplace", _result);
    return _result;
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
    const _options = defu(options, defaultUpdateOptions);
    this.hooks.callHook("pre:findOneAndUpdate", filter, update, _options);
    const _result = await this.collection.findOneAndUpdate(
      filter,
      update,
      _options,
    );
    this.hooks.callHook("post:findOneAndUpdate", _result);
    return _result;
  }

  async insertMany(
    docs: Input[],
    options?: BulkWriteOptions,
  ): Promise<InsertManyResult<Output>> {
    const _docs = docs.map((doc) =>
      this.validate(doc),
    ) as OptionalUnlessRequiredId<Output>[];
    this.hooks.callHook("pre:insertMany", _docs, options);
    const _result = await this.collection.insertMany(_docs, options);
    this.hooks.callHook("post:insertMany", _result);
    return _result;
  }

  async insertOne(
    doc: Input,
    options?: InsertOneOptions,
  ): Promise<InsertOneResult<Output>> {
    const _doc = this.validate(doc) as OptionalUnlessRequiredId<Output>;
    this.hooks.callHook("pre:insertOne", _doc, options);
    const _result = await this.collection.insertOne(_doc, options);
    this.hooks.callHook("post:insertOne", _result);
    return _result;
  }

  async updateMany(
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options?: UpdateOptions,
  ): Promise<UpdateResult<Output>> {
    this.hooks.callHook("pre:updateMany", filter, update, options);
    const _result = await this.collection.updateMany(filter, update, options);
    this.hooks.callHook("post:updateMany", _result);
    return _result;
  }

  async updateOne(
    filter: Filter<Output>,
    update: UpdateFilter<Output>,
    options?: UpdateOptions,
  ): Promise<UpdateResult<Output>> {
    this.hooks.callHook("pre:updateOne", filter, update, options);
    const _result = await this.collection.updateOne(filter, update, options);
    this.hooks.callHook("post:updateOne", _result);
    return _result;
  }

  async count(options?: EstimatedDocumentCountOptions) {
    this.hooks.callHook("pre:count", options);
    const _result = await this.collection.estimatedDocumentCount(options);
    this.hooks.callHook("post:count", _result);
    return _result;
  }
}
