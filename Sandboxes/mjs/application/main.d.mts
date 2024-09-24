import { setTimeout } from 'node:timers'
import fs from 'node:fs/promises'

export declare global {
  const api: {
    console: {
      log: (...messages?: any[],) => void;
    };
    timers: {
      setTimeout: typeof setTimeout
    },
    fs: {
      readFile: typeof fs.readFile
    }
  }
}

