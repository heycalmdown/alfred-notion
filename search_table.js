const alfy = require('alfy');
const _ = require('lodash');

const { idToDash, dashToId, loadPageChunk, queryCollection } = require('./notion');

const { NOTION_TOKEN, TABLE_ID } = process.env;

async function main() {
    if (!NOTION_TOKEN) return alfy.output([{ title: 'Please set your $NOTION_TOKEN', arg: 'https://www.alfredapp.com/help/workflows/advanced/variables/' }]);
    if (!TABLE_ID) return alfy.output([{ title: 'Please set your $TABLE_ID to search', arg: 'https://www.alfredapp.com/help/workflows/advanced/variables/' }]);

    const tableId = idToDash(TABLE_ID);

    const pageContainsCollection = await loadPageChunk(tableId);

    const collectionId = _.keys(pageContainsCollection.recordMap.collection)[0];
    const collectionViewId = _.keys(pageContainsCollection.recordMap.collection_view)[0];
    const table = await queryCollection(collectionId, collectionViewId);
    const pagesHavingTitles = _.values(table.recordMap.block).filter(o => o.value && o.value.properties && o.value.properties.title).filter(Boolean);
    const items = alfy.inputMatches(pagesHavingTitles, 'value.properties.title.0.0')
        .map(o => ({
            title: o.value.properties.title[0][0],
            arg: `https://notion.so/${dashToId(o.value.id)}`
        }));
    alfy.output(items);
}

main();
