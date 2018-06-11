const doc = require('dynamodb-doc')
const uuid = require('uuid4')
const dynamo = new doc.DynamoDB()
const TableName = 'factories'
const responseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
}
const Ajv = require('ajv')
const ajvOptions = { allErrors: true }
const schemas = require('./schemas')

exports.handler = function(event, context, callback) {
  const ajv = new Ajv(ajvOptions)
  const body = JSON.parse(event.body || '{}')

  function done(err, res) {
    callback(null, {
      statusCode: err ? '400' : '200',
      body: JSON.stringify(res),
      headers: responseHeaders
    })
  }
  function validate(schema, callback) {
    if (!ajv.validate(schema, body)) {
      return done(null, { errors: ajv.errorsText() })
    }
    callback()
  }

  switch (event.httpMethod) {
    case 'GET':
      dynamo.scan({ TableName }, done)
      break
    case 'DELETE':
      validate(schemas.DeleteRequest, () =>
        dynamo.deleteItem(Object.assign(body, { TableName }), done))
      break
    case 'POST':
      validate(schemas.PostRequest, () => {
        const FactoryID = body.Item.FactoryID || uuid()
        const params = {
          TableName,
          Item: Object.assign(body.Item, { FactoryID })
        }
        dynamo.putItem(params, (err) => {
          if (err) return done(err)
          done(null, { FactoryID })
        })
      })
      break
    default:
      done(new Error(`Unsupported method '${event.httpMethod}'`))
  }
}

