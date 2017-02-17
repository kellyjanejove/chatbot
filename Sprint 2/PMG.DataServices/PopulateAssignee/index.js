'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function (event, context, callback) {
    utils.getDbConfig()
        .then(function (data) {
            var connString = JSON.parse(data.Body);

            connString.requestTimeout = 450000;
            sql.connect(connString)
                .then(populateAssignee)
                .catch(function (err) {
                    utils.handleError(err, callback);
                });
        }).catch(function (err) {
            utils.handleError(err, callback);
        });

    function populateAssignee() {
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
