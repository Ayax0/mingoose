import { createHooks } from "hookable";
import { MongoClient } from "mongodb";
import type { MongoClientOptions } from "mongodb";
import type { Mingoose } from "./types/mingoose";

export function createMingoose(
  url: string,
  options?: MongoClientOptions,
): Mingoose {
  const client = new MongoClient(url, options);

  const mingoose: Mingoose = {
    url,
    options,
    hooks: createHooks(),

    _client: client,

    connect: () => client.connect(),
  };

  // Hooks
  client.on("open", () => mingoose.hooks.callHook("open"));
  client.on("close", () => mingoose.hooks.callHook("close"));
  client.on("error", (error) => mingoose.hooks.callHook("error", error));

  return mingoose;
}
