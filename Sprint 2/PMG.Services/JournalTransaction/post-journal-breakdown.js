'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function (event, context, callback) {

    console.log('Loading...');

    if (!event.body) {
        callback(null, {
            statusCode: 400,
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
                        createChildren(body);
                    }
                });
            });
    };

    function createChildren(records) {
        createChild(0, records);
    }

    function createChild(index, records) {
        if (index === records.length) {
            //res.json();
            updateParent(records[0]);
        } else {
            let breakdownParam = JSON.parse(records[index]);
            getCreateQuery(breakdownParam);
            createChild(index + 1, records);
        }
    }

    function getCreateQuery(breakdownParam) {
        var request = new sql.Request();
        var query = `
            BEGIN TRY
                BEGIN TRAN`;

        request.input('journalTransactionId', sql.Int, breakdownParam.JournalTransactionId);
        request.input('mappingStatusInd', sql.VarChar, breakdownParam.MappingStatusInd);
        request.input('assigneePersonnelNbr', sql.VarChar, breakdownParam.AssigneePersonnelNbr);
        request.input('taxYearNbr', sql.VarChar, breakdownParam.TaxYearNbr);
        request.input('journalTransactionTypeId', sql.Int, breakdownParam.JournalTransactionTypeId);
        request.input('journalTransactionTypeDesc', sql.VarChar, breakdownParam.JournalTransactionTypeDesc);
        request.input('clientCd', sql.VarChar, breakdownParam.ClientCd);
        request.input('clientNm', sql.VarChar, breakdownParam.ClientNm);
        request.input('localCurrencyAmt', sql.Decimal(24, 4), breakdownParam.localCurrencyAmt);
        request.input('usDollarAmt', sql.Decimal(24, 4), breakdownParam.USDollarAmt);
        request.input('commentsTxt', sql.VarChar, breakdownParam.CommentsTxt);
        request.input('updateUserId', sql.VarChar, breakdownParam.UpdateUserId);
        request.input('jDParentId', sql.Int, breakdownParam.jDParentId);
        request.input('isDeletedInd', sql.VarChar, breakdownParam.isDeletedInd);
        request.input('TravelPlanIndicator', sql.Int, breakdownParam.TravelPlanIndicator);

        query = query + `
                    INSERT INTO JournalTransactionDetail(JournalTransactionId
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
                                                        ,CreateUserId
                                                        ,CreateDttm
                                                        ,UpdateUserId
                                                        ,UpdateDttm
                                                        ,JDParentId
                                                        ,IsDeletedInd
                                                        ,TravelPlanIndicator)`;
        query = query + `
                    VALUES(@journalTransactionId
                        ,'N'
                        ,@mappingStatusInd
                        ,@assigneePersonnelNbr
                        ,@taxYearNbr
                        ,@journalTransactionTypeId
                        ,@journalTransactionTypeDesc
                        ,@clientCd
                        ,@clientNm
                        ,@localCurrencyAmt
                        ,@usDollarAmt
                        ,@commentsTxt
                        ,@updateUserId
                        ,SYSDATETIME()
                        ,@updateUserId
                        ,SYSDATETIME()
                        ,@jDParentId
                        ,@isDeletedInd
                        ,@TravelPlanIndicator)`;
        query = query + `
                COMMIT TRAN
            END TRY
            BEGIN CATCH
                ROLLBACK TRAN
            END CATCH`;

        request.query(query, function (error, data) {
            if (error) {
                console.log(error);
            }
        });
    }

    function updateParent(records) {
        let breakdownParam = JSON.parse(records);

        getParentQuery(breakdownParam);

        //res.json();
    }

    function getParentQuery(breakdownParam) {
        var request = new sql.Request();
        var query = `
            BEGIN TRY
                BEGIN TRAN`;

        request.input('JournalTransactionDetailId', sql.Int, breakdownParam.jDParentId);
        request.input('updateUserId', sql.VarChar, breakdownParam.UpdateUserId);

        query = query + `
                    UPDATE JournalTransactionDetail
                    SET SplitInd = 'Y',
                    UpdateUserId = @updateUserId,
                    UpdateDttm = SYSDATETIME()
                    WHERE JournalTransactionDetailId = @JournalTransactionDetailId
                COMMIT TRAN
            END TRY
            BEGIN CATCH
                ROLLBACK TRAN
            END CATCH`;

        request.query(query, function (error, data) {
            if (error) {
                utils.handleError(error);
            } else {
                //auditChildren(breakdownParam.jDParentId);  
            }
        });
    }

    function auditChildren(jDParentId) {
        var request = new sql.Request();
        request.input('jDParentId', sql.Int, jDParentId);

        var query = `BEGIN TRY
                        BEGIN TRAN
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
                        WHERE ISNULL(IsDeletedInd,'N') <> 'Y'
                                AND (JDParentId = @jDParentId
                                        OR JournalTransactionDetailId = @jDParentId)
                    COMMIT TRAN
                END TRY
                    
                BEGIN CATCH
                    ROLLBACK TRAN    
                END CATCH`;

        request.query(query, function (error, data) {
            if (error) {
                console.log(error);
            } else {
                //res.json();
            }
        });
    }
};

