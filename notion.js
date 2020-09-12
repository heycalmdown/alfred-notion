const alfy = require('alfy');

function idToDash(id) {
  return id.substring(0, 8) + '-' + id.substring(8, 12) + '-' + id.substring(12, 16) + '-' + id.substring(16, 20) + '-' + id.substring(20);
}

function dashToId(id) {
  return id.replace(/-/g, '');
}

const { NOTION_TOKEN } = process.env;

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

async function loadPageChunk(tableId) {
  return await notion('loadPageChunk', { pageId: tableId, limit: 20, chunkNumber: 0, verticalColumns: false });
}

async function submitTransaction(operations) {
  return await notion('submitTransaction', { operations });
}

async function queryCollection(collectionId, collectionViewId) {
  return await notion('queryCollection', { collectionId, collectionViewId, loader: { limit: 500, type: 'table' }});
}


function pad(value) {
  return value.toString().padStart(2, '0');
}

function notionStartDate(now) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function notionStartTime(now) {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function notionNow() {
  const now = new Date();
  return [
    "‣",
    [
      [
        "d",
        {
          "type": "datetime",
          "time_zone": "Asia/Seoul",
          "start_date": notionStartDate(now),
          "start_time": notionStartTime(now),
          "date_format": "relative"
        }
      ]
    ]
  ];
}

exports.idToDash = idToDash;
exports.dashToId = dashToId;
exports.notionNow = notionNow;
exports.loadPageChunk = loadPageChunk;
exports.submitTransaction = submitTransaction;
exports.queryCollection = queryCollection;
