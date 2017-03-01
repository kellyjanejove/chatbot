'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function (event, context, callback) {

    console.log('Loading...');

    if (!event.body) {
        callback(null, {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*' // Required for CORS support to work
            },
            body: 'Bad request'
        });
    } else {
        var body = JSON.parse(event.body);

        utils.getDbConfig()
            .then(function (data) {
                var connString = JSON.parse(data.Body);

                sql.connect(connString, function (err, result) {
                    if (err) {
                        utils.handleError(err);
                    } else {
                        undoChild(body);
                    }
                });
            });
    };

    function undoChild(breakdownParam) {
        var request = new sql.Request();

        //request.input('journalTransactionDetailID', sql.VarChar, updateParam.JournalTransactionDetailID);
        request.input('jDParentId', sql.Int, breakdownParam[0]);
        request.input('updateUserId', sql.VarChar, breakdownParam[1]);

        var query = `   DECLARE @temp table (JournalTransactionDetailId int);

                        INSERT INTO @temp
                        SELECT jd.JournalTransactionDetailId
                        FROM JournalTransactionDetail jd WITH(NOLOCK)
                        WHERE jd.JdParentId = @jDParentId

                        BEGIN TRY
                            BEGIN TRAN
                                UPDATE jd
                                SET isDeletedInd = 'Y',
                                UpdateUserId = @updateUserId,
                                UpdateDttm = SYSDATETIME()
                                FROM JournalTransactionDetail jd
                                JOIN @temp t ON t.JournalTransactionDetailId = jd.JournalTransactionDetailId

                                UPDATE JournalTransactionDetail
                                SET SplitInd = 'N',
                                UpdateUserId = @updateUserId,
                                UpdateDttm = SYSDATETIME()
                                WHERE JournalTransactionDetailId = @jDParentId

                                INSERT INTO JournalTransactionDetailVersion (
                                        JournalTransactionDetailId
                                        ,JournalTransactionId
                                        ,SplitInd
                                        ,MappingStatusInd
                                        ,AssigneePersonnelNbr
                                        ,TaxYearNbr
                                        ,JournalTransactionTypeId
                                        ,JournalTransactionTypeDesc
                                        ,ClientCd
                                        ,ClientNm
                                        ,LocalCurrencyAmt
                                        ,USDollarAmt
                                        ,CommentsTxt
                                        ,JDParentId
                                        ,IsDeletedInd
                                        ,TravelPlanIndicator
                                        ,CreateUserId
                                        ,CreateDttm
                                        ,UpdateUserId
                                        ,UpdateDttm
                                )
                                SELECT  JournalTransactionDetailId
                                        ,JournalTransactionId
                                        ,SplitInd
                                        ,MappingStatusInd
                                        ,AssigneePersonnelNbr
                                        ,TaxYearNbr
                                        ,JournalTransactionTypeId
                                        ,JournalTransactionTypeDesc
                                        ,ClientCd
                                        ,ClientNm
                                        ,LocalCurrencyAmt
                                        ,USDollarAmt
                                        ,CommentsTxt
                                        ,JDParentId
                                        ,IsDeletedInd
                                        ,TravelPlanIndicator
                                        ,CreateUserId
                                        ,CreateDttm
                                        ,UpdateUserId
                                        ,UpdateDttm 
                                FROM JournalTransactionDetail 
                                WHERE JournalTransactionDetailId IN (SELECT JournalTransactionDetailId
                                                                        FROM @temp)
                                    OR JournalTransactionDetailId = @jDParentId

                            COMMIT TRAN
                        END TRY
                        BEGIN CATCH
                            ROLLBACK TRAN
                        END CATCH `;
        request.query(query, function (error, data) {
            if (error) {
                sql.close();
                utils.handleError(error, callback);
            } else {
                undoParentSplit(breakdownParam);
            }
        });
    }

    function undoParentSplit(breakdownParam) {
        var request = new sql.Request();
        request.input('jDParentId', sql.Int, breakdownParam.jDParentId);

        var query = `   BEGIN TRY
                            BEGIN TRAN
                                UPDATE JournalTransactionDetail
                                SET SplitInd = 'N'
                                WHERE JournalTransactionDetailId = @jDParentId
                            COMMIT TRAN
                        END TRY
                        BEGIN CATCH
                            ROLLBACK TRAN
                        END CATCH `;

        request.query(query, function (error, data) {
            sql.close();
            if (error) {
                utils.handleError(error, callback);
            } else {

                callback(null, {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*' // Required for CORS support to work
                    },
                    body: 'OK'
                });
            }
        });
    }

};
