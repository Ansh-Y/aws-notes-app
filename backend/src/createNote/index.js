const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = JSON.parse(event.body);
    const { title, content } = body;

    if (!title || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Title and content are required' })
      };
    }

    const noteId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const note = {
      noteId,
      title,
      content,
      isPinned: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const params = {
      TableName: process.env.TABLE_NAME,
      Item: note
    };

    await docClient.send(new PutCommand(params));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(note)
    };
  } catch (err) {
    console.error('Error creating note:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create note', details: err.message })
    };
  }
};
