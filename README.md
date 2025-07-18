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
