'use strict';

api.console.log('From application global context');

const executeFn = async () => {
  try {
    // const data = await api.fs.readFile('./file.txt', 'utf-8');
    const data = await api.fs.readFile('../../utils/file.txt', 'utf-8')

    api.console.log('Data from file:', data.toString());

    api.timers.setTimeout(() => {
      api.console.log('From application after timeout');
    }, 3000);
  } catch (err) {
    api.console.log('Error:', err)
  }
};

module.exports.executeFn = executeFn
