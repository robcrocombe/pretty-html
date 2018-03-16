const SOURCE_SEPARATOR = '------------SOURCE PREVIEW------------\n';
const OUTPUT_SEPARATOR = '\n------------OUTPUT PREVIEW------------\n\n';

function compositeSnapshot(source, received) {
  return raw(SOURCE_SEPARATOR + source + OUTPUT_SEPARATOR + received);
}

function getSnapshot(str) {
  return raw(str);
}

/**
 * Wraps a string in a marker object that is used by `./raw-serializer.js` to
 * directly print that string in a snapshot without escaping all double quotes.
 * Backticks will still be escaped.
 */
function raw(string) {
  return { [Symbol.for('raw')]: string };
}

module.exports = {
  compositeSnapshot,
  getSnapshot,
};
