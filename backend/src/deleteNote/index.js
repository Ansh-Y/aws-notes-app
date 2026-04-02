const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const noteId = event.pathParameters.id;

    const params = {
      TableName: process.env.TABLE_NAME,
      Key: { noteId }
    };

    await docClient.send(new DeleteCommand(params));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Note deleted successfully', noteId })
    };
  } catch (err) {
    console.error('Error deleting note:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete note', details: err.message })
    };
  }
};
