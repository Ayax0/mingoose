import type { TestHooks } from "./types/hooks";
import { createHooks } from "hookable";

const hooks = createHooks<TestHooks>();

hooks.hook("test", () => "test");

const out = hooks.callHook("test", "hallo");
console.log(out);
