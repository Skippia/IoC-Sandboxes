import { setTimeout } from 'node:timers'
import fs from 'node:fs/promises'

export declare global {
  const console: {
    log: (...messages?: any[],) => void
  },
  const api: {
    timers: {
      setTimeout: typeof setTimeout
    },
    fs: {
      readFile: typeof fs.readFile
    }
  }
}
