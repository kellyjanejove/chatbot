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
                        populateAssignee(function (err) {
                            callback(err);
                        });
                    }
                });
            }
        });
    } catch (err) {
        callback(err);
    }

    function populateAssignee(callback) {
        console.log('Populating Assignee table...');
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
        return `UPDATE	Assignee
                SET		FirstNm	= LTRIM(RTRIM(TA.FirstNm)),
                        LastNm	= LTRIM(RTRIM(TA.LastNm)),
                        MiddleNm = LTRIM(RTRIM(TA.MiddleNm)),
                        LevelCd	= LTRIM(RTRIM(TA.CareerLevelCd)),
                        LevelDesc = CASE WHEN LEN(TA.CareerLevelDesc) = 0 THEN NULL ELSE LTRIM(RTRIM(TA.CareerLevelDesc)) END,
                        HomeCountryNm = LTRIM(RTRIM(CC.CountryNm)),
                        HomeGeographicUnitCd = LTRIM(RTRIM(CC.GeographicUnitCd)),
                        HomeGeographicUnitDesc = LTRIM(RTRIM(CC.GeographicUnitDesc)),
                        HomeCompanyCd = LTRIM(RTRIM(CC.CompanyCd)),
                        HomeCompanyDesc	= LTRIM(RTRIM(CC.CompanyDesc)),
                        UpdateUserId = USER_NAME(),
                        UpdateDttm = GetUTCDate()
                FROM	tblAssignee TA WITH (NOLOCK)
                        JOIN Assignee A ON  A.AssigneePersonnelNbr = TA.AssigneePersonnelNbr
                        JOIN CompanyToCountry CC ON TA.CompanyCd = CC.CompanyCd

                INSERT	INTO	Assignee
                                (
                                AssigneePersonnelNbr,
                                FirstNm,
                                LastNm,
                                MiddleNm,
                                LevelCd,
                                LevelDesc,
                                HomeCountryNm,
                                HomeGeographicUnitCd,
                                HomeGeographicUnitDesc,
                                HomeCompanyCd,
                                HomeCompanyDesc
                                )

                SELECT DISTINCT
                        LTRIM(RTRIM(TA.AssigneePersonnelNbr)),
                        LTRIM(RTRIM(TA.FirstNm)),
                        LTRIM(RTRIM(TA.LastNm)),
                        LTRIM(RTRIM(TA.MiddleNm)),
                        LTRIM(RTRIM(TA.CareerLevelCd)),
                        CASE WHEN LEN(TA.CareerLevelDesc) = 0 THEN NULL ELSE LTRIM(RTRIM(TA.CareerLevelDesc)) END,
                        LTRIM(RTRIM(CC.CountryNm)),
                        LTRIM(RTRIM(CC.GeographicUnitCd)),
                        LTRIM(RTRIM(CC.GeographicUnitDesc)),
                        LTRIM(RTRIM(TA.CompanyCd)),
                        LTRIM(RTRIM(CC.CompanyDesc))

                FROM	tblAssignee TA WITH (NOLOCK)
                        JOIN CompanyToCountry CC ON TA.CompanyCd = CC.CompanyCd
                        LEFT JOIN Assignee A ON TA.AssigneePersonnelNbr = A.AssigneePersonnelNbr
                WHERE	A.AssigneePersonnelNbr IS NULL`;
    }
};
