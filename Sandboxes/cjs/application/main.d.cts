import type fs from 'node:fs/promises'
import type { setTimeout } from 'node:timers'

export declare global {
  const console: {
    log: (...messages?: any[],) => void
  },
  const api: {
    timers: {
      setTimeout: typeof setTimeout
    }
    fs: {
      readFile: typeof fs.readFile
    }
  }
}
