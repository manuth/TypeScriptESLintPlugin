import { InterceptorTests } from "./Interceptor.test";

/**
 * Registers tests for interceptions.
 */
export function InterceptionTests(): void
{
    suite(
        "Interception",
        () =>
        {
            InterceptorTests();
        });
}
