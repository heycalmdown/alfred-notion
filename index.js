const alfy = require('alfy');
const _ = require('lodash');

function idToDash(id) {
    return id.substring(0, 8) + '-' + id.substring(8, 12) + '-' + id.substring(12, 16) + '-' + id.substring(16, 20) + '-' + id.substring(20);
}

function dashToId(id) {
    return id.replace(/-/g, '');
}

const { NOTION_TOKEN, TABLE_ID } = process.env;

async function notion(api, body) {
    const aa = alfy.cache.get(`${api}-${JSON.stringify(body)}`);
    if (aa) return aa;
    const result = await alfy.fetch('https://www.notion.so/api/v3/' + api, {
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
        json: true,
        body,
        responseType: 'json'
    });
    alfy.cache.set(`${api}-${JSON.stringify(body)}`, result);
    return result;
}

async function getTable(tableId) {
    return await notion('loadPageChunk', { pageId: tableId, limit: 20, chunkNumber: 0, verticalColumns: false });
}

async function queryCollection(collectionId, collectionViewId) {
    return await notion('queryCollection', { collectionId, collectionViewId, loader: { limit: 500, type: 'table' }});
}

async function main() {
    if (!NOTION_TOKEN) return alfy.output([{ title: 'Please set your $NOTION_TOKEN', arg: 'https://www.alfredapp.com/help/workflows/advanced/variables/' }]);
    if (!TABLE_ID) return alfy.output([{ title: 'Please set your $TABLE_ID to search', arg: 'https://www.alfredapp.com/help/workflows/advanced/variables/' }]);

    const tableId = idToDash(TABLE_ID);

    const pageContainsCollection = await getTable(tableId);

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
