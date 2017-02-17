'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function (event, context, callback) {
    utils.getDbConfig()
        .then(function (data) {
            var connString = JSON.parse(data.Body);

            connString.requestTimeout = 450000;
            sql.connect(connString)
                .then(populateCompanyToCountry)
                .catch(function (err) {
                    utils.handleError(err, callback);
                });
        }).catch(function (err) {
            utils.handleError(err, callback);
        });

    function populateCompanyToCountry() {
        console.log('Populating CompanyToCountry table...');
        var transaction = new sql.Transaction();

        transaction.begin(function (err) {
            var request = new transaction.request();
            var query = getQuery();

            request.query(query, function (err) {
                if (err) {
                    console.log('Rolling back transaction....');
                    transaction.rollback();
                } else {
                    transaction.commit();
                    console.log('Transaction committed.');
                }

                sql.close();

                callback(err);
            });
        });
    }

    function getQuery() {
        return `UPDATE	CompanyToCountry
                SET		CompanyDesc = src.CompanyDescr,
                        CountryKeyID = src.CountryKey,
                        CountryNm = sCo.CountryNm,
                        CurrencyCd = src.CurrencyKey
                FROM	CompanyToCountry ctc WITH (NOLOCK)
                        JOIN sCompany src WITH (NOLOCK) ON ctc.CompanyCd = src.CompanyCd
                        LEFT JOIN sCountry sCo WITH (NOLOCK) ON ctc.CountryKeyID = sCo.CountryKeyID
                -- END: Update company code information

                -- BEGIN: Insert new company codes
                INSERT	INTO CompanyToCountry
                        (
                        CompanyCd,
                        CompanyDesc,
                        CountryKeyID,
                        CountryNm,
                        CurrencyCd,
                        GeographicUnitCd,
                        GeographicUnitDesc
                        )
                SELECT	src.CompanyCd,
                        src.CompanyDescr,
                        src.CountryKey,
                        sCo.CountryNm,
                        src.CurrencyKey,
                        sCo.GeographicUnitCd,
                        sG.GeographicUnitDescr
                FROM	sCompany src WITH (NOLOCK)
                        LEFT JOIN CompanyToCountry ctc WITH (NOLOCK) ON ctc.CompanyCd = src.CompanyCd  
                        LEFT JOIN sCountry sCo WITH (NOLOCK) ON src.CountryKey = sCo.CountryKeyID
                        LEFT JOIN GeographicUnit sG WITH (NOLOCK) ON sCo.GeographicUnitCd = sG.GeographicUnitCd
                WHERE	ctc.CompanyCd IS NULL`;
    }
};
