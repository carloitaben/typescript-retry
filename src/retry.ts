export type RetryDelayCallbackContext<Result = unknown> = {
  attempt: number
  result?: Result
  previousDelay?: number
}

export type RetryDelayCallback<Result = unknown> = (
  context: RetryDelayCallbackContext<Result>,
) => number

export type RetryUntilCallback<Result = unknown> = (
  result: Result,
) => boolean | Promise<boolean>

export type RetryOptions<Result = unknown> = {
  /**
   * Either the time in milliseconds between retries, or a function that will be
   * invoked to calculate the delay.
   *
   * @example
   * Retry with a fixed delay
   *
   * ```ts
   * const retry = createRetry({
   *   delay: 500
   * })
   * ```
   *
   * @example
   * Retry immediately
   *
   * ```ts
   * const retry = createRetry({
   *   delay: 0
   * })
   * ```
   *
   * @example
   * Dynamically calculating delay

   * ```ts
   * const retry = createRetry({
   *   delay: (context) => context.attempt * 100
   * })
   * ```
   * 
   * @example
   * Clamping the delay
   * 
   * ```ts
   * const retry = createRetry({
   *   delay: (context) => Math.max(context.attempt * 100, 10000)
   * })
   * ```
   */
  delay?: number | RetryDelayCallback<Result>
  /**
   * The maximum number of retries the function will attempt.
   *
   * @example
   * Retry a maximum of 10 times
   *
   * ```ts
   * const retry = createRetry({
   *   times: 10
   * })
   * ```
   *
   * @example
   * Retry until no error is thrown
   *
   * ```ts
   * const retry = createRetry({
   *   times: Infinity
   * })
   * ```
   *
   * @default 3
   */
  times?: number
  /**
   * Validates the function result. Returns a `boolean` indicating whether the
   * result is expected.
   *
   * @example
   * Retry until valid response
   *
   * ```ts
   * export const retryUntilValidResponse = createRetry<Response>(
   *   times: Infinity,
   *   until: (response) => response.ok,
   *   //      ^? Response
   * })
   * ```
   */
  until?: RetryUntilCallback<Result>
}

export type LinearDelayOptions = {
  from?: number
  scale?: number
}

/**
 * Generates a linear delay.
 * By default, it uses the following options:
 *
 * ```ts
 * linearDelay({
 *   from: 0,
 *   scale: 100
 * })
 * ```
 *
 * @example
 *
 * ```ts
 * const retry = createRetry({
 *   delay: linearDelay()
 * })
 * ```
 *
 *
 * @example
 * From
 *
 * ```ts
 * const retry = createRetry({
 *   delay: linearDelay({ from: 500 })
 * })
 * ```
 *
 * @example
 * Scale
 *
 * ```ts
 * const retry = createRetry({
 *   delay: linearDelay({ scale: 1000 })
 * })
 * ```
 */
export function linearDelay(options?: LinearDelayOptions): RetryDelayCallback {
  const from = options?.from ?? 0
  const scale = options?.scale ?? 100
  return (context) => from + context.attempt * scale
}

export type FibonacciDelayOptions = {
  start?: number
  scale?: number
}

function getFibonacciStep(start: number) {
  let step = { current: 1, previous: 0 }

  for (let i = 0; i < start; i++) {
    const next = step.current + step.previous
    step.previous = step.current
    step.current = next
  }
  return step
}

/**
 * Generates a delay based on the Fibonacci sequence.
 * By default, it uses the following options:
 *
 * ```ts
 * fibonacciDelay({
 *   from: 100,
 *   scale: 2
 * })
 * ```
 *
 * @example
 *
 * ```ts
 * const retry = createRetry({
 *   delay: fibonacciDelay()
 * })
 * ```
 *
 *
 * @example
 * From
 *
 * ```ts
 * const retry = createRetry({
 *   delay: fibonacciDelay({ from: 500 })
 * })
 * ```
 *
 * @example
 * Scale
 *
 * ```ts
 * const retry = createRetry({
 *   delay: fibonacciDelay({ scale: 10 })
 * })
 * ```
 */
export function fibonacciDelay(
  options?: FibonacciDelayOptions,
): RetryDelayCallback {
  const start = options?.start ?? 0
  const scale = options?.scale ?? 1_000
  const step = getFibonacciStep(start)

  return () => {
    const next = step.current + step.previous
    step.previous = step.current
    step.current = next
    return step.current * scale
  }
}

