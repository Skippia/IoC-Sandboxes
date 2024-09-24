const path = require('node:path')
const fs = require('node:fs/promises')

const buildAPIContext = modulePath => ({
  api: {
    timers: {
      setTimeout: (fn, ms, ...args) => setTimeout(fn, ms, ...args),
    },
    fs: {
      readFile: async (filePath, options) => {
        // Allowed path = directory where module resides
        const allowedPath = path.resolve(modulePath);
        const resolvedPath = path.resolve(filePath);

        if (!resolvedPath.startsWith(allowedPath)) {
          throw new Error(`Access denied to the outside of local file system: ${resolvedPath}`)
        }

        return await fs.readFile(resolvedPath, options)
      },
    }
  },
  console: {
    log: (...s) => {
      console.log('\n[[Prefix from Matrix]]:', ...s);
    }
  },

})

module.exports = buildAPIContext
