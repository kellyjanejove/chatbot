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

        return request.query(query);
    }

    function getQuery() {
        return `SELECT DISTINCT LTRIM(RTRIM(CC.CompanyCd)) + ' - ' + LTRIM(RTRIM(CC.CompanyDesc))
                AS [SendingCompanyCode]
                FROM  CompanyToCountry CC WITH(NOLOCK)
                ORDER BY LTRIM(RTRIM(CC.CompanyCd)) + ' - ' + LTRIM(RTRIM(CC.CompanyDesc))`;
    }

};
