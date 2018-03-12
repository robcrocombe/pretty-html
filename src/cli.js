#!/usr/bin/env node
const program = require('commander');
const version = require('../package.json').version;
const main = require('./');

program
  .version(version, '-v, --version')
  .arguments('<input>')
  .action(input => {
    main.run(input);
  });

program.parse(process.argv);
