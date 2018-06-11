const http = require('http')
const _ = require('lodash')
const WebSocket = require('ws')
const express = require('express')
const bodyparser = require('body-parser')
const parseItem = require('dynamodb-marshaler').unmarshalItem
const SnsValidator = require('sns-validator')
const snsValidator = new SnsValidator()

const app = express()
const server = http.createServer(app)
const ws = new WebSocket.Server({ server })

function broadcast(message) {
  for (const client of ws.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  }
}
function prepareMessage(record) {
  const FactoryID = _.get(record, 'dynamodb.Keys.FactoryID.S')
  const newItem = _.get(record, 'dynamodb.NewImage', {})
  return JSON.stringify({
    FactoryID,
    Type: record.eventName,
    Item: parseItem(newItem)
  })
}
function validateSnsMessage(req, res, next) {
  snsValidator.validate(req.body, (err) => {
    if (err) return res.status(403).end()
    next()
  })
}

app.use(bodyparser.json({ type: 'text/plain' }))
app.post('/factoriesUpdate', validateSnsMessage, (req, res) => {
  const message = JSON.parse(req.body.Message)
  const records = _.get(message, 'Records', [])
  _.each(records, (record) => broadcast(prepareMessage(record)))
  res.end()
})

server.listen(4000, () => console.log('listening'))

