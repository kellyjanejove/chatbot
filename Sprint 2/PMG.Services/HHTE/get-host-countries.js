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
                query = query + 'WHERE HHTE.HostCountry IS NOT NULL AND HHTE.HostCountry LIKE @value + \'%\'';

                if (typeof params.enterpriseId === 'string' && params.enterpriseId !== '') {
                    request.input('enterpriseId', sql.VarChar, params.enterpriseId);
                    query = query + ' AND UC.UserEnterpriseId = @enterpriseId ';
                }
            } else if (typeof params.enterpriseId === 'string' && params.enterpriseId !== '') {
                request.input('enterpriseId', sql.VarChar, params.enterpriseId);
                query = query + 'WHERE UC.UserEnterpriseId = @enterpriseId ';
            }
        }

        query = query + ' ORDER BY HHTE.HostCountry';

        return request.query(query);
    }

    function getQuery() {
        return `SELECT DISTINCT HHTE.HostCountry 
                FROM UserToCompany UC WITH(NOLOCK)
                JOIN CompanyToCountry CC WITH(NOLOCK) ON CC.CompanyCd = UC.CompanyCd
                JOIN HomeHostTaxEqualization HHTE ON HHTE.CompanyNm = CC.CompanyDesc `;
    }
};
