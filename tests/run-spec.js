const fs = require('fs');
const Printer = require('./../src/printer');
const helpers = require('./helpers');

const prettyHtml = new Printer();

// https://github.com/prettier/prettier/blob/master/tests_config/run_spec.js
function run_spec(dirName) {
  fs.readdirSync(dirName).forEach(fileName => {
    const path = dirName + '/' + fileName;

    if (fileName !== 'fmt.spec.js' && fs.lstatSync(path).isFile()) {
      const source = fs.readFileSync(path, 'utf8');

      const output = prettyHtml.run(source);

      const snap = helpers.compositeSnapshot(source, output);

      test('Unit', () => {
        expect(snap).toMatchSnapshot(fileName);
      });
    }
  });
}

global.run_spec = run_spec;
