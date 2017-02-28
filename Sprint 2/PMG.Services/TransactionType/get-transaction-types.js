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

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        return request.query(query);
    }

    function getQuery() {
        return `SELECT LTRIM(RTRIM(DecodeTxt)) + ' - ' + LTRIM(RTRIM(CodeTxt))
                FROM CodeDetail WITH(NOLOCK)
                WHERE CategoryNbr = '7'
                ORDER BY DecodeTxt`;
    }

};
