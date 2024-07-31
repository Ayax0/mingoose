import type { Hookable } from "hookable";
import type { MongoClient, MongoClientOptions } from "mongodb";
import type { MingooseHooks } from "./hooks";

export interface Mingoose {
  url: string;
  options?: MongoClientOptions;
  hooks: Hookable<MingooseHooks>;

  _client: MongoClient;

  connect(): Promise<MongoClient>;
}
