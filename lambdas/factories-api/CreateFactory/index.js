const crypto = require('crypto')
const doc = require('dynamodb-doc')
const dynamo = new doc.DynamoDB()
const TableName = process.env.TABLE_NAME
const responseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
}

/* From uuid4 module; voids a dependency */
function genUUID() {
  let rnd = crypto.randomBytes(16)
  rnd[6] = (rnd[6] & 0x0f) | 0x40
  rnd[8] = (rnd[8] & 0x3f) | 0x80
  rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/)
  rnd.shift()
  return rnd.join('-')
}

exports.handler = function(event, context, callback) {
  const body = JSON.parse(event.body)
  function done(err, res) {
    callback(null, {
      statusCode: err ? 400 : 200,
      body: JSON.stringify(res),
      headers: responseHeaders
    })
  }

  const FactoryID = body.Item.FactoryID || genUUID()
  const params = {
    TableName,
    Item: Object.assign(body.Item, { FactoryID })
  }
  dynamo.putItem(params, (err) => {
    if (err) return done(err)
    done(null, { FactoryID })
  })
}


