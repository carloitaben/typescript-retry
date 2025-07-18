import { createRetry, exponentialDelay, jitter, linearDelay } from "./retry.js"
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
    expect([delay({ attempt: 1 }), delay({ attempt: 2 })]).toEqual([100, 200])
  })

  test("from", () => {
    const delay = linearDelay({ from: 200 })
    expect([delay({ attempt: 1 }), delay({ attempt: 2 })]).toEqual([300, 400])
  })

  test("step", () => {
    const delay = linearDelay({ step: 200 })
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

describe(jitter.name, () => {
  test("default", () => {
    expect(jitter(100)).not.toBe(100)
  })

  test("composition", () => {
    const delay = jitter(linearDelay({ from: 100 }))
    expect(delay({ attempt: 0 })).toBeGreaterThan(100)
  })
})
