const fs = require('fs');
const path = require('path');
const glob = require('globby');
const Generator = require('./generator');

class PrettyHtml {
  async run(input, overwrite) {
    const paths = await glob(input);

    for (let i = 0; i < paths.length; ++i) {
      fs.readFile(paths[i], 'utf8', (err, contents) => {
        if (err) throw err;

        console.log(path.relative(__dirname, paths[i]));

        const output = new Generator().run(contents);

        if (overwrite) {
          this.writeFile(output, paths[i]);
        }
      });
    }
  }

  writeFile(output, path) {
    fs.writeFile(path, output, err => {
      if (err) throw err;
      console.log('✨  Done!');
    });
  }
}

module.exports = PrettyHtml;
