/**
 * Represents an interception for a method.
 */
export type MethodInterception<T, TKey extends keyof T> = T[TKey] extends (...args: infer TArgs) => infer TResult ? (target: T, delegate: T[TKey], ...args: TArgs) => TResult : never;
