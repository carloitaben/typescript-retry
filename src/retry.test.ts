import { createRetry, delay, jitter, linearDelay } from "./retry"
import { describe, expect, test } from "vitest"

test(createRetry.name, () => {
  const retry = createRetry({
    times: Infinity,
  })

  expect(async () =>
    retry(Math.random, {
      until: (result) => result > 0.9,
    })
  ).not.toThrow()
})

describe(linearDelay.name, () => {
  test("default", () => {
    const delay = linearDelay()
    expect([
      delay({ attempt: 0 }),
      delay({ attempt: 1 }),
      delay({ attempt: 2 }),
    ]).toEqual([0, 100, 200])
  })

  test("step", () => {
    const delay = linearDelay({ step: 1 })
    expect([
      delay({ attempt: 0 }),
      delay({ attempt: 1 }),
      delay({ attempt: 2 }),
    ]).toEqual([0, 1, 2])
  })

  test("from", () => {
    const delay = linearDelay({ from: 100, step: 1 })
    expect([
      delay({ attempt: 0 }),
      delay({ attempt: 1 }),
      delay({ attempt: 2 }),
    ]).toEqual([100, 101, 102])
  })
})

describe(jitter.name, () => {
  test("default", () => {
    expect(jitter(2)).not.toBe(2)
  })

  test("composition", () => {
    const delay = jitter(linearDelay({ from: 100 }))
    expect(delay({ attempt: 0 })).toBeGreaterThan(100)
  })
})
