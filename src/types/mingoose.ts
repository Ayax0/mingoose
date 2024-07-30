import type { Hookable } from "hookable";
import type { MingooseHooks } from "./hooks";
import type { MongoClient, MongoClientOptions } from "mongodb";

export interface Mingoose {
  url: string;
  options?: MongoClientOptions;
  hooks: Hookable<MingooseHooks>;

  _client: MongoClient;

  connect(): Promise<MongoClient>;
}
