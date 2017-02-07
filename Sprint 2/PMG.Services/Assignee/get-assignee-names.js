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
                query = query + `WHERE (LTRIM(RTRIM([LastNm])) + ', ' + LTRIM(RTRIM([FirstNm])) +
                ' ' + LTRIM(RTRIM([MiddleNm])) + ' - ' + LTRIM(RTRIM([AssigneePersonnelNbr])))
                IS NOT NULL AND ((LastNm LIKE @value + '%') OR (AssigneePersonnelNbr LIKE @value + '%'))`;
            }
        }
        query = query + ' ORDER BY [Full Name]';

        return request.query(query);
    }

    function getQuery() {
        return `SELECT TOP 10 (LTRIM(RTRIM([LastNm])) + ', ' + LTRIM(RTRIM([FirstNm])) + ' ' +
                    LTRIM(RTRIM([MiddleNm])) + ' - ' + LTRIM(RTRIM([AssigneePersonnelNbr]))) AS [Full Name]
                FROM Assignee WITH(NOLOCK) `;
    }
};
