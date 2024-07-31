import type { ZodSchema, ZodTypeDef } from "zod";
import { Collection } from "mongodb";
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
  InsertOneOptions,
  InsertOneResult,
  ModifyResult,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithId,
  WithoutId,
} from "mongodb";
import { basename } from "pathe";
import type { Mingoose } from "./types/mingoose";
import { caller } from "./utils/caller";
import { pluralize } from "./utils/pluralize";
import { createHooks } from "hookable";
import type { Hookable } from "hookable";
import type { ModelHooks } from "./types/hooks";
import type { ObjectIdLike } from "./types/mongodb";
import { parseObjectIdLike } from "./utils/model";
import defu from "defu";
import { defaultReplaceOptions, defaultUpdateOptions } from "./_defaults/model";

export function defineModel<
  DocType extends Document = Document,
  InputDocType = DocType
>(
  mingoose: Mingoose,
  schema: ZodSchema<DocType, ZodTypeDef, InputDocType>,
  name?: string
): Model<DocType, InputDocType> {
  const _caller = caller();
  const _name = name || (_caller ? basename(_caller).split(".")[0] : undefined);

  if (!_name) throw new Error("model name could not be determined");

  return new Model<DocType, InputDocType>(mingoose, schema, _name);
}

export class Model<
  DocType extends Document = Document,
  InputDocType = DocType
