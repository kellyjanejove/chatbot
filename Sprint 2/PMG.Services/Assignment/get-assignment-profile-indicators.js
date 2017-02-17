'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function (event, context, callback) {

    console.log('Loading...');

    utils.getDbConfig()
        .then(function (data) {
            var connString = JSON.parse(data.Body);

            sql.connect(connString)
                .then(getList)
                .then(function (data) {
                    sql.close();
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(data)
                    });
                }).catch(function (err) {
                    utils.handleError(err, callback);
                });
        }).catch(function (err) {
            utils.handleError(err, callback);
        });

    function getList() {
        var request = new sql.Request();
        var query = getQuery();
        var params = event.queryStringParameters;

        if (params && Object.keys(params).length) {
            if (typeof params.value === 'string' && params.value !== '') {
                request.input('value', sql.VarChar, params.value);
                query = query + " AND AssignmentProfileIndicator <> '' AND AssignmentProfileIndicator LIKE @value + '%'";
            }
        }

        query = query + ' ORDER BY LTRIM(RTRIM(AssignmentProfileIndicator))';

        return request.query(query);
    }

    function getQuery() {
        return `SELECT DISTINCT TOP 10 LTRIM(RTRIM(AssignmentProfileIndicator)) AS [AssignmentProfileIndicator]
                FROM AssignmentProfileFAM WITH(NOLOCK) 
                WHERE AssignmentProfileIndicator IS NOT NULL `;
    }

};
