const AWS = require('aws-sdk')
const TopicArn = process.env.TOPIC_ARN

exports.handler = function(event, context) {
    var sns = new AWS.SNS()
    sns.publish({ TopicArn, Message: JSON.stringify(event) }, context.done)
}
