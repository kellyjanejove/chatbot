`use strict`;

const sql = require(`mssql`);
const utils = require('../utils/lambda-utils');

var search = require('./search.js');
exports.handler = function(event, context, callback) {

    console.log('Loading...');

    utils.getDbConfig()
        .then(function(data) {
            var connString = JSON.parse(data.Body);

            sql.connect(connString)
                .then(getList)
                .then(function(data) {
                    sql.close();
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(data)
                    });
                }).catch(function(err) {
                    utils.handleError(err, callback);
                });
        }).catch(function(err) {
            utils.handleError(err, callback);
        });

    function getList(callback) {
        var request = new sql.Request();
        var query = search.select;

        var queryParams = event.queryStringParameters;
        var params = null;

        if (queryParams && Object.keys(queryParams).length) {
            if (typeof queryParams.searchParam !== `undefined`) {
                params = JSON.parse(queryParams.searchParam);

                if (typeof params['Company Code'] !== 'undefined') {
                    let operator = params['Company Code'].Operator;
                    let values = params['Company Code'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.CompanyCd ' + operator + ' @companycode ';
                            request.input('companycode', sql.Int, values);
                            break;
                        case 'IN':
                            query = query + ' AND jt.CompanyCd ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            query = query + ' AND (jt.CompanyCd ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.VarChar, values[0]);
                            request.input('valueTwo', sql.VarChar, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Company Name'] !== 'undefined') {
                    let operator = params['Company Name'].Operator;
                    let values = params['Company Name'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND cc.IsAvanadeInd ' + operator + ' @companyname ';
                            request.input('companyname', sql.VarChar, values);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Country Name'] !== 'undefined') {
                    let operator = params['Country Name'].Operator;
                    let values = params['Country Name'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.CountryNm ' + params['Country Name'].Operator + ' @countryname ';
                            request.input('countryname', sql.VarChar, values);
                            break;
                        case 'IN':
                            query = query + ' AND jt.CountryNm ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Personnel Number'] !== 'undefined') {
                    let operator = params['Personnel Number'].Operator;
                    let values = params['Personnel Number'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                            query = query + ' AND jd.AssigneePersonnelNbr ' + operator + ' @personnelnumber ';
                            request.input('personnelnumber', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jd.AssigneePersonnelNbr ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Assignee Name'] !== 'undefined') {
                    let operator = params['Assignee Name'].Operator;
                    let values = params['Assignee Name'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                            query = query + ' AND jd.AssigneePersonnelNbr ' + operator + ' @assigneename OR ag.LastNm ' + operator + ' @assigneename ';
                            request.input('assigneename', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jd.AssigneePersonnelNbr ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Account Number'] !== 'undefined') {
                    let operator = params['Account Number'].Operator;
                    let values = params['Account Number'].Values;

                    switch (operator) {
                        case '=':
                        case '>=':
                        case '<=':
                            query = query + ' AND jt.AccountId ' + operator + ' @accountnumber ';
                            request.input('accountnumber', sql.Int, values);
                            break;
                        case 'LIKE':
                            query = query + ' AND jt.AccountId ' + operator + ' @accountnumber ';
                            request.input('accountnumber', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.AccountId ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            query = query + ' AND (jt.AccountId ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.Int, values[0]);
                            request.input('valueTwo', sql.Int, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Account Name'] !== 'undefined') {
                    let operator = params['Account Name'].Operator;
                    let values = params['Account Name'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.AccountDesc ' + operator + ' @accountname ';
                            request.input('accountname', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.AccountDesc ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Transaction Type'] !== 'undefined') {
                    let operator = params['Transaction Type'].Operator;
                    let values = params['Transaction Type'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jd.JournalTransactionTypeId ' + operator + ' @transactiontype ';
                            request.input('transactiontype', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jd.JournalTransactionTypeId ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'IS NULL':
                            query = query + ' AND jd.JournalTransactionTypeId ' + operator;
                            request.input('transactiontype', sql.VarChar, values);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Tax Year'] !== 'undefined') {
                    let operator = params['Tax Year'].Operator;
                    let values = params['Tax Year'].Values;

                    switch (operator) {
                        case '=':
                        case '>':
                        case '<':
                        case '>=':
                        case '<=':
                            query = query + ' AND jd.TaxYearNbr ' + operator + ' @taxyear ';
                            request.input('taxyear', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jd.TaxYearNbr ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            query = query + ' AND (jd.TaxYearNbr ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.Int, values[0]);
                            request.input('valueTwo', sql.Int, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Client Name'] !== 'undefined') {
                    let operator = params['Client Name'].Operator;
                    let values = params['Client Name'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                            query = query + ' AND jd.ClientNm ' + operator + ' @clientname ';
                            request.input('clientname', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jd.ClientNm ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Sending Company Code'] !== 'undefined') {
                    let operator = params['Sending Company Code'].Operator;
                    let values = params['Sending Company Code'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.SendingCompanyCd ' + operator + ' @sendingcompanycode ';
                            request.input('sendingcompanycode', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.SendingCompanyCd ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Mapping Status'] !== 'undefined') {
                    let operator = params['Mapping Status'].Operator;
                    let values = params['Mapping Status'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jd.MappingStatusInd ' + params['Mapping Status'].Operator + ' @mappingstatus ';
                            request.input('mappingstatus', sql.VarChar, params['Mapping Status'].Values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jd.MappingStatusInd ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Assignment Profile Indicator'] !== 'undefined') {
                    let operator = params['Assignment Profile Indicator'].Operator;
                    let values = params['Assignment Profile Indicator'].Values;

                    switch (operator) {
                        case '=':
                        case '<':
                        case '>':
                        case '>=':
                        case '<=':
                        case 'LIKE':
                            query = query + ' AND ap.AssignmentProfileIndicator ' + operator + ' @assignmentprofileindicator ';
                            request.input('assignmentprofileindicator', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND ap.AssignmentProfileIndicator ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Taxable Status'] !== 'undefined') {
                    let operator = params['Taxable Status'].Operator;
                    let values = params['Taxable Status'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND ap.HostCountryTax ' + operator + ' @taxablestatus ';
                            request.input('taxablestatus', sql.VarChar, values);
                            break;
                        case 'IN':
                            query = query + ' AND ap.HostCountryTax ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Compensatory in Home'] !== 'undefined') {
                    let operator = params['Compensatory in Home'].Operator;
                    let values = params['Compensatory in Home'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND ap.HomeCompensatory ' + params['Compensatory in Home'].Operator + ' @compensatoryinhome ';
                            request.input('compensatoryinhome', sql.VarChar, params['Compensatory in Home'].Values);
                            break;
                        case 'IN':
                            query = query + ' AND ap.HomeCompensatory ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Project Name'] !== 'undefined') {
                    let operator = params['Project Name'].Operator;
                    let values = params['Project Name'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                            query = query + ' AND ap.ProjectNm ' + operator + ' @projectname ';
                            request.input('projectname', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND ap.ProjectNm ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Project Organization'] !== 'undefined') {
                    let operator = params['Project Organization'].Operator;
                    let values = params['Project Organization'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                            query = query + ' AND ap.ProjectOrganization ' + operator + ' @projectorganization ';
                            request.input('projectorganization', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND ap.ProjectOrganization ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Host Country Name'] !== 'undefined') {
                    let operator = params['Host Country Name'].Operator;
                    let values = params['Host Country Name'].Values;

                    switch (operator) {
                        case '=':
                        case '<>':
                            query = query + ' AND ap.HostCountry ' + operator + ' @hostcountryname ';
                            request.input('hostcountryname', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND ap.HostCountry ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Reference'] !== 'undefined') {
                    let operator = params['Reference'].Operator;
                    let values = params['Reference'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.ReferenceNbr ' + operator + ' @reference ';
                            request.input('reference', sql.VarChar, values);
                            break;
                        case 'IN':
                            query = query + ' AND jt.ReferenceNbr ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Enterprise ID of Parked By'] !== 'undefined') {
                    let operator = params['Enterprise ID of Parked By'].Operator;
                    let values = params['Enterprise ID of Parked By'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.EnterpriseIDParkedBy ' + operator + ' @eidofparkedby ';
                            request.input('eidofparkedby', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.EnterpriseIDParkedBy ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'IS NULL':
                        case 'IS NOT NULL':
                            query = query + ' AND jt.EnterpriseIDParkedBy ' + operator;
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Enterprise ID of Posted By'] !== 'undefined') {
                    let operator = params['Enterprise ID of Posted By'].Operator;
                    let values = params['Enterprise ID of Posted By'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.EnterpriseIDEnteredBy ' + operator + ' @eidofpostedby ';
                            request.input('eidofpostedby', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.EnterpriseIDEnteredBy ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'IS NULL':
                        case 'IS NOT NULL':
                            query = query + ' AND jt.EnterpriseIDEnteredBy ' + operator;
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Functional Area'] !== 'undefined') {
                    let operator = params['Functional Area'].Operator;
                    let values = params['Functional Area'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.FunctionalArea ' + operator + ' @functionalarea ';
                            request.input('functionalarea', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.FunctionalArea ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Geographic Unit'] !== 'undefined') {
                    let operator = params['Geographic Unit'].Operator;
                    let values = params['Geographic Unit'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.GeographicUnitDesc ' + operator + ' @geographicunit ';
                            request.input('geographicunit', sql.VarChar, values);
                            break;
                        case 'IN':
                            query = query + ' AND jt.GeographicUnitDesc ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Document Number'] !== 'undefined') {
                    let operator = params['Document Number'].Operator;
                    let values = params['Document Number'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.DocumentNbr ' + operator + ' @documentnumber ';
                            request.input('documentnumber', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.DocumentNbr ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'BETWEEN':
                            query = query + ' AND (jt.DocumentNbr ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.VarChar, values[0]);
                            request.input('valueTwo', sql.VarChar, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Sending Co Code Doc No.'] !== 'undefined') {
                    let operator = params['Sending Co Code Doc No.'].Operator;
                    let values = params['Sending Co Code Doc No.'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.SendingCompanyCodeDocumentNbr ' + operator + ' @sendingcocodedocnumber ';
                            request.input('sendingcocodedocnumber', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.SendingCompanyCodeDocumentNbr ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'BETWEEN':
                            query = query + ' AND (jt.SendingCompanyCodeDocumentNbr ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.VarChar, values[0]);
                            request.input('valueTwo', sql.VarChar, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Document Type'] !== 'undefined') {
                    let operator = params['Document Type'].Operator;
                    let values = params['Document Type'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                        case 'NOT LIKE':
                            query = query + ' AND jt.DocumentTypeCd ' + operator + ' @documenttype ';
                            request.input('documenttype', sql.VarChar, values);
                            break;
                        case 'IN':
                            query = query + ' AND jt.DocumentTypeCd ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            query = query + ' AND (jt.DocumentTypeCd ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.VarChar, values[0]);
                            request.input('valueTwo', sql.VarChar, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Transaction Profit Center'] !== 'undefined') {
                    let operator = params['Transaction Profit Center'].Operator;
                    let values = params['Transaction Profit Center'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                            query = query + ' AND jt.ProfitCenterId ' + operator + ' @transactionprofitcenter ';
                            request.input('transactionprofitcenter', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.ProfitCenterId ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            query = query + ' AND (jt.ProfitCenterId ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.VarChar, values[0]);
                            request.input('valueTwo', sql.VarChar, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Updated by'] !== 'undefined') {
                    let operator = params['Updated by'].Operator;
                    let values = params['Updated by'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jd.UpdateUserId ' + operator + ' @updatedby ';
                            request.input('updatedby', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jd.UpdateUserId ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'IS NULL':
                        case 'IS NOT NULL':
                            query = query + ' AND jd.UpdateUserId ' + operator;
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Last Updated'] !== 'undefined') {
                    let operator = params['Last Updated'].Operator;
                    let values = params['Last Updated'].Values;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jd.UpdateDttm BETWEEN @lastupdated AND DATEADD(dd,1,@lastupdated) ';
                            request.input('lastupdated', sql.Date, values);
                            break;
                        case '<>':
                            query = query + ' AND jd.UpdateDttm NOT BETWEEN @lastupdated AND DATEADD(dd,1,@lastupdated) ';
                            request.input('lastupdated', sql.Date, values);
                            break;
                        case '<':
                            query = query + ' AND jd.UpdateDttm ' + operator + ' @lastupdated ';
                            request.input('lastupdated', sql.Date, values);
                            break;
                        case '>':
                            query = query + ' AND jd.UpdateDttm ' + operator + ' DATEADD(dd,1,@lastupdated) ';
                            request.input('lastupdated', sql.Date, values);
                            break;
                        case '>=':
                            query = query + ' AND jd.UpdateDttm ' + operator + ' @lastupdated ';
                            request.input('lastupdated', sql.Date, values);
                            break;
                        case '<=':
                            query = query + ' AND jd.UpdateDttm < DATEADD(dd,1,@lastupdated) ';
                            request.input('lastupdated', sql.Date, values);
                            break;
                        case 'LIKE':
                            query = query + ' AND jd.UpdateDttm ' + operator + ' @lastupdated ';
                            request.input('lastupdated', sql.Date, values);
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            query = query + ' AND (jd.UpdateDttm ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.Date, values.Values[0]);
                            request.input('valueTwo', sql.Date, values.Values[1]);
                            break;
                        case 'IS NULL':
                        case 'IS NOT NULL':
                            query = query + ' AND jd.UpdateDttm ' + operator;
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Start Date'] !== 'undefined') {
                    let operator = params['Start Date'].Operator;
                    let values = params['Start Date'].Values;

                    switch (operator) {
                        case '=':
                        case '<>':
                        case '<':
                        case '>':
                        case '>=':
                        case '<=':
                        case 'LIKE':
                            query = query + ' AND ap.AssignmentStartDt ' + operator + ' @startdate ';
                            request.input('startdate', sql.VarChar, values);
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            query = query + ' AND (ap.AssignmentStartDt ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.Date, values[0]);
                            request.input('valueTwo', sql.Date, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['End Date'] !== 'undefined') {
                    let operator = params['End Date'].Operator;
                    let values = params['End Date'].Values;

                    switch (operator) {
                        case '=':
                        case '<>':
                        case '<':
                        case '>':
                        case '>=':
                        case '<=':
                        case 'LIKE':
                            query = query + ' AND ap.AssignmentEndDt ' + operator + ' @enddate ';
                            request.input('enddate', sql.VarChar, values);
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            query = query + ' AND (ap.AssignmentEndDt ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.Date, values[0]);
                            request.input('valueTwo', sql.Date, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Year/Month'] !== 'undefined') {
                    let operator = params['Year/Month'].Operator;

                    switch (operator) {
                        case '=':
                            query = query + ' AND jt.PostingDt ' + params['Year/Month'].Operator + ' @yearmonth ';
                            request.input('yearmonth', sql.VarChar, params['Year/Month'].Values);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Document Posting Date'] !== 'undefined') {
                    let operator = params['Document Posting Date'].Operator;
                    let values = params['Document Posting Date'].Values;

                    switch (operator) {
                        case '=':
                        case '<':
                        case '>':
                        case '>=':
                        case '<=':
                            query = query + ' AND jt.PostingDt ' + params['Document Posting Date'].Operator + ' @postingdate ';
                            request.input('postingdate', sql.Date, params['Document Posting Date'].Values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.PostingDt ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.Date, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            query = query + ' AND (jt.PostingDt ' + operator + ' @valueOne ';
                            query = query + ' AND @valueTwo) ';
                            request.input('valueOne', sql.Date, values[0]);
                            request.input('valueTwo', sql.Date, values[1]);
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Parked by ID'] !== 'undefined') {
                    let operator = params['Parked by ID'].Operator;
                    var values = params['Parked by ID'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                            query = query + ' AND jt.ParkedById ' + operator + ' @parkedbyid ';
                            request.input('parkedbyid', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.ParkedById ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Posted by ID'] !== 'undefined') {
                    let operator = params['Posted by ID'].Operator;
                    let values = params['Posted by ID'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                            query = query + ' AND jt.PostedById ' + operator + ' @postedbyid ';
                            request.input('postedbyid', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jt.PostedById ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }

                if (typeof params['Comments'] !== 'undefined') {
                    let operator = params['Comments'].Operator;
                    let values = params['Comments'].Values;

                    switch (operator) {
                        case '=':
                        case 'LIKE':
                        case 'NOT LIKE':
                            query = query + ' AND jd.CommentsTxt ' + operator + ' @comments ';
                            request.input('comments', sql.VarChar, values);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            query = query + ' AND jd.CommentsTxt ' + operator + ' (';

                            for (let i in values) {
                                query = query + '@value' + i + ', ';
                                request.input('value' + i, sql.VarChar, values[i]);
                            }

                            query = query.substring(0, query.lastIndexOf(',')) + ')';
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        query = query + search.orderBy;

        return request.query(query);
    }
};
