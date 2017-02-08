'use strict';

var sql = require('mssql');
var lambdaUtils = require('../../Utils/lambda-utils');
var data = require('./data/assignee-names.json');

const addassigneeNameQuery = `MERGE Assignee WITH (HOLDLOCK) AS d
                        USING (VALUES (@@AssigneePersonnelNbr, @@FirstNm,@@LastNm,@@MiddleNm)) AS s (AssigneePersonnelNbr, FirstNm,LastNm,MiddleNm) 
                            ON s.AssigneePersonnelNbr = d.AssigneePersonnelNbr 
                            AND s.FirstNm = d.FirstNm
                            AND s.LastNm= d.LastNm
                            AND s.MiddleNm = d.MiddleNm
                        WHEN NOT MATCHED BY TARGET THEN 
                            INSERT (AssigneePersonnelNbr, FirstNm,LastNm,MiddleNm) 
                            VALUES (s.AssigneePersonnelNbr, s.FirstNm,s.LastNm,s.MiddleNm);`;

const seed = function () {
    return new Promise(function (resolve) {
        lambdaUtils.getDbConfig()
            .then(function (data) {
                var connString = JSON.parse(data.Body);
                //console.log(connString);

                sql.connect(connString)
                    .then(addassigneeNames)
                    .then(getassigneeNames)
                    .then(function (assigneeNames) { 
                        sql.close();
                        resolve(assigneeNames);
                    });
            });
    });
};

const addassigneeNames = function () {
    let request = new sql.Request();
    request.multiple = true;

    let query = '';
    data.forEach(function (record, index) {

        let AssigneePersonnelNbr = 'AssigneePersonnelNbr' + index;
        let FirstNm = 'FirstNm' + index;
        let LastNm = 'LastNm' + index;
        let MiddleNm = 'MiddleNm' + index;


        request.input(AssigneePersonnelNbr, sql.VarChar, record.AssigneePersonnelNbr);
        request.input(FirstNm, sql.VarChar, record.FirstNm);
        request.input(LastNm, sql.VarChar, record.LastNm);
        request.input(MiddleNm, sql.VarChar, record.MiddleNm);

        query = query + addassigneeNameQuery.replace('@AssigneePersonnelNbr', AssigneePersonnelNbr).replace('@FirstNm', FirstNm).replace('@LastNm', LastNm).replace('@MiddleNm', MiddleNm);
    });

    //console.log(query);
    return request.query(query);
};

const getassigneeNames = function () {
    let request = new sql.Request();
    const query = `SELECT * FROM Assignee `;

    //console.log(query);
    return request.query(query);
};

const assigneeNameInitializer = {
    seed: seed
};

module.exports = assigneeNameInitializer;
