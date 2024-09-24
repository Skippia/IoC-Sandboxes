import path from 'node:path' // allowed
import { sum } from './text.mjs'; // allowed
// import notAllowed from '../framework.mjs'; // not allowed
// import fs from 'node:fs' // not allowed
// import fs from 'fs' // not allowed

// api.console.log(import.meta.url)

api.console.log('From application global context');

export const executeFn = async () => {
  try {
    const data = await api.fs.readFile('./file.txt', 'utf-8');
    // const data = await api.fs.readFile('../../utils/file.txt', 'utf-8')

    api.console.log('Data from file:', data.toString());
    api.console.log('result of sum:', sum(1, 10))

    api.timers.setTimeout(() => {
      api.console.log('From application after timeout');
    }, 3000);
  } catch (err) {
    api.console.log('Error:', err)
  }
};
