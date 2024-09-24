import path from 'node:path' // allowed
import { sum } from './text.mjs' // allowed
// import notAllowed from '../framework.mjs'; // not allowed
// import fs from 'node:fs' // not allowed
// import fs from 'fs' // not allowed

// console.log(import.meta.url)
console.log('From application global context')

export async function executeFn() {
  try {
    const data = await api.fs.readFile(path.join(__dirname, './file.txt'), 'utf-8')
    // const data = await api.fs.readFile(path.join(__dirname, '../../utils/file.txt'), 'utf-8')

    console.log('Data from file:', data.toString())
    console.log('result of sum:', sum(1, 10))

    api.timers.setTimeout(() => {
      console.log('From application after timeout')
    }, 3000)
  }
  catch (err) {
    console.log('Error:', err)
  }
}
