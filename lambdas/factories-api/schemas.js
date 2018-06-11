
exports.DeleteRequest = {
  properties: {
    Key: {
      properties: {
        FactoryID: {
          type: 'string',
          format: 'uuid'
        }
      },
      required: [ 'FactoryID' ]
    }
  },
  required: [ 'Key' ]
}

exports.PostRequest = {
  properties: {
    Item: {
      properties: {
        FactoryName: {
          type: 'string',
          minLength: 3
        },
        Children: {
          type: 'array',
          items: {
            type: 'number'
          },
          maxItems: 15
        },
        MinValue: {
          type: 'number',
          minimum: 1,
          maximum: 1000
        },
        MaxValue: {
          type: 'number',
          minimum: 1,
          maximum: 1000
        },
      },
      required: [
        'FactoryName',
        'Children',
        'MinValue',
        'MaxValue'
      ]
    }
  },
  required: [ 'Item' ]
}
