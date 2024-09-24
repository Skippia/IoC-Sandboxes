const fs = require('node:fs/promises')
const vm = require('node:vm')
const path = require('node:path')
const buildAPIContext = require('../utils/build-api-context.cjs')

// import sandboxedFs from 'sandboxed-fs'
// import { cloneInterface, wrapFunction } from '../utils/wrapper.js'


// const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const EXECUTION_TIMEOUT = 5000;

const safeRequire = (name) => {
  if (name === 'fs') {
    const msg = 'You don\'t have access to fs API';
    console.log(msg);
    return new Error(msg);
  } else {
    return require(name);
  }
};

const createContext = (modulePath) => {
  const contextData = {
    module: {
      exports: {}
    },
    require: safeRequire,
    __dirname: modulePath,
    ...buildAPIContext(modulePath),
  };
  // Without creating recursive link — we won't be able to get access to global in code
  contextData.global = contextData;

  return vm.createContext(contextData);
}

const runSandboxed = async (modulePath) => {
  const filename = path.join(modulePath, 'main.cjs');

  // 1. Create context
  const context = createContext(modulePath)

  // Read an application source code from the file
  const code = await fs.readFile(filename, 'utf-8')

  // 2. Create (compile) script, but not to run it 
  const script = new vm.Script(code, { filename });

  // 3. Run an application in sandboxed context
  const f = script.runInNewContext(context, { timeout: EXECUTION_TIMEOUT });

  const { executeFn } = context.module.exports

  if (executeFn) {
    executeFn()
  }

  /**
   * Alternative option
  */
  //  console.log(`f`, f)
  // if (f){
  //   f()
  // }
};

runSandboxed(path.join(__dirname, './application')).catch(e => console.error('Error:', e))
