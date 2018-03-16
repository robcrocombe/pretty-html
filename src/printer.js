const util = require('util');
const htmlparser = require('htmlparser');
const voidElements = require('./printer.config');
const INDENTATION = 2;
const LINE_LENGTH = 40;

htmlparser.DefaultHandler._emptyTags = {
  ...htmlparser.DefaultHandler._emptyTags,
  source: 1,
  track: 1,
  wbr: 1,
};

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

    // console.log(util.inspect(handler.dom, false, null));

    for (let i = 0; i < handler.dom.length; ++i) {
      this.parse(handler.dom[i], 0);
    }

    return this.output;
  }

  parse(node, indent) {
    const pre = node.name === 'pre';
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

        if (pre) {
          this.insert('>');
        } else {
          simpleNode
            ? this.insert(`>${node.children ? node.children[0].data.trim() : ''}`)
            : this.insert('>\n');
        }
        break;
      case 'text':
        if (/^\n\n\s*/.test(node.data)) {
          this.insert('\n');
        } else if (/^\n\s*/.test(node.data)) {
          // Ignore end-of-line characters
        } else {
          const text = node.data.trim().replace(/(\n\s\s+)/g, ' ');
          if (text) {
            this.insert(`${text}\n`, indent);
          }
        }
        break;
      case 'comment':
        this.insert(`<!-- ${node.data.trim()} -->\n`, indent);
        break;
    }

    if (pre) {
      const newIndent = indent + INDENTATION;

      for (let i = 0; i < node.children.length; ++i) {
        this.parseUnformatted(node.children[i], newIndent);
      }
    } else if (!simpleNode && node.children) {
      const newIndent = indent + INDENTATION;

      for (let i = 0; i < node.children.length; ++i) {
        this.parse(node.children[i], newIndent);
      }
    }

    switch (node.type) {
      case 'tag':
        if (pre) {
          this.insert(`</${node.name}>\n`);
        } else if (voidElements.indexOf(node.name) === -1) {
          this.insert(`</${node.name}>\n`, simpleNode ? 0 : indent);
        } else {
          this.insert(`\n`);
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

  parseUnformatted(node, indent) {
    switch (node.type) {
      case 'tag':
        this.insert(`<${node.name}`);
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

        this.insert('>');
        break;
      case 'text':
        this.insert(node.data);
        break;
      case 'comment':
        this.insert(`<!-- ${node.data} -->`);
        break;
    }

    if (node.children) {
      const newIndent = indent + INDENTATION;

      for (let i = 0; i < node.children.length; ++i) {
        this.parseUnformatted(node.children[i], newIndent);
      }
    }

    switch (node.type) {
      case 'tag':
        this.insert(`</${node.name}>`);
        break;
    }
  }
}

module.exports = Printer;
