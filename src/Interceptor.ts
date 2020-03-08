/**
 * Provides the functionality to intercept methods of an object.
 */
export class Interceptor<T extends object>
{
    /**
     * The target of the interceptor.
     */
    private target: T;

    /**
     * The interceptions.
     */
    private interceptions: Partial<T> = {};

    /**
     * Initializes a new instance of the `Interceptor<T>` class.
     *
     * @param target
     * The target of the interceptor.
     */
    public constructor(target: T)
    {
        this.target = target;
    }

    /**
     * Adds a new interception.
     *
     * @param key
     * The key of the interception to add.
     *
     * @param interception
     * The interception to add.
     */
    public Add<TKey extends keyof T>(key: TKey, interception: Interception<T, TKey>): void
    {
        (this.interceptions[key] as any) = (...args: unknown[]): unknown => interception(this.target[key], ...args);
    }

    /**
     * Creates a proxy-object for the interceptor.
     */
    public Create(): T
    {
        return new Proxy<T>(
            this.target,
            {
                get: (target: T, property: keyof T): Partial<T>[keyof T] => this.interceptions[property] ?? target[property]
            });
    }
}

/**
 * Represents an interception.
 */
type Interception<T, TKey extends keyof T> = T[TKey] extends (...args: infer TArgs) => infer TResult ? (delegate: T[TKey], ...args: TArgs) => TResult : never;
