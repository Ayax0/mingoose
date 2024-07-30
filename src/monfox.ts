import {
  Document,
  MongoClient,
  MongoClientOptions,
  OptionalUnlessRequiredId,
} from "mongodb";
import { z } from ".";
import Model from "./model";
import pluralize from "./utils/pluralize";
import { createHooks, Hookable } from "hookable";

export function monfox(
  connection: string | MongoClient,
  options?: MongoClientOptions
): MonfoxInstance {
  return new MonfoxInstance(connection, options);
}

interface MonfoxInstanceHooks {
  connected: () => void | Promise<void>;
  error: () => void | Promise<void>;
}

class MonfoxInstance {
  private client: MongoClient;
  public hooks: Hookable<MonfoxInstanceHooks>;

  constructor(connection: string | MongoClient, options?: MongoClientOptions) {
    this.client =
      typeof connection === "string"
        ? (this.client = new MongoClient(connection, options))
        : (this.client = connection);

    this.hooks = createHooks();
    this.client
      .connect()
      .then(() => this.hooks.callHook("connected"))
      .catch(() => this.hooks.callHook("error"));
  }

  defineModel<DocType extends Document>(
    name: string,
    schema: z.Schema<OptionalUnlessRequiredId<DocType>>
  ) {
    return new Model<DocType>(this.client.db(), pluralize(name), schema);
  }
}