> extends Collection<DocType> {
  schema: ZodSchema<DocType, ZodTypeDef, InputDocType>;
  hooks: Hookable<ModelHooks<DocType, InputDocType>>;

  constructor(
    mingoose: Mingoose,
    schema: ZodSchema<DocType, ZodTypeDef, InputDocType>,
    name: string
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
    options?: FindOptions<DocType>
  ): Promise<WithId<DocType> | null> {
    return options
      ? this.findOne(parseObjectIdLike(id), options)
      : this.findOne(parseObjectIdLike(id));
  }

  findByIdAndDelete(
    id: ObjectIdLike,
    options: FindOneAndDeleteOptions & { includeResultMetadata: true }
  ): Promise<ModifyResult<DocType>>;
  findByIdAndDelete(
    id: ObjectIdLike,
    options: FindOneAndDeleteOptions & { includeResultMetadata: false }
  ): Promise<WithId<DocType> | null>;
  findByIdAndDelete(
    id: ObjectIdLike,
    options: FindOneAndDeleteOptions
  ): Promise<WithId<DocType> | null>;
  findByIdAndDelete(id: ObjectIdLike): Promise<WithId<DocType> | null>;
  findByIdAndDelete(
    id: ObjectIdLike,
    options?: FindOneAndDeleteOptions
  ): Promise<WithId<DocType> | ModifyResult<DocType> | null> {
    return options
      ? this.findOneAndDelete(parseObjectIdLike<DocType>(id), options)
      : this.findOneAndDelete(parseObjectIdLike<DocType>(id));
  }

  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<DocType>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true }
  ): Promise<ModifyResult<DocType>>;
  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<DocType>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false }
  ): Promise<WithId<DocType> | null>;
  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<DocType>,
    options: FindOneAndReplaceOptions
  ): Promise<WithId<DocType> | null>;
  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<DocType>
  ): Promise<WithId<DocType> | null>;
  async findByIdAndReplace(
    id: ObjectIdLike,
    replacement: WithoutId<DocType>,
    options?: FindOneAndReplaceOptions
  ): Promise<ModifyResult<DocType> | WithId<DocType> | null> {
    return options
      ? this.findOneAndReplace(parseObjectIdLike(id), replacement, options)
      : this.findOneAndReplace(parseObjectIdLike(id), replacement);
  }

  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<DocType>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: true }
  ): Promise<ModifyResult<DocType>>;
  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<DocType>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: false }
  ): Promise<WithId<DocType> | null>;
  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<DocType>,
    options: FindOneAndUpdateOptions
  ): Promise<WithId<DocType> | null>;
  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<DocType>
  ): Promise<WithId<DocType> | null>;
  findByIdAndUpdate(
    id: ObjectIdLike,
    update: UpdateFilter<DocType>,
    options?: FindOneAndUpdateOptions
  ): Promise<WithId<DocType> | ModifyResult<DocType> | null> {
    return options
      ? this.findOneAndUpdate(parseObjectIdLike<DocType>(id), update, options)
      : this.findOneAndUpdate(parseObjectIdLike<DocType>(id), update);
  }

  validate(doc: InputDocType): DocType {
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
    filter?: Filter<DocType>,
    options?: DeleteOptions
  ): Promise<DeleteResult> {
    this.hooks.callHook("pre:deleteMany", filter, options);
    const result = await super.deleteMany(filter, options);
    this.hooks.callHook("post:deleteMany", result);
    return result;
  }

  async deleteOne(
    filter?: Filter<DocType>,
    options?: DeleteOptions
  ): Promise<DeleteResult> {
    this.hooks.callHook("pre:deleteOne", filter, options);
    const result = await super.deleteOne(filter, options);
    this.hooks.callHook("post:deleteOne", result);
    return result;
  }

  find(
    filter?: Filter<DocType>,
    options?: FindOptions<DocType>
  ): FindCursor<WithId<DocType>> {
    this.hooks.callHook("pre:find", filter, options);
    const result = filter ? super.find(filter, options) : super.find();
    this.hooks.callHook("post:find", result);
    return result;
  }

  async findOne(): Promise<WithId<DocType> | null>;
  async findOne(filter: Filter<DocType>): Promise<WithId<DocType> | null>;
  async findOne(
    filter: Filter<DocType>,
    options: FindOptions
  ): Promise<WithId<DocType> | null>;
  async findOne(
    filter?: Filter<DocType>,
    options?: FindOptions
  ): Promise<DocType | WithId<DocType> | null> {
    this.hooks.callHook("pre:findOne", filter, options);
    const result = await (filter
      ? super.findOne(filter, options)
      : super.findOne());
    this.hooks.callHook("post:findOne", result);
    return result;
  }

  async findOneAndDelete(
    filter: Filter<DocType>,
    options: FindOneAndDeleteOptions & { includeResultMetadata: true }
  ): Promise<ModifyResult<DocType>>;
  async findOneAndDelete(
    filter: Filter<DocType>,
    options: FindOneAndDeleteOptions & { includeResultMetadata: false }
  ): Promise<WithId<DocType> | null>;
  async findOneAndDelete(
    filter: Filter<DocType>,
    options: FindOneAndDeleteOptions
  ): Promise<WithId<DocType> | null>;
  async findOneAndDelete(
    filter: Filter<DocType>
  ): Promise<WithId<DocType> | null>;
  async findOneAndDelete(
    filter: Filter<DocType>,
    options?: FindOneAndDeleteOptions
  ): Promise<WithId<DocType> | ModifyResult<DocType> | null> {
    this.hooks.callHook("pre:findOneAndDelete", filter, options);
    const result = await (options
      ? super.findOneAndDelete(filter, options)
      : super.findOneAndDelete(filter));
    this.hooks.callHook("post:findOneAndDelete", result);
    return result;
  }

  async findOneAndReplace(
    filter: Filter<DocType>,
    replacement: WithoutId<DocType>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true }
  ): Promise<ModifyResult<DocType>>;
  async findOneAndReplace(
    filter: Filter<DocType>,
    replacement: WithoutId<DocType>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false }
  ): Promise<WithId<DocType> | null>;
  async findOneAndReplace(
    filter: Filter<DocType>,
    replacement: WithoutId<DocType>,
    options: FindOneAndReplaceOptions
  ): Promise<WithId<DocType> | null>;
  async findOneAndReplace(
    filter: Filter<DocType>,
    replacement: WithoutId<DocType>
  ): Promise<WithId<DocType> | null>;
  async findOneAndReplace(
    filter: Filter<DocType>,
    replacement: WithoutId<DocType>,
    options?: FindOneAndReplaceOptions
  ): Promise<ModifyResult<DocType> | WithId<DocType> | null> {
    this.hooks.callHook("pre:findOneAndReplace", filter, replacement, options);
    const _options = defu(options, defaultReplaceOptions);
    const _result = await super.findOneAndReplace(
      filter,
      replacement,
      _options
    );
    this.hooks.callHook("post:findOneAndReplace", _result);
    return _result;
  }

  async findOneAndUpdate(
    filter: Filter<DocType>,
    update: UpdateFilter<DocType>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: true }
  ): Promise<ModifyResult<DocType>>;
  async findOneAndUpdate(
    filter: Filter<DocType>,
    update: UpdateFilter<DocType>,
    options: FindOneAndUpdateOptions & { includeResultMetadata: false }
  ): Promise<WithId<DocType> | null>;
  async findOneAndUpdate(
    filter: Filter<DocType>,
    update: UpdateFilter<DocType>,
    options: FindOneAndUpdateOptions
  ): Promise<WithId<DocType> | null>;
  async findOneAndUpdate(
    filter: Filter<DocType>,
    update: UpdateFilter<DocType>
  ): Promise<WithId<DocType> | null>;
  async findOneAndUpdate(
    filter: Filter<DocType>,
    update: UpdateFilter<DocType>,
    options?: FindOneAndUpdateOptions
  ): Promise<WithId<DocType> | ModifyResult<DocType> | null> {
    this.hooks.callHook("pre:findOneAndUpdate", filter, update, options);
    const _options = defu(options, defaultUpdateOptions);
    const _result = await super.findOneAndUpdate(filter, update, _options);
    this.hooks.callHook("post:findOneAndUpdate", _result);
    return _result;
  }

  // @ts-expect-error: intentionaly override of parent function
  async insertMany(
    docs: InputDocType[],
    options?: BulkWriteOptions
  ): Promise<InsertManyResult<DocType>> {
    this.hooks.callHook("pre:insertMany", docs, options);
    const result = await super.insertMany(
      // @ts-expect-error: invalide type because of override
      docs.map((doc) => this.validate(doc)),
      options
    );
    this.hooks.callHook("post:insertMany", result);
    return result;
  }

  // @ts-expect-error: intentionaly override of parent function
  async insertOne(
    doc: InputDocType,
    options?: InsertOneOptions
  ): Promise<InsertOneResult<DocType>> {
    this.hooks.callHook("pre:insertOne", doc, options);
    const result = await super.insertOne(
      // @ts-expect-error: invalide type because of override
      this.validate(doc),
      options
    );
    this.hooks.callHook("post:insertOne", result);
    return result;
  }

  async updateMany(
    filter: Filter<DocType>,
    update: UpdateFilter<DocType> | BSON.Document[],
    options?: UpdateOptions
  ): Promise<UpdateResult<DocType>> {
    this.hooks.callHook("pre:updateMany", filter, update, options);
    const result = await super.updateMany(filter, update, options);
    this.hooks.callHook("post:updateMany", result);
    return result;
  }

  async updateOne(
    filter: Filter<DocType>,
    update: UpdateFilter<DocType> | BSON.Document[],
    options?: UpdateOptions
  ): Promise<UpdateResult<DocType>> {
    this.hooks.callHook("pre:updateOne", filter, update, options);
    const result = await super.updateOne(filter, update, options);
    this.hooks.callHook("post:updateOne", result);
    return result;
  }
}
