const util = require('util');
const beautify = require('js-beautify').html;
const htmlparser = require('htmlparser');
const LINE_LENGTH = 40;

class Printer {
  constructor() {
    this.output = '';
    this.indent = 0;
  }

  run(rawHtml) {
    const processedHtml = beautify(rawHtml, {
      type: 'html',
      indent_size: 2,
      wrap_line_length: 0,
      indent_inner_html: true,
      indent_handlebars: true,
      max_preserve_newlines: 1,
      end_with_newline: true,
    });

    return this.test(processedHtml);
  }

  test(html) {
    const regex = /<(?![!\/]).*?>/gi;

    return html.replace(regex, (match, p1) => {
      const handler = new htmlparser.DefaultHandler(
        (err, dom) => {
          if (err) throw err;
        },
        {
          ignoreWhitespace: false,
        }
      );

      const parser = new htmlparser.Parser(handler);
      parser.parseComplete(match);

      const node = handler.dom[0];

      let out = `<${node.name}`;

      if (node.attribs) {
        const attrCount = Object.keys(node.attribs).length;

        for (const k in node.attribs) {
          const attrib = this.formatAttribute(k, node.attribs);

          if (node.raw.length > 40 && attrCount > 1) {
            out += '\n';
            out += ' '.repeat(4) + attrib;
          } else {
            out += ' ' + attrib;
          }
        }
      }

      out += '>';

      return out;
    });
  }

  parse(node, indent) {
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
        if (pre) {
          this.insert(node.data);
        } else {
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
        }
        break;
      case 'comment':
        this.insert(`<!-- ${node.data.trim()} -->\n`, indent);
        break;
    }

    if (!simpleNode && node.children) {
      const newIndent = indent + INDENTATION;

      for (let i = 0; i < node.children.length; ++i) {
        this.parse(node.children[i], newIndent, pre);
      }
    }

    switch (node.type) {
      case 'tag':
        if (preformatted) {
          this.insert(`</${node.name}>`, 0);
        } else if (voidElements.indexOf(node.name) === -1) {
          this.insert(`</${node.name}>\n`, simpleNode || pre ? 0 : indent);
        } else {
          this.insert(`\n`, 0);
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
