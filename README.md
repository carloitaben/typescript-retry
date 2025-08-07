# typescript-retry

Retry any function on failure.

## Basic usage

Instead of relying on side effects to change the retry defaults, this library does not export a retry function; it exports a factory instead.

Begin by creating your retry functions.

```ts
export const retry = createRetry({
  times: 5,
  delay: 500,
})

export const retryUntilValidResponse = createRetry<Response>({
  times: Infinity,
  until: (response) => response.ok,
}
```

You can now use them anywhere in your code.

```ts
const result = await retry(() => unsafeFunction())

const result = await retryUntilValidResponse(() => fetch("..."))
```

You can also override the factory options.

```ts
const result = await retry(() => unsafeFunction(), {
  times: 10,
})
```

## Options

### `delay`

### `until`

A function that returns
return false if last fn results is not the expected one: continue to call fn until until returns true. A TooManyTries is thrown after maxTry calls to fn;

```ts
export const retryUntilValidResponse = createRetry<Response>(
  times: Infinity,
  until: (response) => response.ok,
  //      ^? Response
})
```

## API

<!-- TSDOC_START -->

### Functions

- [linearDelay](#lineardelay)
- [fibonacciDelay](#fibonaccidelay)
- [exponentialDelay](#exponentialdelay)
- [jitter](#jitter)
- [jitter](#jitter)
- [jitter](#jitter)
- [sleep](#sleep)
- [isUntilMismatchError](#isuntilmismatcherror)
- [isTooManyRetriesError](#istoomanyretrieserror)
- [createRetry](#createretry)

#### linearDelay

Generates a linear delay.
By default, it uses the following options:

```ts
linearDelay({
  from: 0,
  scale: 100
})
```

| Function | Type |
| ---------- | ---------- |
| `linearDelay` | `(options?: LinearDelayOptions or undefined) => RetryDelayCallback<unknown>` |

Examples:

```ts
const retry = createRetry({
  delay: linearDelay()
})
```
From

```ts
const retry = createRetry({
  delay: linearDelay({ from: 500 })
})
```
Scale

```ts
const retry = createRetry({
  delay: linearDelay({ scale: 1000 })
})
```


#### fibonacciDelay

Generates a delay based on the Fibonacci sequence.
By default, it uses the following options:

```ts
fibonacciDelay({
  from: 100,
  scale: 2
})
```

| Function | Type |
| ---------- | ---------- |
| `fibonacciDelay` | `(options?: FibonacciDelayOptions or undefined) => RetryDelayCallback<unknown>` |

Examples:

```ts
const retry = createRetry({
  delay: fibonacciDelay()
})
```
From

```ts
const retry = createRetry({
  delay: fibonacciDelay({ from: 500 })
})
```
Scale

```ts
const retry = createRetry({
  delay: fibonacciDelay({ scale: 10 })
})
```


#### exponentialDelay

Generates an exponential delay.
By default, it uses the following options:

```ts
exponentialDelay({
  from: 100,
  scale: 2
})
```

| Function | Type |
| ---------- | ---------- |
| `exponentialDelay` | `(options?: ExponentialDelayOptions or undefined) => RetryDelayCallback<unknown>` |

Examples:

```ts
const retry = createRetry({
  delay: exponentialDelay()
})
```
From

```ts
const retry = createRetry({
  delay: exponentialDelay({ from: 500 })
})
```
Scale

```ts
const retry = createRetry({
  delay: exponentialDelay({ scale: 10 })
})
```


#### jitter

TODO: document

| Function | Type |
| ---------- | ---------- |
| `jitter` | `{ (amount: number): RetryDelayCallback<unknown>; (delay: RetryDelayCallback<unknown>): RetryDelayCallback<unknown>; }` |

#### jitter

TODO: document

| Function | Type |
| ---------- | ---------- |
| `jitter` | `{ (amount: number): RetryDelayCallback<unknown>; (delay: RetryDelayCallback<unknown>): RetryDelayCallback<unknown>; }` |

#### jitter

TODO: document

| Function | Type |
| ---------- | ---------- |
| `jitter` | `{ (amount: number): RetryDelayCallback<unknown>; (delay: RetryDelayCallback<unknown>): RetryDelayCallback<unknown>; }` |

#### sleep

Waits for a given number of milliseconds.
Used internally by the delay functions.

| Function | Type |
| ---------- | ---------- |
| `sleep` | `(timeout: number) => Promise<void>` |

Examples:

```ts
await sleep(3000)
```


#### isUntilMismatchError

TODO: document

| Function | Type |
| ---------- | ---------- |
| `isUntilMismatchError` | `(error: unknown) => error is UntilMismatchError` |

#### isTooManyRetriesError

TODO: document

| Function | Type |
| ---------- | ---------- |
| `isTooManyRetriesError` | `(error: unknown) => error is TooManyRetriesError` |

#### createRetry

Creates a retry function with the provided options as default.
By default, it uses the following options:

```ts
createRetry({
  times: 3,
  delay: 500,
})
```

| Function | Type |
| ---------- | ---------- |
| `createRetry` | `<DefaultResult = unknown>(defaultOptions?: RetryOptions<DefaultResult> or undefined) => <Result extends DefaultResult>(callback: () => Result, options?: RetryOptions<...> or undefined) => Promise<Awaited<Result>>` |

Examples:

```ts
const retry = createRetry()
```



### UntilMismatchError

TODO: document

#### Properties

- [name](#name)

##### name

| Property | Type |
| ---------- | ---------- |
| `name` | `string` |

### TooManyRetriesError

TODO: document

#### Properties

- [name](#name)

##### name

| Property | Type |
| ---------- | ---------- |
| `name` | `string` |

### Types

- [RetryDelayCallbackContext](#retrydelaycallbackcontext)
- [RetryDelayCallback](#retrydelaycallback)
- [RetryUntilCallback](#retryuntilcallback)
- [RetryOptions](#retryoptions)
- [LinearDelayOptions](#lineardelayoptions)
- [FibonacciDelayOptions](#fibonaccidelayoptions)
- [ExponentialDelayOptions](#exponentialdelayoptions)

#### RetryDelayCallbackContext

| Type | Type |
| ---------- | ---------- |
| `RetryDelayCallbackContext` | `{ attempt: number result?: Result previousDelay?: number }` |

#### RetryDelayCallback

| Type | Type |
| ---------- | ---------- |
| `RetryDelayCallback` | `( context: RetryDelayCallbackContext<Result>, ) => number` |

#### RetryUntilCallback

| Type | Type |
| ---------- | ---------- |
| `RetryUntilCallback` | `( result: Result, ) => boolean or Promise<boolean>` |

#### RetryOptions

| Type | Type |
| ---------- | ---------- |
| `RetryOptions` | `{ /** * Either the time in milliseconds between retries, or a function that will be * invoked to calculate the delay. * * @example * Retry with a fixed delay * * ```ts * const retry = createRetry({ *   delay: 500 * }) * ``` * * @example * Retry immediately * * ```ts * const retry = createRetry({ *   delay: 0 * }) * ``` * * @example * Dynamically calculating delay  * ```ts * const retry = createRetry({ *   delay: (context) => context.attempt * 100 * }) * ``` * * @example * Clamping the delay * * ```ts * const retry = createRetry({ *   delay: (context) => Math.max(context.attempt * 100, 10000) * }) * ``` */ delay?: number or RetryDelayCallback<Result> /** * The maximum number of retries the function will attempt. * * @example * Retry a maximum of 10 times * * ```ts * const retry = createRetry({ *   times: 10 * }) * ``` * * @example * Retry until no error is thrown * * ```ts * const retry = createRetry({ *   times: Infinity * }) * ``` * * @default 3 */ times?: number /** * Validates the function result. Returns a `boolean` indicating whether the * result is expected. * * @example * Retry until valid response * * ```ts * export const retryUntilValidResponse = createRetry<Response>( *   times: Infinity, *   until: (response) => response.ok, *   //      ^? Response * }) * ``` */ until?: RetryUntilCallback<Result> }` |

#### LinearDelayOptions

| Type | Type |
| ---------- | ---------- |
| `LinearDelayOptions` | `{ from?: number scale?: number }` |

#### FibonacciDelayOptions

| Type | Type |
| ---------- | ---------- |
| `FibonacciDelayOptions` | `{ start?: number scale?: number }` |

#### ExponentialDelayOptions

| Type | Type |
| ---------- | ---------- |
| `ExponentialDelayOptions` | `{ from?: number scale?: number }` |


<!-- TSDOC_END -->

## LICENSE

[MIT](/LICENSE)

```

```
