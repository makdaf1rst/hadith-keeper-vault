export function createIsomorphicFn() {
  let client: ((...args: any[]) => any) | undefined;
  const callable: any = (...args: any[]) => {
    if (!client) throw new Error("No client implementation registered");
    return client(...args);
  };
  callable.client = (fn: (...args: any[]) => any) => {
    client = fn;
    return callable;
  };
  callable.server = () => callable;
  return callable;
}
