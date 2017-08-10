var AWS = require('aws-sdk');
console.log("Loading Function");
AWS.config.region = 'us-west-2';

var lambda = new AWS.Lambda();
var functionName = 'writeGuestbook';

lambda.getFunction({FunctionName: functionName},function(err,data){
    if(err){
        if(err.statusCode == 404){
            var warning = 'Unable to find lambda function ';
        } else{
            var warning = 'AWS API request failed. '
            console.log(warning);
        }
    }
   var current = data.Configuration;
    var params = {
      FunctionName: functionName,
      Handler: current.Handler,
      Mode: current.Mode,
      Role: current.Role,
      Runtime: current.Runtime
    };

    
});