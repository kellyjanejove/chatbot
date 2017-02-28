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
                        headers: {
                            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
                        },
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
                query = query + 'WHERE PersonnelNbr = @value';
            }
        }

        query = query + ' ORDER BY [ClientData]';

        return request.query(query);
    }

    function getQuery() {
        return `SELECT LTRIM(RTRIM(ISNULL(ClientNm, 'no data'))) + ' : ' +
            CAST(AssignmentProfileIndicator AS varchar(20)) + ' (' + IIF(ISNULL(AssignmentStartDt, '')
            = '', '', CONVERT(varchar,AssignmentStartDt,106)) + '/' + IIF(ISNULL(AssignmentEndDt, '')
            = '', '', CONVERT(varchar,AssignmentEndDt,106)) + ') ' + HostCountry AS [ClientData]
            FROM AssignmentProfileFAM `;
    }
};
