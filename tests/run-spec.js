const fs = require('fs');
const Printer = require('./../src/printer');

const prettyHtml = new Printer();
const SOURCE_SEPARATOR = '------------SOURCE PREVIEW------------\n';
const OUTPUT_SEPARATOR = '\n------------OUTPUT PREVIEW------------\n\n';

// https://github.com/prettier/prettier/blob/master/tests_config/run_spec.js
function run_spec(dirName) {
  fs.readdirSync(dirName).forEach(fileName => {
    const path = dirName + '/' + fileName;

    if (fileName !== 'fmt.spec.js' && fs.lstatSync(path).isFile()) {
      const source = fs.readFileSync(path, 'utf8');

      const output = prettyHtml.run(source);

      const snap = raw(SOURCE_SEPARATOR + source + OUTPUT_SEPARATOR + output);

      test(fileName, () => {
        expect(snap).toMatchSnapshot(fileName);
      });
    }
  });
}

/**
 * Wraps a string in a marker object that is used by `./raw-serializer.js` to
 * directly print that string in a snapshot without escaping all double quotes.
 * Backticks will still be escaped.
 */
function raw(string) {
  return { [Symbol.for('raw')]: string };
}

global.run_spec = run_spec;
