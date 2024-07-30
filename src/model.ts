import {
  BulkWriteOptions,
  Collection,
  Db,
  Document,
  Filter,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
} from "mongodb";
import { z } from ".";
import { createHooks, Hookable } from "hookable";

type HookResult = void | Promise<void>;

export interface ModelHooks<DocType extends Document = Document> {
  "pre:insertOne": (
    doc: OptionalUnlessRequiredId<DocType>,
    options?: InsertOneOptions
  ) => HookResult;
  "post:insertOne": (res: InsertOneResult<DocType>) => HookResult;
  "pre:insertMany": (
    docs: OptionalUnlessRequiredId<DocType>[],
    options?: BulkWriteOptions
  ) => HookResult;
  "post:insertMany": (res: InsertManyResult<DocType>) => HookResult;
  "pre:updateOne": (
    filter: Filter<DocType>,
    update: Document[] | UpdateFilter<DocType>,
    options?: UpdateOptions
  ) => HookResult;
  "post:updateOne": (res: UpdateResult<DocType>) => HookResult;
  "pre:updateMany": (
    filter: Filter<DocType>,
    update: Document[] | UpdateFilter<DocType>,
    options?: UpdateOptions
  ) => HookResult;
  "post:updateMany": (res: UpdateResult<DocType>) => HookResult;
}

export default class Model<
  DocType extends Document = Document
> extends Collection<DocType> {
  private schema: z.Schema<OptionalUnlessRequiredId<DocType>>;
  public hooks: Hookable<ModelHooks<DocType>>;

  constructor(
    db: Db,
    name: string,
    schema: z.Schema<OptionalUnlessRequiredId<DocType>>
  ) {
    // @ts-ignore: Missing Type Definition
    super(db, name);
    this.schema = schema;
    this.hooks = createHooks<ModelHooks<DocType>>();
  }

  async insertOne(
    doc: OptionalUnlessRequiredId<DocType>,
    options?: InsertOneOptions
  ): Promise<InsertOneResult<DocType>> {
    this.hooks.callHook("pre:insertOne", doc, options);

    const validated = this.schema.parse(doc);
    const result = await super.insertOne(validated, options);

    this.hooks.callHook("post:insertOne", result);

    return result;
  }

  async insertMany(
    docs: OptionalUnlessRequiredId<DocType>[],
    options?: BulkWriteOptions
  ): Promise<InsertManyResult<DocType>> {
    this.hooks.callHook("pre:insertMany", docs, options);

    const validated = docs.map((doc) => this.schema.parse(doc));
    const result = await super.insertMany(validated, options);

    this.hooks.callHook("post:insertMany", result);

    return result;
  }

  async updateOne(
    filter: Filter<DocType>,
    update: Document[] | UpdateFilter<DocType>,
    options?: UpdateOptions
  ): Promise<UpdateResult<DocType>> {
    this.hooks.callHook("pre:updateOne", filter, update, options);

    // TODO: validation
    const result = await super.updateOne(filter, update, options);

    this.hooks.callHook("post:updateOne", result);

    return result;
  }

  async updateMany(
    filter: Filter<DocType>,
    update: Document[] | UpdateFilter<DocType>,
    options?: UpdateOptions
  ): Promise<UpdateResult<DocType>> {
    this.hooks.callHook("pre:updateMany", filter, update, options);

    // TODO: validation
    const result = await super.updateOne(filter, update, options);

    this.hooks.callHook("post:updateMany", result);

    return result;
  }
}
