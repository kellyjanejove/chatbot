'use strict';

const sql = require('mssql');
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const lambda = new AWS.Lambda();

console.log('Loading...');

const params = {
    FunctionName: '6900-PMG-Dev-Get-Dbconfig-From-S3'
};

exports.handler = function (event, context, callback) {
    try {
        lambda.invoke(params, function (err, data) {
            if (err) {
                handleError(err);
            } else {
                var connString = JSON.parse(data.Payload);

                sql.connect(connString, function (err) {
                    if (err) {
                        handleError(err);
                    } else {
                        getList(function (err, data) {
                            sql.close();
                            if (err) {
                                handleError(err);
                            } else {
                                callback(null, {
                                    statusCode: 200,
                                    headers: {},
                                    body: JSON.stringify(data)
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (err) {
        handleError(err);
    }

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();
        var params = event.queryStringParameters;

        if (params && Object.keys(params).length) {
            if (typeof params.value === 'string' && params.value !== '') {
                request.input('value', sql.VarChar, params.value);
                query = query + `WHERE (LTRIM(RTRIM([LastNm])) + ', ' + LTRIM(RTRIM([FirstNm])) +
                ' ' + LTRIM(RTRIM([MiddleNm])) + ' - ' + LTRIM(RTRIM([AssigneePersonnelNbr])))
                IS NOT NULL AND ((LastNm LIKE @value + '%') OR (AssigneePersonnelNbr LIKE @value + '%'))`;
            }
        }
        query = query + ' ORDER BY [Full Name]';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT TOP 10 (LTRIM(RTRIM([LastNm])) + ', ' + LTRIM(RTRIM([FirstNm])) + ' ' +
                    LTRIM(RTRIM([MiddleNm])) + ' - ' + LTRIM(RTRIM([AssigneePersonnelNbr]))) AS [Full Name]
                FROM Assignee WITH(NOLOCK) `;
    }

    function handleError(err) {
        console.log(err.message);
        callback(null, {
            statusCode: 500,
            body: err.message
        });
    }
};
