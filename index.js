const util = require('util');
const fs = require('fs');
const htmlparser = require('htmlparser');
const rawHtml = require('./test');

const handler = new htmlparser.DefaultHandler(
  (error, dom) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Success');
    }
  },
  {
    ignoreWhitespace: false,
  }
);

const parser = new htmlparser.Parser(handler);
parser.parseComplete(rawHtml);

console.log(util.inspect(handler.dom, false, null));

const INDENTATION = 2;
const LINE_LENGTH = 40;
let output = '';

parse(handler.dom[0], 0);

fs.writeFile('output.html', output, err => {
  if (err) throw err;
  console.log('✨  Done!');
});

function parse(node, indent) {
  const simpleNode =
    node.type === 'tag' &&
    node.children &&
    node.children.length === 1 &&
    node.children[0].type === 'text' &&
    !node.children[0].data.trim().includes(' ');

  switch (node.type) {
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

      simpleNode ? insert(`>${node.children[0].data.trim()}`) : insert('>\n');
      break;
    case 'text':
      if (/^\n\n\s*/.test(node.data)) {
        insert('\n');
      } else if (/^\n\s*/.test(node.data)) {
        // Ignore single newlines
      } else {
        const text = node.data.trim().replace(/(\n\s\s+)/g, ' ');
        insert(`${text}\n`, indent);
      }
      break;
    case 'comment':
      insert(`<!-- ${node.data.trim()} -->\n`, indent);
      break;
  }

  if (!simpleNode && node.children) {
    const newIndent = indent + INDENTATION;

    for (let i = 0; i < node.children.length; ++i) {
      parse(node.children[i], newIndent);
    }
  }

  switch (node.type) {
    case 'tag':
      if (node.name !== 'input') {
        insert(`</${node.name}>\n`, simpleNode ? 0 : indent);
      }
      break;
  }
}

function insert(text, indent = 0) {
  output += ' '.repeat(indent) + text;
}
