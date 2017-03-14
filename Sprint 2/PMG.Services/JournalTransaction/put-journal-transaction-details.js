'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function (event, context, callback) {

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

                sql.connect(connString)
                    .then(checkItem(body))
                    .catch(function (err) {
                        utils.handleError(err, callback);
                    });
            }).catch(function (err) {
                utils.handleError(err, callback);
            });
    }

    function checkItem(records) {
        var transaction = new sql.Transaction();
        transaction.begin(function (err) {
            if (err) {
                sql.close();
                utils.handleError(err, callback);
            } else {

                var request = new transaction.Request();
                console.log('Updating Journal Transaction Detail...');

                var query = '';
                for (let i in records) {
                    var updateDataMappingParam = JSON.parse(records[i]);

                    query = updateItem(i, query);

                    request.input('updateUserId' + i, sql.VarChar, updateDataMappingParam.UpdateUserId);
                    request.input('mappingStatusInd' + i, sql.VarChar, updateDataMappingParam.MappingStatusInd);
                    request.input('journalTransactionTypeDesc' + i, sql.VarChar, updateDataMappingParam.JournalTransactionTypeDesc);
                    request.input('assigneePersonnelNbr' + i, sql.VarChar, updateDataMappingParam.AssigneePersonnelNbr);
                    request.input('taxYearNbr' + i, sql.VarChar, updateDataMappingParam.TaxYearNbr);
                    request.input('clientNm' + i, sql.VarChar, updateDataMappingParam.ClientNm);
                    request.input('commentsTxt' + i, sql.VarChar, updateDataMappingParam.CommentsTxt);
                    request.input('travelPlanIndicator' + i, sql.VarChar, updateDataMappingParam.TravelPlanIndicator);
                    request.input('journalTransactionDetailID' + i, sql.VarChar, updateDataMappingParam.JournalTransactionDetailID);
                    request.input('clientCd' + i, sql.VarChar, updateDataMappingParam.ClientCd);
                    request.input('journalTransactionTypeId' + i, sql.Int, updateDataMappingParam.JournalTransactionTypeId);
                }

                request.query(query, function (err) {
                    if (err) {
                        transaction.rollback();
                        console.log('Rolling back transaction....');
                        utils.handleError(err);
                    } else {
                        transaction.commit();
                        console.log('Transaction committed.');
                        sql.close();

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
        });
    }

    function updateItem(i, query) {

        query = query + getAuditQuery(i);
        query = query + getSaveJournalTransactionDetailQuery(i);

        return query;
    }

    function getAuditQuery(i) {
        return ` INSERT INTO JournalTransactionDetailVersion (
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
                        FROM    JournalTransactionDetail 
                        WHERE   JournalTransactionDetailId = @journalTransactionDetailID` + i;
    }

    function getSaveJournalTransactionDetailQuery(i) {
        return `        UPDATE JournalTransactionDetail 
                        SET    [MappingStatusInd] = @mappingStatusInd` + i + `,
                               [JournalTransactionTypeDesc] = @journalTransactionTypeDesc` + i + `,
                               [TaxYearNbr] = @taxYearNbr` + i + `,
                               [ClientNm] = @clientNm` + i + `,
                               [TravelPlanIndicator] = @TravelPlanIndicator` + i + `,
                               [CommentsTxt] = @commentsTxt` + i + `,
                               [UpdateUserId] = @updateUserId` + i + `,
                               [UpdateDttm] = CONVERT(varchar(11),GETDATE(),106),
                               [ClientCd] = @clientCd` + i + `,
                               [JournalTransactionTypeID] = @journalTransactionTypeId` + i + `
                        WHERE  [JournalTransactionDetailID] = @journalTransactionDetailID` + i;
    }
};
