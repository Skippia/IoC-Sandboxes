# V8 Sandboxes

This repository demonstrates how to create a sandboxed environment in Node.js using the V8 engine's `vm` module. The goal is to securely execute untrusted code by controlling and intercepting module imports and exports, and restricting access to certain Node.js APIs and the file system.

---

## Key Concepts

### Sandboxing with `vm` Module
Leverage Node.js's `vm` module to create isolated contexts (`vm.Context`) where untrusted code can run without affecting the main application.

### Controlling Module Imports
Implements custom functions (`safeRequire` for CommonJS and `safeImport` for ES Modules) to intercept and control module loading, allowing or denying access to specific modules like `fs`.

### Custom API Exposure
It's possible to provide a limited global object to the sandboxed code, exposing only necessary functionality such as `console.log`, `setTimeout`, and a restricted version of `fs.readFile` (as in my case).

### File System Access Restriction
Ensures sandboxed code can only access files within a specified directory, preventing unauthorized access to the broader file system.

### Matrix Environment
You can run create any environment and make sure that code inside will have no idea that something wrong

---

## File Structure

### `framework.mjs|cjs`
Describes the context of sandbox (a.k.a. *"The Matrix"*) and runs arbitrary code in this sandbox.
```JavaScript
// Part of framework.mjs file

const createContext = (modulePath) => {
  const context = {
    ...buildAPIContext(modulePath),
    __dirname: modulePath,
  };

  return vm.createContext(context)
};

const runSandboxed = async (modulePath) => {
  const absolutePathToModule = path.join(modulePath, 'main.mjs')
  // Read source code of module
  const code = await fs.readFile(absolutePathToModule, 'utf8');

  // 1. Create context
  const context = createContext(modulePath);

  // 2. Create module
  const module = new vm.SourceTextModule(code, {
    context,
    identifier: pathToFileURL(absolutePathToModule).href,
    initializeImportMeta(meta, module) {
      meta.url = module.identifier;
    },
    importModuleDynamically: safeImport,
  });

  // 3. Describe rules for imports
  await module.link(safeImport);
  // 4. Evaluate (kinda compile) module
  await module.evaluate();

  const { executeFn } = module.namespace;

  // 5. Run function from module
  if (typeof executeFn === 'function') {
    executeFn();
  }
};

runSandboxed(path.join(__dirname, './application'));

```

### `main.mjs|cjs`
Describes the code which will be run in the prepared sandbox. Code within this file thinks it’s in the real world (*dependencies*, *imports*, etc.), but in reality, we fully control its environment from outside. Code inside is absolutely powerless and delusional.
```JavaScript
// Part of main.mjs file
import path from 'node:path' // allowed
import { sum } from './text.mjs'; // allowed

 try {
    const data = await api.fs.readFile(path.join(__dirname, './file.txt'), 'utf-8');
    // const data = await api.fs.readFile(path.join(__dirname, '../../utils/file.txt'), 'utf-8') // Access is restricted

    console.log('Data from file:', data.toString());
    console.log('result of sum:', sum(1, 10))

    api.timers.setTimeout(() => {
      console.log('From application after timeout');
    }, 3000);
  } catch (err) {
    console.log('Error:', err)
  }
```
---

## Scripts
- Use command below to run `CommonJs` (target application) module:
```bash
npm run cjs
```
- Use command below to run `EcmaScript` (target application) module:
```bash
npm run mjs
```
---

## Examples

- The code in `main.mjs` tries to read files but can only access local files (within its own / nested directories).
- The code in `main.mjs` runs the `console.log` global method, but it’s actually a proxied version of the original `console.log` with custom behavior.

## Notes

- The `node:vm` module is not a security mechanism! Do not use it to run untrusted code.
- due to different mechanisms of import for EcmaScript modules and CommonJS module, we must use different sandboxes (check `cjs/` and `mjs/` directories)
- Based on https://www.youtube.com/watch?v=WnCwXvhscPM&t=539s
- You can get more info at https://nodejs.org/api/vm.html
