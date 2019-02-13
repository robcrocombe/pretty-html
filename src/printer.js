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
  run(rawHtml) {
    this.output = '';

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

    const simpleNode =
      node.type === 'tag' &&
      node.children &&
      node.children.length === 1 &&
      node.children[0].type === 'text' &&
      node.children[0].data.trim().length &&
      node.children[0].data.trim().length <= 25;

    const emptyNode =
      node.type === 'tag' &&
      ((node.children &&
        node.children.length === 1 &&
        node.children[0].type === 'text' &&
        !node.children[0].data.trim().length) ||
        !node.children);

    // if (node.name === 'lookup-search-result') {
    //   console.log(node);
    // }

    switch (node.type) {
      case 'script':
      case 'style':
      case 'tag':
        // Start tag
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

        if (pre || simpleNode) {
          this.insert('>');
        } else {
          this.insert('>\n');
        }

        const newIndent = indent + INDENTATION;

        // Children
        if (pre) {
          for (let i = 0; i < node.children.length; ++i) {
            this.parseUnformatted(node.children[i], newIndent);
          }
        } else if (node.children) {
          for (let i = 0; i < node.children.length; ++i) {
            this.parse(node.children[i], newIndent);
          }
        }

        // End tag
        if (pre) {
          this.insert(`</${node.name}>\n`);
        } else if (!voidElements[node.name]) {
          this.insert(`</${node.name}>\n`, simpleNode ? 0 : indent);
        } else {
          this.insert(`\n`);
        }
        break;
      case 'text':
        if (/^\n\n\s*/.test(node.data)) {
          this.insert('\n');
        } else if (/^\n\s*/.test(node.data)) {
          // Ignore end-of-line characters
        } else {
          // const text = node.data.replace(/\s+/g, ' ').trim();
          const text = node.data.trim().replace(/(\n\s\s+)/g, ' ');
          if (text) {
            // console.log(JSON.stringify(text));
            this.insert(text, indent);
          }
        }
        break;
      case 'comment':
        this.insert(`<!-- ${node.data.trim()} -->\n`, indent);
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
