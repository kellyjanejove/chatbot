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
                    .then(undoChild(body))
                    .catch(function (err) {
                        utils.handleError(err, callback);
                    });
            }).catch(function (err) {
                utils.handleError(err, callback);
            });
    };

    function undoChild(breakdownParam) {
        console.log('Reversing breakdown...');
        var transaction = new sql.Transaction();

        transaction.begin(function (err) {
            if (err) {
                sql.close();
                utils.handleError(err, callback);
            } else {

                var request = new transaction.Request();
                var query = getQuery();

                request.input('jDParentId', sql.Int, breakdownParam[0]);
                request.input('updateUserId', sql.VarChar, breakdownParam[1]);

                query = query + getAuditQuery();
                query = query + getUndoParentSplitQuery();
                query = query + getBreakdownChildrenQuery();

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

    function getQuery() {
        return ` DECLARE @temp table (JournalTransactionDetailId int);

                        INSERT INTO @temp
                        SELECT      jd.JournalTransactionDetailId
                        FROM        JournalTransactionDetail jd WITH(NOLOCK)
                        WHERE       jd.JdParentId = @jDParentId `;
    }

    function getAuditQuery() {
        return `        INSERT INTO JournalTransactionDetailVersion (
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
                            WHERE   JournalTransactionDetailId IN (SELECT JournalTransactionDetailId
                                                                   FROM @temp)
                                    OR JournalTransactionDetailId = @jDParentId `;
    }

    function getUndoParentSplitQuery() {
        return `            UPDATE  JournalTransactionDetail
                            SET     SplitInd = 'N',
                                    UpdateUserId = @updateUserId,
                                    UpdateDttm = CONVERT(varchar(11),SYSDATETIME(),106)
                            WHERE   JournalTransactionDetailId = @jDParentId 
                            
                            IF      (NOT EXISTS(SELECT TOP 1 1 
                                        FROM JournalTransactionDetail p 
                                        JOIN JournalTransactionDetail s ON s.jDParentId = p.jDParentId 
                                            AND ISNULL(s.IsDeletedInd,'N') <> 'Y'
                                        JOIN JournalTransactionDetail c ON c.jDParentId = s.JournalTransactionDetailId
                                            AND ISNULL(c.IsDeletedInd,'N') <> 'Y'
                                            AND c.jDParentId <> @jDParentId
                                        WHERE ISNULL(p.IsDeletedInd,'N') <> 'Y'
                                                AND p.JournalTransactionDetailId = @jDParentId)) 
                            BEGIN
            
                            UPDATE  s
                            SET     s.SiblingIsParentInd ='N',
                                    s.UpdateUserId = @updateUserId,
                                    s.UpdateDttm = CONVERT(varchar(11),SYSDATETIME(),106)
                            FROM    JournalTransactionDetail s
                            JOIN    JournalTransactionDetail p1 ON p1.jDParentId = s.jDParentId
                                        AND ISNULL(p1.IsDeletedInd,'N') <> 'Y'
                                        AND p1.JournalTransactionDetailId = @jDParentId
                            WHERE  ISNULL(s.IsDeletedInd,'N') <> 'Y' 
                            
                            END `;
    }

    function getBreakdownChildrenQuery() {
        return `            UPDATE  jd
                            SET     isDeletedInd = 'Y',
                                    UpdateUserId = @updateUserId,
                                    UpdateDttm = CONVERT(varchar(11),SYSDATETIME(),106)
                                    FROM JournalTransactionDetail jd
                                    JOIN @temp t ON t.JournalTransactionDetailId = jd.JournalTransactionDetailId `;
    }
};
