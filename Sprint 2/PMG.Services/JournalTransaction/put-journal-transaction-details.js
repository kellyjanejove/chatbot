'use strict';

const sql = require('mssql');
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const lambda = new AWS.Lambda();

console.log('Loading...');

const params = {
    FunctionName: '6900-PMG-Dev-Get-Dbconfig-From-S3'
};

exports.handler = function (event, context, callback) {
    try {
        if (!event.body) {
            callback(null, {
                statusCode: 400,
                body: 'Bad request'
            });
        } else {
            var body = JSON.parse(event.body);

            lambda.invoke(params, function (err, data) {
                if (err) {
                    handleError(err);
                } else {
                    var connString = JSON.parse(data.Payload);

                    sql.connect(connString, function (err, result) {
                        if (err) {
                            handleError(err);
                        } else {
                            updateList(body);
                        }
                    });
                }
            });
        }
    } catch (err) {
        handleError(err);
    }

    function updateList(body) {
        updateItem(0, body);
    }

    function updateItem(index, body) {
        if (index >= body.length) {
            callback();
        }

        var request = new sql.Request();
        var updateParam = JSON.parse(body[index]);
        var query = getQuery();

        request.input('updateUserId', sql.VarChar, updateParam.UpdateUserId);
        request.input('mappingStatusInd', sql.VarChar, updateParam.MappingStatusInd);
        request.input('journalTransactionTypeDesc', sql.VarChar, updateParam.JournalTransactionTypeDesc);
        request.input('assigneePersonnelNbr', sql.VarChar, updateParam.AssigneePersonnelNbr);
        request.input('taxYearNbr', sql.VarChar, updateParam.TaxYearNbr);
        request.input('clientNm', sql.VarChar, updateParam.ClientNm);
        request.input('commentsTxt', sql.VarChar, updateParam.CommentsTxt);
        request.input('assignmentProfileIndicator', sql.VarChar, updateParam.assignmentProfileIndicator);
        request.input('journalTransactionDetailID', sql.VarChar, updateParam.JournalTransactionDetailID);

        query = query + `[MappingStatusInd] = @mappingStatusInd,
                        [JournalTransactionTypeDesc] = @journalTransactionTypeDesc,
                        [TaxYearNbr] = @taxYearNbr,
                        [ClientNm] = @clientNm,
                        [AssignmentProfileIndicator] = @assignmentprofileindicator,
                        [CommentsTxt] = @commentsTxt,
                        [UpdateUserId] = @updateUserId,
                        [UpdateDttm] = GETDATE()
                    WHERE [JournalTransactionDetailID] = @journalTransactionDetailID`;

        request.query(query, function (error, data) {
            if (error) {
                callback(error);
            } else {
                updateItem(index + 1, body);
            }
        });
    }

    function getQuery() {
        return `UPDATE JournalTransactionDetail 
                SET `;
    }

    function handleError(err) {
        console.log(err.message);
        callback(null, {
            statusCode: 500,
            body: err.message
        });
    }
};
