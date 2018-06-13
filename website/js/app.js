const factoriesUrl = 'https://jic5ut3ep2.execute-api.us-east-1.amazonaws.com/prod/factories'
const websocketUrl = 'wss://ws.factory-tree.com'
const ClientID = Math.random().toString(16).substring(2)

function request(options) {
  return fetch(factoriesUrl, options)
    .then((res) => res.json())
}
const db = {
  getAll: function() {
    return request({
      method: 'GET'
    })
      .then((res) => res.Items)
  },
  upsert: function(item) {
    return request({
      method: 'POST',
      body: JSON.stringify({ Item: item }),
      headers: { 'content-type': 'application/json' }
    })
  },
  remove: function(item) {
    return request({
      method: 'DELETE',
      body: JSON.stringify({ Key: { FactoryID: item.FactoryID } }),
      headers: { 'content-type': 'application/json' }
    })
  }
}

const methods = {
  create: function() {
    const FactoryName = prompt('Factory name')
    const MinValue = Number(prompt('Minimum value', 1))
    const MaxValue = Number(prompt('Maximum value', 100))
    const Count = Number(prompt('Child count', 3))
    const Children =_.times(Count, () => _.random(MinValue, MaxValue))
    const item = {
      FactoryName,
      MinValue,
      MaxValue,
      Children,
      Count,
      ClientID
    }

    db.upsert(item)
      .then((res) => this.items.unshift(_.assign(item, res, {show: false})))
      .catch((err) => alert(err))
  },

  remove: function(FactoryID) {
    const item = _.find(this.items, { FactoryID })

    if (!window.confirm(`confirm remove ${item.FactoryName}`)) return

    _.assign(item, { ClientID })

    db.remove(item)
      .then(() => this.items = _.reject(this.items, { FactoryID }))
      .catch((err) => alert(err))
  },

  generate: function(FactoryID) {
    const item = _.find(this.items, { FactoryID })

    if (item.MinValue > item.MaxValue) return alert('ernt')

    _.assign(item, {
      Children: _.times(item.Count, () => _.random(item.MinValue, item.MaxValue))
    })
  },

  save: function(FactoryID) {
    const item = _.find(this.items, { FactoryID })

    if (!window.confirm(`confirm save ${item.FactoryName}`)) return

    _.assign(item, { ClientID })

    db.upsert(_.omit(item, 'show'))
      .catch((err) => alert(err))
  }
}

const data = {
  items: []
}

const app = new Vue({
  el: '#app',
  data,
  methods
})


db.getAll().then((items) => {
  const sortedItems = _.sortBy(items, 'FactoryName')
  data.items = _.map(sortedItems, (i) => _.assign(i, { show: false }))
})

const websocket = new WebSocket(websocketUrl)

websocket.onmessage = function(message) {
  const { FactoryID, Type, Item } = JSON.parse(message.data)
  if (Item.ClientID === ClientID) return
  switch (Type) {
    case 'INSERT':
      data.items.unshift(_.assign(Item, { show: false }))
      break;
    case 'REMOVE':
      data.items = _.reject(data.items, { FactoryID })
      break;
    case 'MODIFY':
      const item = _.find(data.items, { FactoryID })
      _.assign(item, Item)
      break;
  }
}

websocket.onopen = function() {
  websocket.send(JSON.stringify({ ClientID }))
}


