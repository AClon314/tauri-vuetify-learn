/**
 * Retrieves the name and value of the first entry.
 * @param varInDict \{var\} or {key: value}, usually the former
 * @returns a set {key, value} of var
 * ---
 * @example
 * ```ts
 * const myVar = 0;
 * [varName, value] = nameOf({myVar}); // varName = "myVar", value = 0
 * ```
 */
let nameOf = (
  varInDict: Record<any, any> | Set<any>
): [key: string, value: any] => {
  return [Object.keys(varInDict)[0], Object.values(varInDict)[0]];
};
export { nameOf };
