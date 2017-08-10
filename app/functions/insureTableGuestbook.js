//Not Implemented Yet - Not Tested
'use strict';
console.log('Loading function');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });

exports.handler = function (e, ctx, callback) {

    var params = {
        TableName: "guestbook1"
    }
    var status="false";
 
    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });

    function checkTable(tableName){
        console.log("Check table: " + tableName);
        docClient.checkTable(tableName);
    }
}