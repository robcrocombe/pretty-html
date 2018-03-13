#!/usr/bin/env node
const program = require('commander');
const version = require('../package.json').version;
const PrettyHtml = require('./');

program
  .version(version, '-v, --version')
  .arguments('<input>')
  .option('-w, --write', 'rewrites all processed files in place')
  .action((input, options) => {
    new PrettyHtml().run(input, options.write);
  });

program.parse(process.argv);
