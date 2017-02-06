'use strict';

const sql = require('mssql');
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const lambda = new AWS.Lambda();

const params = {
    FunctionName: '6900-PMG-Dev-Get-Dbconfig-From-S3'
};

console.log('Loading...');

exports.handler = function (event, context, callback) {
    try {
        lambda.invoke(params, function (err, data) {
            if (err) {
                callback(err);
            } else {
                var connString = JSON.parse(data.Payload);
                connString.requestTimeout = 450000;

                sql.connect(connString, function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        populateCompanyToCountry(function (err) {
                            callback(err);
                        });
                    }
                });
            }
        });
    } catch (err) {
        callback(err);
    }

    function populateCompanyToCountry(callback) {
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
