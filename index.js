const util = require('util');
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
console.log(output);

function parse(node, indent) {
  switch(node.type) {
    case 'tag':
      insert(`<${node.name}`, indent);
      if (node.attribs) {
        for (const k in node.attribs) {
          if (node.raw.length > LINE_LENGTH) {
            insert('\n');
            insert(`${k}="${node.attribs[k]}"`, indent + INDENTATION);
          } else {
            insert(`${k}="${node.attribs[k]}"`, 1);
          }
        }
        if (node.raw.length > LINE_LENGTH) {
          insert('\n');
          insert('>\n', indent);
        } else {
          insert('>\n', indent);
        }
      } else {
        insert('>\n');
      }
      break;
    case 'text':
      insert(node.data, indent);
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
      insert('\n');
      insert(`</${node.name}>`, indent);
      break;
  }
}

function insert(text, indent = 0) {
  output += ' '.repeat(indent) + text;
}