export type ExponentialDelayOptions = {
  from?: number
  scale?: number
}

/**
 * Generates an exponential delay.
 * By default, it uses the following options:
 *
 * ```ts
 * exponentialDelay({
 *   from: 100,
 *   scale: 2
 * })
 * ```
 *
 * @example
 *
 * ```ts
 * const retry = createRetry({
 *   delay: exponentialDelay()
 * })
 * ```
 *
 * @example
 * From
 *
 * ```ts
 * const retry = createRetry({
 *   delay: exponentialDelay({ from: 500 })
 * })
 * ```
 *
 * @example
 * Scale
 *
 * ```ts
 * const retry = createRetry({
 *   delay: exponentialDelay({ scale: 10 })
 * })
 * ```
 */
export function exponentialDelay(
  options?: ExponentialDelayOptions,
): RetryDelayCallback {
  const from = options?.from ?? 100
  const scale = options?.scale ?? 2
  return (context) =>
    context.attempt > 1 ? scale ** context.attempt * from : from
}

/**
 * TODO: document
 */
export function jitter(amount: number): RetryDelayCallback

/**
 * TODO: document
 */
export function jitter(delay: RetryDelayCallback): RetryDelayCallback

export function jitter<Result>(
  amountOrDelay: number | RetryDelayCallback,
): RetryDelayCallback<Result> {
  return (context) => {
    const direction = Math.random() > 0.5 ? 1 : -1
    const n =
      typeof amountOrDelay === "number" ? amountOrDelay : amountOrDelay(context)
    const amount = Math.ceil(Math.random() * n)
    const jitter = n + direction * amount
    return Math.max(jitter, 0)
  }
}

const genericOptions = {
  times: 3,
  delay: 500,
} satisfies RetryOptions

function some<Value>(value: Value): value is NonNullable<Value> {
  return value !== undefined && value !== null
}

/**
 * Waits for a given number of milliseconds.
 * Used internally by the delay functions.
 *
 * @example
 *
 * ```ts
 * await sleep(3000)
 * ```
 */
export async function sleep(timeout: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, timeout))
}

/**
 * TODO: document
 */
export class UntilMismatchError extends Error {
  public override name = "UntilMismatchError"
  constructor(options?: ErrorOptions) {
    super("Until check failed", options)
  }
}

/**
 * TODO: document
 */
export function isUntilMismatchError(
  error: unknown,
): error is UntilMismatchError {
  return error instanceof UntilMismatchError
}

/**
 * TODO: document
 */
export class TooManyRetriesError extends Error {
  public override name = "UntilMismatchError"
  constructor(options?: ErrorOptions) {
    super("Too many retries", options)
  }
}

/**
 * TODO: document
 */
export function isTooManyRetriesError(
  error: unknown,
): error is TooManyRetriesError {
  return error instanceof TooManyRetriesError
}

async function run<Result>(
  callback: () => Result,
  context: RetryOptions<Result> & RetryDelayCallbackContext<Result>,
): Promise<Awaited<Result>> {
  try {
    const result = await callback()
    context.result = result

    if (context.until) {
      const pass = await context.until(result)
      if (!pass) {
        throw new UntilMismatchError({ cause: result })
      }
    }

    return result
  } catch (error) {
    if (some(context.times)) {
      if (context.attempt > context.times) {
        throw new TooManyRetriesError({ cause: error })
      }
    }

    context.attempt++

    if (some(context.delay)) {
      let delay: number
      if (typeof context.delay === "number") {
        delay = context.delay
      } else {
        delay = await context.delay(context)
      }
      context.previousDelay = delay
      await sleep(delay)
    }

    return run(callback, context)
  }
}

/**
 * Creates a retry function with the provided options as default.
 * By default, it uses the following options:
 *
 * ```ts
 * createRetry({
 *   times: 3,
 *   delay: 500,
 * })
 * ```
 *
 * @example
 *
 * ```ts
 * const retry = createRetry()
 * ```
 */
export function createRetry<DefaultResult = unknown>(
  defaultOptions?: RetryOptions<DefaultResult>,
) {
  return function retry<Result extends DefaultResult>(
    callback: () => Result,
    options?: RetryOptions<Result>,
  ): Promise<Awaited<Result>> {
    return run(callback, {
      attempt: 0,
      previousDelay: 0,
      ...genericOptions,
      ...defaultOptions,
      ...options,
    })
  }
}
