const util = require('util');
const htmlparser = require('htmlparser');

const INDENTATION = 2;
const LINE_LENGTH = 40;

// console.log(util.inspect(handler.dom, false, null));

class Printer {
  constructor() {
    this.output = '';
  }

  run(rawHtml) {
    const handler = new htmlparser.DefaultHandler(
      (err, dom) => {
        if (err) throw err;
      },
      {
        ignoreWhitespace: false,
      }
    );

    const parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);

    this.parse(handler.dom[0], 0);

    return this.output;
  }

  parse(node, indent) {
    // A tag with either no children, or one child with no spaces
    const simpleNode =
      node.type === 'tag' &&
      ((node.children &&
        node.children.length === 1 &&
        node.children[0].type === 'text' &&
        node.children[0].data.trim().length <= 25) ||
        !node.children);

    switch (node.type) {
      case 'tag':
        this.insert(`<${node.name}`, indent);
        if (node.attribs) {
          const attrCount = Object.keys(node.attribs).length;

          for (const k in node.attribs) {
            const attrib = this.formatAttribute(k, node.attribs);

            if (node.raw.length > LINE_LENGTH && attrCount > 1) {
              this.insert('\n');
              this.insert(attrib, indent + INDENTATION);
            } else {
              this.insert(attrib, 1);
            }
          }
        }

        simpleNode
          ? this.insert(`>${node.children ? node.children[0].data.trim() : ''}`)
          : this.insert('>\n');
        break;
      case 'text':
        if (/^\n\n\s*/.test(node.data)) {
          this.insert('\n');
        } else if (/^\n\s*/.test(node.data)) {
          // Ignore single newlines
        } else {
          const text = node.data.trim().replace(/(\n\s\s+)/g, ' ');
          this.insert(`${text}\n`, indent);
        }
        break;
      case 'comment':
        this.insert(`<!-- ${node.data.trim()} -->\n`, indent);
        break;
    }

    if (!simpleNode && node.children) {
      const newIndent = indent + INDENTATION;

      for (let i = 0; i < node.children.length; ++i) {
        this.parse(node.children[i], newIndent);
      }
    }

    switch (node.type) {
      case 'tag':
        if (node.name !== 'input') {
          this.insert(`</${node.name}>\n`, simpleNode ? 0 : indent);
        }
        break;
    }
  }

  formatAttribute(key, attribs) {
    return key === attribs[key] ? key : `${key}="${attribs[key]}"`;
  }

  insert(text, indent = 0) {
    this.output += ' '.repeat(indent) + text;
  }
}

module.exports = Printer;
