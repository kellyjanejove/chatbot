'use strict';

var sql = require('mssql');
var lambdaUtils = require('../../Utils/lambda-utils');
var data = require('./data/accounts.json');

const addAccountQuery = `MERGE CodeDetail WITH (HOLDLOCK) AS d
                        USING (VALUES (@@CategoryNbr, @@CodeTxt,@@DecodeTxt,@@CodeDetailStatusInd)) AS s (CategoryNbr, CodeTxt,DecodeTxt,CodeDetailStatusInd) 
                            ON s.CategoryNbr = d.CategoryNbr 
                            AND s.CodeTxt = d.CodeTxt
                            AND s.DecodeTxt= d.DecodeTxt
                            AND s.CodeDetailStatusInd = d.CodeDetailStatusInd
                        WHEN NOT MATCHED BY TARGET THEN 
                            INSERT (CategoryNbr, CodeTxt,DecodeTxt,CodeDetailStatusInd) 
                            VALUES (s.CategoryNbr, s.CodeTxt,s.DecodeTxt,s.CodeDetailStatusInd);`;

const seed = function () {
    return new Promise(function (resolve) {
        lambdaUtils.getDbConfig()
            .then(function (data) {
                var connString = JSON.parse(data.Body);
                //console.log(connString);

                sql.connect(connString)
                    .then(addAccounts)
                    .then(getAccounts)
                    .then(function (accounts) { 
                        sql.close();
                        resolve(accounts);
                    });
            });
    });
};

const addAccounts = function () {
    let request = new sql.Request();
    request.multiple = true;

    let query = '';
    data.forEach(function (record, index) {

        let CategoryNbr = 'CategoryNbr' + index;
        let CodeTxt = 'CodeTxt' + index;
        let DecodeTxt = 'DecodeTxt' + index;
        let CodeDetailStatusInd = 'CodeDetailStatusInd' + index;


        request.input(CategoryNbr, sql.VarChar, record.CategoryNbr);
        request.input(CodeTxt, sql.VarChar, record.CodeTxt);
        request.input(DecodeTxt, sql.VarChar, record.DecodeTxt);
        request.input(CodeDetailStatusInd, sql.VarChar, record.CodeDetailStatusInd);

        query = query + addAccountQuery.replace('@CategoryNbr', CategoryNbr).replace('@CodeTxt', CodeTxt).replace('@DecodeTxt', DecodeTxt).replace('@CodeDetailStatusInd', CodeDetailStatusInd);
    });

    //console.log(query);
    return request.query(query);
};

const getAccounts = function () {
    let request = new sql.Request();
    const query = `Select CAST(CAST(CodeTxt AS INT) AS VARCHAR)  As CodeTxt, DecodeTxt
               
                FROM CodeDetail 
                WHERE CategoryNbr = '16'
                ORDER BY CodeTxt`;

    //console.log(query);
    return request.query(query);
};

const accountInitializer = {
    seed: seed
};

module.exports = accountInitializer;
