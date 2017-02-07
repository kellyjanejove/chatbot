'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function(event, context, callback) {

    console.log('Loading...');

    utils.getDbConfig()
        .then(function(data) {
            var connString = JSON.parse(data.Body);

            sql.connect(connString)
                .then(getList)
                .then(function(data) {
                    sql.close();
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(data)
                    });
                }).catch(function(err) {
                    utils.handleError(err, callback);
                });
        }).catch(function(err) {
            utils.handleError(err, callback);
        });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();
        var params = event.queryStringParameters;

        if (params && Object.keys(params).length) {
            if (typeof params.value === 'string' && params.value !== '') {
                request.input('value', sql.VarChar, params.value);
                query = query + "WHERE AssigneePersonnelNbr LIKE @value + '%'";
            }
        }

        return request.query(query);
    }

    function getQuery() {
        return `SELECT TOP 10 LTRIM(RTRIM(AssigneePersonnelNbr)) AS [AssigneePersonnelNumber]
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
