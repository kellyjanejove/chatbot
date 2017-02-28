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
        headers: {
            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
        },
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
        return getDbConfigFromS3('Config/testdbconfig.json');
    } else {
        return getDbConfigFromS3('Config/dbconfig.json');
    }
};

const getDbConfigFromS3 = function (key) {

    let params = {
        Bucket: '6900-pmg-dev-dropfolder',
        Key: key
    };

    return s3.getObject(params).promise();
};

const lambdaUtils = {
    invokeLambda: invokeLambda,
    handleError: handleError,
    getDbConfig: getDbConfig
};

module.exports = lambdaUtils;
