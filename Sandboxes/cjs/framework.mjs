import fs from 'node:fs/promises'
import vm from 'node:vm'
import { buildAPIContext } from '../utils/build-api-context.js';
// import sandboxedFs from 'sandboxed-fs'
// import sandboxedFs from '../utils/sandboxed-fs.js'
// import { cloneInterface, wrapFunction } from '../utils/wrapper.js'

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
    api: buildAPIContext(modulePath)
  };
  // Without creating recursive link — we won't be able to get access to global in code
  contextData.global = contextData;

  return vm.createContext(contextData);
}

const runSandboxed = async (modulePath) => {
  const filename = `${modulePath}/main.cjs`;
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

runSandboxed('./application').catch(e => console.error('Error:', e))
