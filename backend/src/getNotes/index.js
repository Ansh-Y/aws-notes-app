const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const params = {
      TableName: process.env.TABLE_NAME
    };
    const { Items } = await docClient.send(new ScanCommand(params));
    
    // Optional: Sort by createdAt desc by default
    const sortedItems = Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(sortedItems)
    };
  } catch (err) {
    console.error('Error fetching notes:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch notes', details: err.message })
    };
  }
};
