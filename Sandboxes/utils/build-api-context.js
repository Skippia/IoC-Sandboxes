import path from 'node:path'
import fs from 'node:fs/promises'

export const buildAPIContext = modulePath => ({
  console: {
    log: (...s) => {
      console.log('\n[[Matrix log prefix]]:', ...s);
    }
  },
  timers: {
    setTimeout: (fn, ms, ...args) => setTimeout(fn, ms, ...args),
  },
  fs: {
    readFile: async (filePath, options) => {
      // Allowed path = directory where module resides
      const allowedPath = path.resolve(modulePath);
      const resolvedPath = path.resolve(modulePath, filePath);

      if (!resolvedPath.startsWith(allowedPath)) {
        throw new Error('Access denied to the outside file system')
      }

      return await fs.readFile(resolvedPath, options)
    },
  }
})
