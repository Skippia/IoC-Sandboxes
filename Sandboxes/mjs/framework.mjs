import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import buildAPIContext from '../utils/build-api-context.cjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const createContext = (modulePath) => {
  const context = {
    ...buildAPIContext(modulePath),
    __dirname: modulePath,
  };

  return vm.createContext(context)
};

const safeImport = async (specifier, referencingModule) => {
  // Control which modules can be imported
  if (specifier === 'fs' || specifier.startsWith('node:fs')) {
    throw new Error('Access denied to fs module');
  }

  let module

  // For built-in modules
  if (specifier.startsWith('node:')) {
    const syntheticModule = new vm.SyntheticModule(
      ['default', ...Object.keys(path)],
      function () {
        this.setExport('default', path);
        for (const key of Object.keys(path)) {
          this.setExport(key, path[key]);
        }
      },
      {
        context: referencingModule.context,
        identifier: specifier,
      }
    );
    module = syntheticModule
  } else if (
    specifier.startsWith('./')
  ) {
    const dirname = path.dirname(fileURLToPath(referencingModule.identifier));
    const resolvedPath = path.resolve(dirname, specifier);
    const code = await fs.readFile(resolvedPath, 'utf8');
    const sourceTextModule = new vm.SourceTextModule(code, {
      context: referencingModule.context,
      identifier: pathToFileURL(resolvedPath).href,
      initializeImportMeta(meta, module) {
        meta.url = module.identifier;
      },
      importModuleDynamically: safeImport,
    });

    module = sourceTextModule
  } else {
    throw new Error(`Import of '${specifier}' is not allowed`);
  }

  await module.link(safeImport);
  await module.evaluate();

  return module;
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

  await module.link(safeImport);
  await module.evaluate();

  // Access exported values
  const { executeFn } = module.namespace;

  if (typeof executeFn === 'function') {
    executeFn();
  }
};

runSandboxed(path.join(__dirname, './application'));
