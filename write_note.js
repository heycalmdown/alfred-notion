const { v4 } = require('uuid');

const { idToDash, submitTransaction, notionNow } = require('./notion');

const { SEEDBED_ID } = process.env;

async function note(parentId, text) {
  const id = v4();

  const args = {
    id,
    type: 'text',
    alive: true,
    properties: {
      title: [notionNow(), [' ' + text]]
    },
    parent_id: parentId,
    parent_table: 'block',
    created_time: +new Date()
  };

  await submitTransaction([{
    id,
    table: 'block',
    path: [],
    command: 'set',
    args: args
  }, {
    id,
    table: 'block',
    path: [],
    command: 'update',
    args: { type: 'bulleted_list' }
  }, {
    id: parentId,
    table: 'block',
    path: ['content'],
    command: 'listAfter',
    args: {
      id
    }
  }, {
    id: parentId,
    table: 'block',
    path: ['last_edited_time'],
    command: 'set',
    args: +new Date()
  }]);

  return parentId;
}

async function main() {
  await note(idToDash(SEEDBED_ID), process.argv[2]);
}

main();
