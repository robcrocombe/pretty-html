const util = require('util');
const fs = require('fs');
const htmlparser = require('htmlparser');
const rawHtml = require('./test');

const handler = new htmlparser.DefaultHandler((error, dom) => {
  if (error) {
    console.error(error);
  }
  else {
    console.log('Success');
  }
}, {
  ignoreWhitespace: true,
});

const parser = new htmlparser.Parser(handler);
parser.parseComplete(rawHtml);

console.log(util.inspect(handler.dom, false, null));

const INDENTATION = 2;
const LINE_LENGTH = 40;
let output = '';

parse(handler.dom[0], 0);

fs.writeFile('output.html', output, (err) => {
  if (err) throw err;
  console.log('Done');
});

function parse(node, indent) {
  switch(node.type) {
    case 'tag':
      insert(`<${node.name}`, indent);
      if (node.attribs) {
        const attrCount = Object.keys(node.attribs).length;

        for (const k in node.attribs) {
          if (node.raw.length > LINE_LENGTH && attrCount > 1) {
            insert('\n');
            insert(`${k}="${node.attribs[k]}"`, indent + INDENTATION);
          } else {
            insert(`${k}="${node.attribs[k]}"`, 1);
          }
        }
      }
      insert('>\n');
      break;
    case 'text':
      insert(`${node.data.trim()}\n`, indent);
      break;
    case 'comment':
      insert(`<!-- ${node.data.trim()} -->\n`, indent);
      break;
  }

  if (node.children) {
    const newIndent = indent + INDENTATION;

    for (let i = 0; i < node.children.length; ++i) {
      parse(node.children[i], newIndent);
    }
  }

  switch(node.type) {
    case 'tag':
      // insert('\n');
      if (node.name !== 'input') {
        insert(`</${node.name}>\n`, indent);
      }
      break;
  }
}

function insert(text, indent = 0) {
  output += ' '.repeat(indent) + text;
}
