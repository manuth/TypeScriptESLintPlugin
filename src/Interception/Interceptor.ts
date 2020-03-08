import { Interception } from "./Interception";
import { InterceptionCollection } from "./InterceptionCollection";

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
    private interceptions: InterceptionCollection<T> = new InterceptionCollection();

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
     * Gets the target of the interceptor.
     */
    public get Target(): T
    {
        return this.target;
    }

    /**
     * Gets the installed interceptions.
     */
    public get Interceptions(): ReadonlyMap<keyof T, Interception<T, keyof T>>
    {
        return new Map(this.interceptions);
    }

    /**
     * Adds a new property-interception.
     *
     * @param key
     * The key of the interception to add.
     *
     * @param interception
     * The interception to add.
     */
    public AddProperty<TKey extends keyof T>(key: TKey, interception: PropertyInterception<T, TKey>): void
    {
        if (!this.interceptions.has(key))
        {
            this.interceptions.set(key, (target, key): T[TKey] => interception(target, key));
        }
        else
        {
            throw new RangeError(`An interception with the key \`${key}\` already exists!`);
        }
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
    public AddMethod<TKey extends keyof T>(key: TKey, interception: MethodInterception<T, TKey>): void
    {
        this.AddProperty(
            key,
            (target, key): T[TKey] =>
            {
                return ((...args: unknown[]): unknown => interception(target, target[key], ...args)) as any as T[TKey];
            });
    }

    /**
     * Deletes an interception.
     *
     * @param key
     * The key to delete.
     */
    public Delete(key: keyof T): void
    {
        this.interceptions.delete(key);
    }

    /**
     * Creates a proxy-object for the interceptor.
     */
    public CreateProxy(): T
    {
        return new Proxy<T>(
            this.target,
            {
                get: (target: T, property: keyof T): Partial<T>[keyof T] =>
                {
                    return this.interceptions.get(property)?.(target, property) ?? target[property];
                }
            });
    }
}

/**
 * Represents an interception for a method.
 */
type MethodInterception<T, TKey extends keyof T> = T[TKey] extends (...args: infer TArgs) => infer TResult ? (target: T, delegate: T[TKey], ...args: TArgs) => TResult : never;

/**
 * Represents an interception for a property.
 */
type PropertyInterception<T, TKey extends keyof T> = (target: T, property: TKey) => T[TKey];
