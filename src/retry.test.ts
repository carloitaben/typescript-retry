import {
  createRetry,
  exponentialDelay,
  fibonacciDelay,
  jitter,
  linearDelay,
} from "./retry.js"
import { afterEach, beforeEach, describe, expect, test } from "vitest"

test(createRetry.name, () => {
  const retry = createRetry({
    times: Infinity,
  })

  expect(async () =>
    retry(Math.random, {
      until: (result) => result > 0.9,
    }),
  ).not.toThrow()
})

describe(linearDelay.name, () => {
  test("default", () => {
    const delay = linearDelay()
    expect([delay({ attempt: 1 }), delay({ attempt: 2 })]).toEqual([100, 200])
  })

  test("from", () => {
    const delay = linearDelay({ from: 200 })
    expect([delay({ attempt: 1 }), delay({ attempt: 2 })]).toEqual([300, 400])
  })

  test("scale", () => {
    const delay = linearDelay({ scale: 200 })
    expect([delay({ attempt: 1 }), delay({ attempt: 2 })]).toEqual([200, 400])
  })
})

describe(exponentialDelay.name, () => {
  test("default", () => {
    const delay = exponentialDelay()
    expect([
      delay({ attempt: 1 }),
      delay({ attempt: 2 }),
      delay({ attempt: 3 }),
      delay({ attempt: 4 }),
      delay({ attempt: 5 }),
    ]).toEqual([100, 400, 800, 1600, 3200])
  })
})

describe(fibonacciDelay.name, () => {
  test("default", () => {
    const context = { attempt: 0 }
    const delay = fibonacciDelay()
    const expectedValues = [1, 2, 3, 5, 8, 13, 21, 34, 55].map(
      (el) => el * 1_000,
    )
    for (let i = 0; i < expectedValues.length; i++) {
      const value = delay(context)
      expect(value).toBe(expectedValues[i])
    }
  })

  test("start", () => {
    const context = { attempt: 0 }
    const start = 3
    const scale = 1_000
    const delay = fibonacciDelay({ start })
    const expectedValues = [1, 2, 3, 5, 8, 13, 21, 34, 55].map(
      (el) => el * scale,
    )
    for (let i = start; i < expectedValues.length; i++) {
      const value = delay(context)
      expect(value).toBe(expectedValues[i])
    }
  })

  test("scale", () => {
    const context = { attempt: 0 }
    const scale = 1_000 * 60
    const delay = fibonacciDelay({ scale })
    const expectedValues = [1, 2, 3, 5, 8, 13, 21, 34, 55].map(
      (el) => el * scale,
    )
    let debug = []
    for (let i = 0; i < expectedValues.length; i++) {
      const value = delay(context)
      debug.push(value)
      expect(value).toBe(expectedValues[i])
    }
  })
})

describe(jitter.name, () => {
  let originalMathRandom: typeof Math.random
  beforeEach(() => {
    originalMathRandom = Math.random
  })

  afterEach(() => {
    Math.random = originalMathRandom
  })
  test("It never is larger than 2n or smaller than 0 on values smaller than 0.5", () => {
    Math.random = () => 0.25
    const context = { attempt: 0 }
    let input = [1, 2, 3]
    let output = input.map(jitter)
    for (let index in input) {
      expect(output[index]!(context)).toBeLessThanOrEqual(input[index]! * 2)
      expect(output[index]!(context)).toBeGreaterThanOrEqual(0)
    }
  })
  test("It never is larger than 2n or smaller than 0 on values bigger than 0.5", () => {
    Math.random = () => 0.75
    const context = { attempt: 0 }
    let input = [1, 2, 3]
    let output = input.map(jitter)
    for (let index in input) {
      expect(output[index]!(context)).toBeLessThanOrEqual(input[index]! * 2)
      expect(output[index]!(context)).toBeGreaterThanOrEqual(0)
    }
  })

  test("composition with values smaller than 0.5", () => {
    const linearDelayExpected = [
      100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
    ]
    Math.random = () => 0.25
    const delay = jitter(linearDelay({ from: 100 }))
    for (let i = 0; i < linearDelayExpected.length; i++) {
      expect(delay({ attempt: i })).toBeLessThanOrEqual(
        linearDelayExpected[i]! * 2,
      )
      expect(delay({ attempt: i })).toBeGreaterThanOrEqual(0)
    }
  })
  test("composition with values bigger than 0.5", () => {
    const linearDelayExpected = [
      100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
    ]
    Math.random = () => 0.75
    const delay = jitter(linearDelay({ from: 100 }))
    for (let i = 0; i < linearDelayExpected.length; i++) {
      expect(delay({ attempt: i })).toBeLessThanOrEqual(
        linearDelayExpected[i]! * 2,
      )
      expect(delay({ attempt: i })).toBeGreaterThanOrEqual(0)
    }
  })
})
