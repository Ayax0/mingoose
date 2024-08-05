import defu from "defu";
import { createHooks } from "hookable";
import type { Hookable } from "hookable";
import { Collection } from "mongodb";
import type {
  BulkWriteOptions,
  DeleteOptions,
  DeleteResult,
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
import type { z } from "zod";
import { defaultReplaceOptions, defaultUpdateOptions } from "./_defaults/model";
import type { ObjectIdLike } from "./types";
import type { ModelHooks } from "./types/hooks";
import type { Mingoose } from "./types/mingoose";
import { caller } from "./utils/caller";
import { parseObjectIdLike } from "./utils/model";
import { pluralize } from "./utils/pluralize";
import type { ZodObjectId } from "./schema/types";

export function defineModel<
  ZodRawShape extends z.ZodRawShape & { _id?: ZodObjectId },
  UnknownKeys extends z.UnknownKeysParam,
  Catchall extends z.ZodTypeAny,
  Output extends z.objectOutputType<ZodRawShape, Catchall, UnknownKeys>,
  Input extends z.objectInputType<ZodRawShape, Catchall, UnknownKeys>,
>(
  mingoose: Mingoose,
  schema: z.ZodObject<ZodRawShape, UnknownKeys, Catchall, Output, Input>,
  name?: string,
): Model<ZodRawShape, UnknownKeys, Catchall, Output, Input> {
  const _caller = caller();
  const _name = name || (_caller ? basename(_caller).split(".")[0] : undefined);

  if (!_name) throw new Error("model name could not be determined");
  return new Model<ZodRawShape, UnknownKeys, Catchall, Output, Input>(
    mingoose,
    schema,
    _name,
  );
}

export class Model<
  ZodRawShape extends z.ZodRawShape & { _id?: ZodObjectId },
  UnknownKeys extends z.UnknownKeysParam,
  Catchall extends z.ZodTypeAny,
  Output extends z.objectOutputType<ZodRawShape, Catchall, UnknownKeys>,
  Input extends z.objectInputType<ZodRawShape, Catchall, UnknownKeys>,
> extends Collection<Output> {
  schema: z.ZodObject<ZodRawShape, UnknownKeys, Catchall, Output, Input>;
  hooks: Hookable<ModelHooks<Output, Input>>;

  constructor(
    mingoose: Mingoose,
    schema: z.ZodObject<ZodRawShape, UnknownKeys, Catchall, Output, Input>,
    name: string,
  ) {
    // @ts-expect-error: missing type definition
    // biome-ignore format: ts-expect
    super(mingoose._client.db(), pluralize(name));
    this.schema = schema;
    this.hooks = createHooks();
  }

  // Custom

  findById(
    id: ObjectIdLike,
    options?: FindOptions<Output>,
  ): Promise<WithId<Output> | null> {
    return options
      ? this.findOne({ _id: parseObjectIdLike<Output>(id) }, options)
      : this.findOne({ _id: parseObjectIdLike<Output>(id) });
  }

  findByIdAndDelete(
    id: ObjectIdLike,
    options: FindOneAndDeleteOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  findByIdAndDelete(
    id: ObjectIdLike,
    options: FindOneAndDeleteOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  findByIdAndDelete(
    id: ObjectIdLike,
    options: FindOneAndDeleteOptions,
  ): Promise<WithId<Output> | null>;
  findByIdAndDelete(id: ObjectIdLike): Promise<WithId<Output> | null>;
  findByIdAndDelete(
    id: ObjectIdLike,
    options?: FindOneAndDeleteOptions,
  ): Promise<WithId<Output> | ModifyResult<Output> | null> {
    return options
      ? this.findOneAndDelete({ _id: parseObjectIdLike<Output>(id) }, options)
      : this.findOneAndDelete({ _id: parseObjectIdLike<Output>(id) });
  }

  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions,
  ): Promise<WithId<Output> | null>;
  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<Input>,
  ): Promise<WithId<Output> | null>;
  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<Input>,
    options?: FindOneAndReplaceOptions,
  ): Promise<ModifyResult<Output> | WithId<Output> | null> {
    return options
      ? this.findOneAndReplace(
          { _id: parseObjectIdLike(id) },
          replacement,
          options,
        )
      : this.findOneAndReplace({ _id: parseObjectIdLike(id) }, replacement);
  }

  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<Input>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<Input>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<Input>,
    options: FindOneAndUpdateOptions,
  ): Promise<WithId<Output> | null>;
  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<Input>,
  ): Promise<WithId<Output> | null>;
  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<Input>,
    options?: FindOneAndUpdateOptions,
  ): Promise<WithId<Output> | ModifyResult<Output> | null> {
    return options
      ? this.findOneAndUpdate(
          { _id: parseObjectIdLike<Output>(id) },
          update,
          options,
        )
      : this.findOneAndUpdate({ _id: parseObjectIdLike<Output>(id) }, update);
  }

  validate(doc: Input): Output {
    try {
      this.hooks.callHook("pre:validate", doc);
      const result = this.schema.parse(doc);
      this.hooks.callHook("post:validate", result);
      return result;
    } catch (error) {
      this.hooks.callHook("validate:error", error);
      throw error;
    }
  }

  // Override

  async deleteMany(
    filter?: Filter<Output>,
    options?: DeleteOptions,
  ): Promise<DeleteResult> {
    this.hooks.callHook("pre:deleteMany", filter, options);
    const result = await super.deleteMany(filter, options);
    this.hooks.callHook("post:deleteMany", result);
    return result;
  }

  async deleteOne(
    filter?: Filter<Output>,
    options?: DeleteOptions,
  ): Promise<DeleteResult> {
    this.hooks.callHook("pre:deleteOne", filter, options);
    const result = await super.deleteOne(filter, options);
    this.hooks.callHook("post:deleteOne", result);
    return result;
  }

  find(
    filter?: Filter<Output>,
    options?: FindOptions<Output>,
  ): FindCursor<WithId<Output>> {
    this.hooks.callHook("pre:find", filter, options);
    const result = filter ? super.find(filter, options) : super.find();
    this.hooks.callHook("post:find", result);
    return result;
  }

  async findOne(): Promise<WithId<Output> | null>;
  async findOne(filter: Filter<Output>): Promise<WithId<Output> | null>;
  async findOne(
    filter: Filter<Output>,
    options: FindOptions,
  ): Promise<WithId<Output> | null>;
  async findOne(
    filter?: Filter<Output>,
    options?: FindOptions,
  ): Promise<Output | WithId<Output> | null> {
    this.hooks.callHook("pre:findOne", filter, options);
    const result = await (filter
      ? super.findOne(filter, options)
      : super.findOne());
    this.hooks.callHook("post:findOne", result);
    return result;
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
    const result = await (options
      ? super.findOneAndDelete(filter, options)
      : super.findOneAndDelete(filter));
    this.hooks.callHook("post:findOneAndDelete", result);
    return result;
  }

  // @ts-expect-error: intentionaly override of parent function
  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  // @ts-expect-error: intentionaly override of parent function
  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  // @ts-expect-error: intentionaly override of parent function
  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
    options: FindOneAndReplaceOptions,
  ): Promise<WithId<Output> | null>;
  // @ts-expect-error: intentionaly override of parent function
  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
  ): Promise<WithId<Output> | null>;
  // @ts-expect-error: intentionaly override of parent function
  async findOneAndReplace(
    filter: Filter<Output>,
    replacement: WithoutId<Input>,
    options?: FindOneAndReplaceOptions,
  ): Promise<ModifyResult<Output> | WithId<Output> | null> {
    this.hooks.callHook("pre:findOneAndReplace", filter, replacement, options);
    const _options = defu(options, defaultReplaceOptions);
    const _result = await super.findOneAndReplace(
      filter,
      // @ts-expect-error: TODO - Implement validation
      replacement,
      _options,
    );
    this.hooks.callHook("post:findOneAndReplace", _result);
    return _result;
  }

  // @ts-expect-error: intentionaly override of parent function
  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Input>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: true },
  ): Promise<ModifyResult<Output>>;
  // @ts-expect-error: intentionaly override of parent function
  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Input>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: false },
  ): Promise<WithId<Output> | null>;
  // @ts-expect-error: intentionaly override of parent function
  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Input>,
    options: FindOneAndUpdateOptions,
  ): Promise<WithId<Output> | null>;
  // @ts-expect-error: intentionaly override of parent function
  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Input>,
  ): Promise<WithId<Output> | null>;
  // @ts-expect-error: intentionaly override of parent function
  async findOneAndUpdate(
    filter: Filter<Output>,
    update: UpdateFilter<Input>,
    options?: FindOneAndUpdateOptions,
  ): Promise<WithId<Output> | ModifyResult<Output> | null> {
    this.hooks.callHook("pre:findOneAndUpdate", filter, update, options);
    const _options = defu(options, defaultUpdateOptions);
    // @ts-expect-error: TODO - Implement validation
    const _result = await super.findOneAndUpdate(filter, update, _options);
    this.hooks.callHook("post:findOneAndUpdate", _result);
    return _result;
  }

  // @ts-expect-error: intentionaly override of parent function
  async insertMany(
    docs: OptionalUnlessRequiredId<Input>[],
    options?: BulkWriteOptions,
  ): Promise<InsertManyResult<Output>> {
    this.hooks.callHook("pre:insertMany", docs, options);
    const result = await super.insertMany(
      // @ts-expect-error: invalide type because of override
      docs.map((doc) => this.validate(doc)),
      options,
    );
    this.hooks.callHook("post:insertMany", result);
    return result;
  }

  // @ts-expect-error: intentionaly override of parent function
  async insertOne(
    doc: OptionalUnlessRequiredId<Input>,
    options?: InsertOneOptions,
  ): Promise<InsertOneResult<Output>> {
    this.hooks.callHook("pre:insertOne", doc, options);
    const result = await super.insertOne(
      // @ts-expect-error: invalide type because of override
      this.validate(doc),
      options,
    );
    this.hooks.callHook("post:insertOne", result);
    return result;
  }

  // @ts-expect-error: intentionaly override of parent function
  async updateMany(
    filter: Filter<Output>,
    update: UpdateFilter<Input>,
    options?: UpdateOptions,
  ): Promise<UpdateResult<Output>> {
    this.hooks.callHook("pre:updateMany", filter, update, options);
    // @ts-expect-error: TODO - Implement validation
    const result = await super.updateMany(filter, update, options);
    this.hooks.callHook("post:updateMany", result);
    return result;
  }

  // @ts-expect-error: intentionaly override of parent function
  async updateOne(
    filter: Filter<Output>,
    update: UpdateFilter<Input>,
    options?: UpdateOptions,
  ): Promise<UpdateResult<Output>> {
    this.hooks.callHook("pre:updateOne", filter, update, options);
    // @ts-expect-error: TODO - Implement validation
    const result = await super.updateOne(filter, update, options);
    this.hooks.callHook("post:updateOne", result);
    return result;
  }
}
