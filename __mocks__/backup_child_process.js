'use strict';

const child_process = jest.genMockFromModule('child_process');

function spawn(directoryPath) {
  return Object.create(directoryPath);
}

child_process.spawn  = spawn ;

module.exports = child_process;