'use strict';

const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({
  region: 'us-east-1'
});
const s3 = new AWS.S3();

const handleError = function (err, callback) {
  //console.log(err.message);
  //console.log(err.name);

  console.log(err.stack);
  callback(null, {
    'statusCode': 500,
    'body': err.message
  });
};

const invokeLambda = function (lambdaName) {
  let params = {
    //FunctionName: '6900-my-reads-stage-get-dbconfig'
    FunctionName: lambdaName
  };
  return lambda.invoke(params).promise();
};

const getDbConfig = function () {

  var isInTest = typeof global.it === 'function';

  if (isInTest) {
    return getDbConfigForTest();
  } else {
    return getDBConfigFromS3();
  }
};

const getDbConfigForTest = function () {
  return new Promise(function (resolve, reject) {
    var body = JSON.stringify({
      'server': 'myreads.cyff9e8mtegh.us-east-1.rds.amazonaws.com',
      'user': 'sa',
      'password': 'silentit',
      'database': 'MyReads-Test'
    });
    resolve({Body: body}); // fulfills the promise with `data` as the value
  });

};

const getDBConfigFromS3 = function () {

  let params = {
    Bucket: process.env.CONFIGURATION_BUCKET,
    Key: 'dbconfig.json'
  };

  return s3.getObject(params).promise();
};

const lambdaUtils = {
  invokeLambda: invokeLambda,
  handleError: handleError,
  getDbConfig: getDbConfig
};

module.exports = lambdaUtils;
