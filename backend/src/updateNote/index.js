const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const noteId = event.pathParameters.id;
    const body = JSON.parse(event.body);
    
    let updateExpression = 'SET updatedAt = :updatedAt';
    let expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };
    let expressionAttributeNames = {};

    if (body.title !== undefined) {
      updateExpression += ', #t = :title';
      expressionAttributeValues[':title'] = body.title;
      expressionAttributeNames['#t'] = 'title';
    }
    
    if (body.content !== undefined) {
      updateExpression += ', #c = :content';
      expressionAttributeValues[':content'] = body.content;
      expressionAttributeNames['#c'] = 'content';
    }

    if (body.isPinned !== undefined) {
      updateExpression += ', isPinned = :isPinned';
      expressionAttributeValues[':isPinned'] = body.isPinned;
    }

    const params = {
      TableName: process.env.TABLE_NAME,
      Key: { noteId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    const { Attributes } = await docClient.send(new UpdateCommand(params));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(Attributes)
    };
  } catch (err) {
    console.error('Error updating note:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update note', details: err.message })
    };
  }
};
