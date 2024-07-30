import type { Hookable, HookKeys } from "hookable";

// biome-ignore lint: allow any
export default function waitForHook<T extends Record<string, any>>(
  hooks: Hookable<T, HookKeys<T>>,
  hook: HookKeys<T>,
  timeout = 3000,
) {
  return new Promise((resolve, reject) => {
    (hooks as Hookable).hookOnce(hook, () => resolve(true));
    setTimeout(() => reject(), timeout);
  });
}
