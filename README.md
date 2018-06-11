# Passport challenge

Visit [factory-tree.com]('https://factory-tree.com/') to see a running example

## Architecture

### Overview

+ Domains factory-tree.com, www.factory-tree.com, ws.factory-tree.com were configured
+ The static site is hosted on S3 and served by CloudFront
+ Frontend is a basic VueJS application
+ UI calls an API Gateway endpoint to exercise CRUD on Factories data. API Gateway invokes a Lambda function that wraps DynamoDB operations
+ DynamoDB stream is configured on the factories table. The stream triggers a Lambda function that publishes the change (NewImage only) to an SNS topic
+ WebSocket server (NodeJS) is hosted on EC2 which receives SNS messages and publishes an update message over WebSocket to connected clients
+ SystemD script was written for Websocket server

### AWS services used

+ `S3` For hosting static assets
+ `CloudFront` CDN for static content in S3
+ `APIGateway` For exposing CRUD to Factories DB
+ `DynamoDB` For storing Factories
+ `Lambda` A Lambda is invoked for DynamoDB CRUD commands. Another Lambda is triggered by DynamoDB table stream to publish an event for state changes
+ `SNS` Receives state change events from Lambda
+ `EC2` Hosts a subscriber for SNS topic, and a WebSocket server for streaming updates to client
+ `Route53` For managing factory-tree.com DNS. api.factory-tree.com points to API Gateway, ws.factory-tree.com points to ELB which proxies to Websocket server on EC2
+ `ELB` For proxying WebSocket to app server
+ `ACM` For TLS management


## Todo

+ Use Cognito for Authorization, for APIGateway CRUD
+ Find a better solution to streaming events
  * Option 1: Use AppSync to manage both stream and CRUD
  * Option 2: Use AWS IoT to manage WebSocket connections. Allegedly can connect directly from browser
+ Add DAX in front of Dynamo as the application is more read than write-heavy. Getting all factories is a scan operation. API Gateway can hit DAX instead of Dynamo directly
+ Use private/public data for VueJS. I'm assigning a "show" property to the main data source, which is something only UI cares about
+ Find a clean way to test Lambda functions outside of Lambda
+ Write front-end code in such a way that it can be independently tested
+ Stylistic improvements to front-end


