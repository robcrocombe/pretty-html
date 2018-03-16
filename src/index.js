const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const glob = require('globby');
const Printer = require('./printer');

class PrettyHtml {
  async run(input, overwrite) {
    const paths = await glob(input);
    const tasks = [];

    for (let i = 0; i < paths.length; ++i) {
      const t = readFileAsync(paths[i], { encoding: 'utf8' }).then(source => {
        console.log(path.relative(__dirname, paths[i]));

        const output = new Printer().run(source);

        if (overwrite) {
          return this.writeFile(paths[i], output);
        } else {
          return output;
        }
      });

      tasks.push(t);
    }

    return Promise.all(tasks).then(() => {
      console.log('✨  Done!');
    });
  }

  writeFile(writePath, text) {
    const p = path.resolve(path.dirname(writePath), 'out_' + path.basename(inPath));

    return writeFileAsync(p, text);
  }
}

module.exports = PrettyHtml;
