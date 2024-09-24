'use strict';
const path = require('node:path')

console.log('From application global context');

const executeFn = async () => {
  try {
    const data = await api.fs.readFile(path.join(__dirname, './file.txt'), 'utf-8');
    // const data = await api.fs.readFile(path.join(__dirname, '../../utils/file.txt'), 'utf-8')

    console.log('Data from file:', data.toString());

    api.timers.setTimeout(() => {
      console.log('From application after timeout');
    }, 3000);
  } catch (err) {
    console.log('Error:', err)
  }
};

module.exports.executeFn = executeFn
