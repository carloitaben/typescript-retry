# typescript-retry

```ts
// The library doesn't export a retry function. Instead, it exports a factory.
// It basically forces you to create your retry functions with your preferred defaults.
export const retry = createRetry({
  times: 5,
  delay: 500,
})

export const retryExponentialBackoff = createRetry({
  times: 5,
  delay: exponentialBackoff(1000),
})

export const retryUntilValidResponse = createRetry<Response>({
  times: Infinity,
  until: (response) => response.ok,
})

// Then, in your code...
const result = retry(() => unsafeFunction())
const result = retryExponentialBackoff(() => unsafeFunction())
const result = retryUntilValidResponse(() => fetch("..."))

// You can also override parts of the defaults
const result = retryExponentialBackoff(() => unsafeFunction(), { times: 10 })
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

TODO: document

| Function | Type |
| ---------- | ---------- |
| `linearDelay` | `(options?: LinearDelayOptions or undefined) => RetryDelayCallback<unknown>` |

#### fibonacciDelay

TODO: document

| Function | Type |
| ---------- | ---------- |
| `fibonacciDelay` | `(options?: FibonacciDelayOptions or undefined) => RetryDelayCallback<unknown>` |

#### exponentialDelay

TODO: document

| Function | Type |
| ---------- | ---------- |
| `exponentialDelay` | `(options?: ExponentialDelayOptions or undefined) => RetryDelayCallback<unknown>` |

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

TODO: document

| Function | Type |
| ---------- | ---------- |
| `sleep` | `(timeout: number) => Promise<void>` |

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

TODO: document

| Function | Type |
| ---------- | ---------- |
| `createRetry` | `<DefaultResult = unknown>(defaultOptions?: RetryOptions<DefaultResult> or undefined) => <Result extends DefaultResult>(callback: () => Result, options?: RetryOptions<...> or undefined) => Promise<Awaited<Result>>` |


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

TODO: document

| Type | Type |
| ---------- | ---------- |
| `RetryOptions` | `{ delay?: number or RetryDelayCallback<Result> times?: number until?: RetryUntilCallback<Result> }` |

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
