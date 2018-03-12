const fs = require('fs');
const glob = require('globby');
const Generator = require('./generator');

async function run(input) {
  const paths = await glob(input);

  for (let i = 0; i < paths.length; ++i) {
    fs.readFile(paths[i], 'utf8', (err, contents) => {
      if (err) throw err;

      console.log(paths[i]);

      new Generator().run(paths[i], contents);
    });
  }
}

module.exports = {
  run,
};
