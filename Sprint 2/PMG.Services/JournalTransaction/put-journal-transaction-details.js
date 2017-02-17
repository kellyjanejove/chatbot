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
                        updateList(body);
                    }
                });
            });
    };

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

};
