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
                        populateJournalDetalExtension(function (err) {
                            callback(err);
                        });
                    }
                });
            }
        });
    } catch (err) {
        callback(err);
    }

    function populateJournalDetalExtension(callback) {
        console.log('Populating Journal detail extension table...');
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
        return `CREATE TABLE #tblJournalDetail_Ext(
                    [ID] [int] NOT NULL,
                    [AssigneePersonnelNbr] [varchar](9) collate SQL_Latin1_General_CP850_CI_AI NULL,
                    [TaxYearNbr] [char](4) collate SQL_Latin1_General_CP850_CI_AI NULL,
                    [AssignmentProfileIndicator] [int] NULL,
                    [JournalTransactionTypeId] [int] NULL
                ) ON [PRIMARY]

                INSERT INTO #tblJournalDetail_Ext(
                    [ID]
                    , [AssigneePersonnelNbr]
                    , [TaxYearNbr]
                    , [JournalTransactionTypeId]
                    , [AssignmentProfileIndicator]
                    )

                SELECT 
                    ID
                    , CASE WHEN CHARINDEX('~',LineItemDesc,CHARINDEX('~P',LineItemDesc)+2) - (CHARINDEX('~P',LineItemDesc)+2) < 1 THEN NULL
                        ELSE 
                            SUBSTRING(LineItemDesc,
                                CHARINDEX('~P',LineItemDesc)+2, --Start
                                    (CHARINDEX('~',LineItemDesc,CHARINDEX('~P',LineItemDesc)+2) - (CHARINDEX('~P',LineItemDesc)+2))  --Length
                                ) 
                        END AS [AssigneePersonnelNbr]
                    , CASE WHEN CHARINDEX('~',LineItemDesc,CHARINDEX('~Y',LineItemDesc)+2) - (CHARINDEX('~Y',LineItemDesc)+2) < 1 THEN NULL
                        ELSE 
                            SUBSTRING(LineItemDesc,CHARINDEX('~Y',LineItemDesc)+2,4) 
                            --SUBSTRING(LineItemDesc,
                            --	CHARINDEX('~Y',LineItemDesc)+2, --Start
                            --		(CHARINDEX('~',LineItemDesc,CHARINDEX('~Y',LineItemDesc)+2) - (CHARINDEX('~Y',LineItemDesc)+2))  --Length
                            --	) 
                        END AS [TaxYearNbr]

                    , CASE WHEN CHARINDEX('~',LineItemDesc,CHARINDEX('~T',LineItemDesc)+2) - (CHARINDEX('~T',LineItemDesc)+2) < 1 THEN NULL
                        ELSE 
                            SUBSTRING(LineItemDesc,
                                CHARINDEX('~T',LineItemDesc)+2, --Start
                                    (CHARINDEX('~',LineItemDesc,CHARINDEX('~T',LineItemDesc)+2) - (CHARINDEX('~T',LineItemDesc)+2))  --Length
                                ) 
                        END AS [JournalTransactionTypeId]
                    , CASE WHEN CHARINDEX('~',LineItemDesc,CHARINDEX('~A',LineItemDesc)+2) - (CHARINDEX('~A',LineItemDesc)+2) < 1 THEN NULL
                        ELSE 
                            SUBSTRING(LineItemDesc,
                                CHARINDEX('~A',LineItemDesc)+2, --Start
                                    (CHARINDEX('~',LineItemDesc,CHARINDEX('~A',LineItemDesc)+2) - (CHARINDEX('~A',LineItemDesc)+2))  --Length
                                ) 
                        END AS [AssignmentProfileIndicator]			
                FROM dbo.tblJournalDetail WITH(NOLOCK)
                WHERE LineItemDesc LIKE '<~%~>%' 

                TRUNCATE TABLE dbo.tblJournalDetail_Ext

                INSERT INTO dbo.tblJournalDetail_Ext(
                    [ID]
                    , [AssigneePersonnelNbr]
                    , [TaxYearNbr]
                    , [JournalTransactionTypeId]
                    , [AssignmentProfileIndicator]
                    )
                SELECT
                    tmp.[ID]
                    , a.[AssigneePersonnelNbr]
                    , cd.DecodeTxt as [TaxYearNbr]
                    , cd2.codeTxt as [JournalTransactionTypeId]
                    , ap.[AssignmentProfileIndicator]
                FROM #tblJournalDetail_Ext tmp
                    LEFT JOIN dbo.Assignee a WITH(NOLOCK)
                        ON tmp.[AssigneePersonnelNbr] = a.[AssigneePersonnelNbr]
                    LEFT JOIN dbo.CodeDetail cd WITH(NOLOCK)
                        ON tmp.[TaxYearNbr] = cd.DecodeTxt
                        AND cd.CategoryNbr = 15
                    LEFT JOIN dbo.CodeDetail cd2 WITH(NOLOCK)
                        ON tmp.[JournalTransactionTypeId] = cd2.codeTxt
                        AND cd2.CategoryNbr = 7
                    LEFT JOIN dbo.AssignmentProfileFAM ap WITH(NOLOCK)
                        ON tmp.[AssignmentProfileIndicator] = ap.AssignmentProfileIndicator

                DROP TABLE #tblJournalDetail_Ext`;
    }
};
