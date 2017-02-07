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
            if (typeof params.enterpriseId === 'string' && params.enterpriseId !== '') {
                request.input('enterpriseId', sql.VarChar, params.enterpriseId);
                query = query + 'WHERE UC.UserEnterpriseId = @UserEnterpriseId';
            }
        }

        return request.query(query);
    }

    function getQuery() {
        return `SELECT DISTINCT LTRIM(RTRIM(CC.CompanyCd)) + ' - ' + LTRIM(RTRIM(CC.CompanyDesc)) AS [CompanyCode]
                FROM UserToCompany UC WITH(NOLOCK)
                JOIN CompanyToCountry CC WITH(NOLOCK)
                ON UC.CompanyCd = CC.CompanyCd `;
    }

};
