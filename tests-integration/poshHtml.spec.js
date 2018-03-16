const path = require('path');
const helpers = require('./../tests/helpers');
const PrettyHtml = require('./../src/');

test('PoshHtml library works', async () => {
  const poshHtml = new PrettyHtml();
  const write = [];

  // const stdout = [];
  // jest.spyOn(console, 'log').mockImplementation(text => stdout.push(text));

  jest.spyOn(poshHtml, 'writeFile').mockImplementation((fileName, content) => {
    write.push({ fileName, content });
  });

  try {
    await poshHtml.run('./tests-integration/**/*.html', true);
  } catch (err) {
    throw err;
  } finally {
    jest.restoreAllMocks();
  }

  expect(write.length).toBe(4);

  for (let i = 0; i < write.length; ++i) {
    const snap = helpers.getSnapshot(write[i].content);

    expect(snap).toMatchSnapshot(path.relative(__dirname, write[i].fileName));
  }
});
