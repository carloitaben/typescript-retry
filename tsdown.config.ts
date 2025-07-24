import { defineConfig } from "tsdown"
import { generateDocumentation } from "tsdoc-markdown"

const entry = ["src/retry.ts"]

export default defineConfig({
  entry,
  hooks: {
    "build:done": () => {
      generateDocumentation({
        inputFiles: entry,
        outputFile: "./README.md",
        buildOptions: {
          explore: false,
          types: true,
        },
        markdownOptions: {
          emoji: null,
          headingLevel: "###",
        },
      })
    },
  },
})
