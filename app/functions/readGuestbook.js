'use strict';
console.log('Loading function');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});

exports.handler = function(e, ctx, callback){
    let scanningParameters = {
        TableName: 'guestbook',
        Limit: 100
    };
    docClient.scan(scanningParameters, function(err,data){
        if(err){
            callback(err,null);
        }else{
            callback(null, data);
        }
    })

/*    var params={
        TableName: 'guestbook',
        Key: {
            "date": 1502209348827
        }
    }
    docClient.get(params, function(err, data){
        if(err){
            callback(err, null);
            }
            else{
                callback(null, data);
            }
        }); */

}