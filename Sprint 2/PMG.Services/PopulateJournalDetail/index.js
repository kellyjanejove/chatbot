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
                        populateJournalDetail(function (err) {
                            callback(err);
                        });
                    }
                });
            }
        });
    } catch (err) {
        callback(err);
    }

    function populateJournalDetail(callback) {
        console.log('Populating Journal detail table...');
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
        return `INSERT	INTO	JournalTransactionDetail
                (
                    JournalTransactionId,
                    SplitInd,
                    MappingStatusInd,
                    RevaluationTransactionInd,
                    AssigneePersonnelNbr,
                    TaxYearNbr,
                    JournalTransactionTypeId,
                    JournalTransactionTypeDesc,
                    LocalCurrencyAmt,
                    USDollarAmt,
                    AssignmentProfileIndicator,
                    ClientNm
                )

           SELECT	J.JournalTransactionId,
            SplitInd = 'N',
            CASE
                WHEN	tJH.DocumentTypeCd = 'ZH' THEN '1' -- Revaluation Entries
                WHEN    ext.TaxCd = 1006 OR ext.TaxCd < 0 THEN '1'
                WHEN	ext.AssigneePersonnelNbr IS NOT NULL AND 
                        ext.TaxYearNbr IS NOT NULL AND
                        ext.TaxCd IS NOT NULL	THEN '1'	 
                ELSE '0'	
            END, --MappingStatusInd
            CASE WHEN tJD.LocalCurrencyAmt = 0 AND tJH.DocumentTypeCd = 'ZH' THEN 'Y' ELSE 'N' END, --RevaluationTransactionInd
            ext.AssigneePersonnelNbr, --AssigneePersonnelNbr
            ext.TaxYearNbr, --TaxYearNbr
            CASE WHEN tJH.DocumentTypeCd = 'ZH' THEN 1006 ELSE ext.TaxCd END, -- JournalTransactionTypeDesc
            CASE WHEN tJH.DocumentTypeCd = 'ZH' THEN 'Account Reallocations' ELSE
                    (
                        SELECT	DecodeTxt 
                        FROM	CodeDetail 
                        WHERE	CodeTxt = ext.TaxCd AND CategoryNbr = '7'
                    ) 
            END, --JournalTransactionTypeDesc
            CONVERT(DECIMAL(24,4),tJD.LocalCurrencyAmt) * CASE WHEN DebitCreditInd= 'H' THEN -1 ELSE 1 END,--LocalCurrencyAmt
            CONVERT(DECIMAL(24,4),tJD.USDollarAmt) * CASE WHEN DebitCreditInd = 'H' THEN -1 ELSE 1 END, --USD Amount
            ext.AssigneePersonnelNbr, --AssignmentProfileIndicator
			apf.ClientNm
            FROM	tblJournalHeader tJH
                    JOIN tblJournalDetail tJD ON tJH.CompanyCd = tJD.CompanyCd AND
                                                tJH.DocumentNbr = tJD.DocumentNbr AND
                                                tJH.SAPFiscalYearNm = tJD.SAPFiscalYearNm
					JOIN tblJournalDetail_Ext ext on tJD.ID= ext.ID
					JOIN AssignmentProfileFAM apf on ext.AssignmentProfileIndicator = apf.AssignmentProfileIndicator
                    JOIN JournalTransaction J ON tJH.CompanyCd = J.CompanyCd AND
                                                tJH.DocumentNbr = J.DocumentNbr AND
                                                tJH.SAPFiscalYearNm = J.SAPFiscalYearNm AND
                                                tJD.LineItemNbr = J.LineItemNbr
                    LEFT JOIN JournalTransactionDetail JD ON J.JournalTransactionId = JD.JournalTransactionId
            WHERE	JD.JournalTransactionId IS NULL`;
    }
};
