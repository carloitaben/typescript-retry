export type RetryDelayCallbackContext<Result = unknown> = {
	attempt: number
	result?: Result
	previousDelay?: number
}

export type RetryDelayCallback<Result = unknown> = (context: RetryDelayCallbackContext<Result>) => number

export type RetryUntilCallback<Result = unknown> = (result: Result) => boolean | Promise<boolean>

type RetryOptions<Result = unknown> = {
	delay?: number | RetryDelayCallback<Result>
	times?: number
	until?: RetryUntilCallback<Result>
}

export type LinearDelayOptions = {
  from?: number
  scale?: number
}

export function linearDelay(options?: LinearDelayOptions): RetryDelayCallback {
	const from = options?.from ?? 0
	const scale = options?.scale ?? 100
  return (context) => from + context.attempt * scale
}

export type ExponentialDelayOptions = {
  from?: number
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

type FibonacciDelayOptions = {
  start?: number
  scale?: number
}

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

export function exponentialDelay(options?: ExponentialDelayOptions): RetryDelayCallback {
	const from = options?.from ?? 100
	const scale = options?.scale ?? 2
  return (context) =>
    context.attempt > 1 ? scale ** context.attempt * from : from
}

export function jitter(amount: number): RetryDelayCallback
export function jitter(delay: RetryDelayCallback): RetryDelayCallback
export function jitter<Result>(amountOrDelay: number | RetryDelayCallback): RetryDelayCallback<Result> {
	return (context) => {
		const direction = Math.random() > 0.5 ? 1 : -1
		const n = typeof amountOrDelay === "number" ? amountOrDelay : amountOrDelay(context)
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

export async function sleep(timeout: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, timeout))
}

export class UntilMismatchError extends Error {
	public override name = "UntilMismatchError"
	constructor(options?: ErrorOptions) {
		super("Until check failed", options)
	}
}

export function isUntilMismatchError(error: unknown): error is UntilMismatchError {
	return error instanceof UntilMismatchError
}

export class TooManyRetriesError extends Error {
	public override name = "UntilMismatchError"
	constructor(options?: ErrorOptions) {
		super("Too many retries", options)
	}
}

export function isTooManyRetriesError(error: unknown): error is TooManyRetriesError {
	return error instanceof TooManyRetriesError
}

async function run<Result>(callback: () => Result, context: RetryOptions<Result> & RetryDelayCallbackContext<Result>): Promise<Awaited<Result>> {
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

export function createRetry<DefaultResult = unknown>(defaultOptions?: RetryOptions<DefaultResult>) {
	return function retry<Result extends DefaultResult>(callback: () => Result, options?: RetryOptions<Result>): Promise<Awaited<Result>> {
		return run(callback, {
			attempt: 0,
			previousDelay: 0,
			...genericOptions,
			...defaultOptions,
			...options,
		})
	}
}
