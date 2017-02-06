'use strict';

var sql = require('mssql');
var lambdaUtils = require('../../lib/lambda-utils');
var data = require('./data/accounts.json');

const addAuthorQuery = `MERGE Author WITH (HOLDLOCK) AS d
                        USING (VALUES (@@Number, @@Name)) AS s (Number, Name) 
                            ON s.Number = d.Number 
                            AND s.Name = d.Name
                        WHEN NOT MATCHED BY TARGET THEN 
                            INSERT (Number, Name) 
                            VALUES (s.Number, s.Name);`;

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

        let Number = 'Number' + index;
        let Name = 'Name' + index;

        request.input(Number, sql.VarChar, record.Number);
        request.input(Name, sql.VarChar, record.Name);

        query = query + addAuthorQuery.replace('@Number', Number).replace('@Name', Name);
    });

    //console.log(query);
    return request.query(query);
};

const getAccounts = function () {
    let request = new sql.Request();
    const query = 'SELECT a.accountID,a.Number, a.name FROM Accounts a';

    //console.log(query);
    return request.query(query);
};

const accountInitializer = {
    seed: seed
};

module.exports = accountInitializer;
