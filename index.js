const alfy = require('alfy');
const _ = require('lodash');
const { createAgent } = require('notionapi-agent');

function idToDash(id) {
    return id.substring(0, 8) + '-' + id.substring(8, 12) + '-' + id.substring(12, 16) + '-' + id.substring(16, 20) + '-' + id.substring(20);
}

function dashToId(id) {
    return id.replace(/-/g, '');
}

async function main() {
    const { NOTION_TOKEN, TABLE_ID } = process.env;
    if (!NOTION_TOKEN) return alfy.output([{ title: 'Please set your $NOTION_TOKEN', arg: 'https://www.alfredapp.com/help/workflows/advanced/variables/' }]);
    if (!TABLE_ID) return alfy.output([{ title: 'Please set your $TABLE_ID to search', arg: 'https://www.alfredapp.com/help/workflows/advanced/variables/' }]);

    const notion = new createAgent({ token: NOTION_TOKEN });

    const tableId = idToDash(TABLE_ID);
    const pageContainsCollection = await notion.loadPageChunk({ pageId: tableId, limit: 20, chunkNumber: 0, verticalColumns: false });
    console.log(pageContainsCollection);
    console.log({ pageId: tableId, limit: 20, chunkNumber: 0, verticalColumns: false });

    const res = await alfy.fetch('https://www.notion.so/api/v3/loadPageChunk', {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'accept-language': 'en-US:en;q=0.9',
            'cookie': `token_v2=${NOTION_TOKEN};`,
            'origin': 'https://www.notion.so',
            'referer': 'https://www.notion.so',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
            'accept-encoding': 'gzip, deflate',
            'content-type': 'application/json'
        },
        json: { pageId: tableId, limit: 20, chunkNumber: 0, verticalColumns: false },
        responseType: 'json'
    });
    console.log('res', res);

    const collectionId = _.keys(pageContainsCollection.recordMap.collection)[0];
    const collectionViewId = _.keys(pageContainsCollection.recordMap.collection_view)[0];
    const table = await notion.queryCollection({ collectionId, collectionViewId, loader: { limit: 500, type: 'table' }});
    const pagesHavingTitles = _.values(table.recordMap.block).filter(o => o.value && o.value.properties && o.value.properties.title).filter(Boolean);
    const items = alfy.inputMatches(pagesHavingTitles, 'value.properties.title.0.0')
        .map(o => ({
            title: o.value.properties.title[0][0],
            arg: `https://notion.so/${dashToId(o.value.id)}`
        }));
    alfy.output(items);
}

main();
