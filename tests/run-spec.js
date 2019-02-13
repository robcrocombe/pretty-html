const fs = require('fs');
const path = require('path');
const Printer = require('./../src/printer');
const helpers = require('./helpers');

const prettyHtml = new Printer();

// https://github.com/prettier/prettier/blob/master/tests_config/run_spec.js
function run_spec(dirName) {
  fs.readdirSync(dirName).forEach(fileName => {
    const filePath = dirName + '/' + fileName;

    if (fileName !== 'fmt.spec.js' && fs.lstatSync(filePath).isFile()) {
      const source = fs.readFileSync(filePath, 'utf8');

      const output = prettyHtml.run(source);

      const snap = helpers.compositeSnapshot(source, output);

      test(path.basename(dirName), () => {
        expect(snap).toMatchSnapshot(fileName);
      });
    }
  });
}

global.run_spec = run_spec;
