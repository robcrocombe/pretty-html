#!/usr/bin/env node
const program = require('commander');
const version = require('../package.json').version;
const PrettyHtml = require('./');

program
  .version(version, '-v, --version')
  .arguments('<input>')
  .action(input => {
    new PrettyHtml().run(input);
  });

program.parse(process.argv);
