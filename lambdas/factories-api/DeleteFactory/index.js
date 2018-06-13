const doc = require('dynamodb-doc')
const dynamo = new doc.DynamoDB()
const TableName = process.env.TABLE_NAME
const responseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
}

exports.handler = function(event, context, callback) {
  function done(err, res) {
    callback(null, {
      statusCode: err ? 400 : 200,
      body: JSON.stringify(res),
      headers: responseHeaders
    })
  }

  dynamo.deleteItem(Object.assign(JSON.parse(event.body), { TableName }), done)
}


