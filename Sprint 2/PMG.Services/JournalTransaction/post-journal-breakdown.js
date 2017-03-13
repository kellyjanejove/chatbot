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
                    .then(updateParent(body))
                    .catch(function (err) {
                        utils.handleError(err, callback);
                    });
            }).catch(function (err) {
                utils.handleError(err, callback);
            });
    };

    function updateParent(breakdownParam) {
        console.log('Creating Breakdown...');
        var transaction = new sql.Transaction();

        transaction.begin(function (err) {

            if (err) {
                sql.close();
                utils.handleError(err, callback);
            } else {
                var request = new transaction.Request();
                var query = getAuditQuery();
                var breakdownParentParam = JSON.parse(breakdownParam[0]);

                query = query + getParentQuery();
                request.input('JournalTransactionDetailId', sql.Int, breakdownParentParam.jDParentId);
                request.input('updateUserId', sql.VarChar, breakdownParentParam.UpdateUserId);

                for (let i in breakdownParam) {
                    query = query + getCreateQuery(i);
                    let breakdownChildParam = JSON.parse(breakdownParam[i]);

                    request.input('journalTransactionId' + i, sql.Int, breakdownChildParam.JournalTransactionId);
                    request.input('mappingStatusInd' + i, sql.VarChar, breakdownChildParam.MappingStatusInd);
                    request.input('assigneePersonnelNbr' + i, sql.VarChar, breakdownChildParam.AssigneePersonnelNbr);
                    request.input('taxYearNbr' + i, sql.VarChar, breakdownChildParam.TaxYearNbr);
                    request.input('journalTransactionTypeId' + i, sql.Int, breakdownChildParam.JournalTransactionTypeId);
                    request.input('journalTransactionTypeDesc' + i, sql.VarChar, breakdownChildParam.JournalTransactionTypeDesc);
                    request.input('clientCd' + i, sql.VarChar, breakdownChildParam.ClientCd);
                    request.input('clientNm' + i, sql.VarChar, breakdownChildParam.ClientNm);
                    request.input('localCurrencyAmt' + i, sql.Decimal(24, 4), breakdownChildParam.localCurrencyAmt);
                    request.input('commentsTxt' + i, sql.VarChar, breakdownChildParam.CommentsTxt);
                    request.input('updateUserId' + i, sql.VarChar, breakdownChildParam.UpdateUserId);
                    request.input('jDParentId' + i, sql.Int, breakdownChildParam.jDParentId);
                    request.input('isDeletedInd' + i, sql.VarChar, breakdownChildParam.isDeletedInd);
                    request.input('travelPlanIndicator' + i, sql.Int, breakdownChildParam.TravelPlanIndicator);
                    request.input('revaluationTransactionInd' + i, sql.VarChar, breakdownChildParam.RevaluationTransactionInd);
                }

                request.query(query, function (err) {
                    if (err) {
                        transaction.rollback();
                        console.log('Rolling back transaction....');
                        sql.close();
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

    function getCreateQuery(i) {
        return ` INSERT INTO    JournalTransactionDetail(JournalTransactionId
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
                                ,TravelPlanIndicator
                                ,RevaluationTransactionInd
                                ,OperatingGroupCd
                                ,OperatingGroupNm
                                ,SiblingIsParentInd) 
                SELECT TOP 1    @journalTransactionId` + i + `
                                ,'N'
                                ,@mappingStatusInd` + i + `
                                ,@assigneePersonnelNbr` + i + `
                                ,@taxYearNbr` + i + `
                                ,@journalTransactionTypeId` + i + `
                                ,@journalTransactionTypeDesc` + i + `
                                ,@clientCd` + i + `
                                ,@clientNm` + i + `
                                ,@localCurrencyAmt` + i + `
                                ,USDollarAmt
                                ,@commentsTxt` + i + `
                                ,@updateUserId` + i + `
                                ,CONVERT(varchar(11),SYSDATETIME(),106)
                                ,@updateUserId` + i + `
                                ,CONVERT(varchar(11),SYSDATETIME(),106)
                                ,@jDParentId` + i + `
                                ,@isDeletedInd` + i + `
                                ,@travelPlanIndicator` + i + `
                                ,@revaluationTransactionInd` + i + `
                                ,OperatingGroupCd
                                ,OperatingGroupNm
                                ,'N'
                FROM JournalTransactionDetail    
                WHERE JournalTransactionDetailId = @jDParentId` + i + `
                `;
    }

    function getParentQuery() {
        return ` UPDATE         JournalTransactionDetail
                 SET            SplitInd = 'Y',
                                UpdateUserId = @updateUserId,
                                UpdateDttm = CONVERT(varchar(11),SYSDATETIME(),106)
                                WHERE JournalTransactionDetailId = @JournalTransactionDetailId
                                
                UPDATE          s
                SET             s.SiblingIsParentInd = 'Y',
                                s.UpdateUserId = @updateUserId,
                                s.UpdateDttm = CONVERT(varchar(11),SYSDATETIME(),106)
                FROM            JournalTransactionDetail s
                JOIN            JournalTransactionDetail p1 ON p1.jDParentId = s.jDParentId
                WHERE           p1.JournalTransactionDetailId = @JournalTransactionDetailId  `;
    }

    function getAuditQuery() {

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
                        WHERE   JournalTransactionDetailId = @journalTransactionDetailID `;
    }
};
