const alfy = require('alfy');

const { loadPageChunk, idToDash } = require('./notion');

const { NOTION_TOKEN, SEEDBED_ID } = process.env;

function makeSubtitle() {
  return process.argv.slice(2).join(' ');
}

async function main() {
  if (!NOTION_TOKEN) return alfy.output([{ title: 'Please set your $NOTION_TOKEN', arg: 'https://www.alfredapp.com/help/workflows/advanced/variables/' }]);
  if (!SEEDBED_ID) return alfy.output([{ title: 'Please set your $SEEDBED_ID to search', arg: 'https://www.alfredapp.com/help/workflows/advanced/variables/' }]);

  const pageId = idToDash(SEEDBED_ID);
  const page = await loadPageChunk(pageId);
  const title = page.recordMap.block[pageId].value.properties.title[0][0];
  const message = process.argv.slice(2).join(' ');

  alfy.output([{title: `${title}`, subtitle: `${makeSubtitle()}`, arg: message}]);
}

main();
