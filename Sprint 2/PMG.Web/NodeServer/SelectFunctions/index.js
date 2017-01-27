'use-strict';

var sql = require('mssql');
var express = require('express');
var search = require('./search.js');
var app = express();

var connString = {
    'user': 'sa',
    'password': 'Accenture01',
    'server': 'localhost',
    'options': {
        'encrypt': 'true',
        'database': '0825_GlobaTranFinanDatab_PrdR1',
        'requestTimeout': 300000
    }
};

// START LOOK UP

app.get('/assigneeNames', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE (LTRIM(RTRIM([LastNm])) + ', ' + LTRIM(RTRIM([FirstNm])) + ' ' + LTRIM(RTRIM([MiddleNm])) + ' - ' + LTRIM(RTRIM([AssigneePersonnelNbr]))) IS NOT NULL AND ((LastNm LIKE @value + '%') OR (AssigneePersonnelNbr LIKE @value + '%'))";
        query = query + ' ORDER BY [Full Name]';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT TOP 10 (LTRIM(RTRIM([LastNm])) + ', ' + LTRIM(RTRIM([FirstNm])) + ' ' + LTRIM(RTRIM([MiddleNm])) + ' - ' + LTRIM(RTRIM([AssigneePersonnelNbr]))) AS [Full Name]
                FROM Assignee WITH(NOLOCK) `;
    }
});

app.get('/assigneePersonnelNumbers', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE AssigneePersonnelNbr LIKE @value + '%'";

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT TOP 10 LTRIM(RTRIM(AssigneePersonnelNbr)) AS [AssigneePersonnelNumber]
                FROM Assignee WITH(NOLOCK) `;
    }
});

app.get('/assignmentProfileIndicators', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE AssignmentProfileIndicator IS NOT NULL AND AssignmentProfileIndicator <> '' AND AssignmentProfileIndicator LIKE @value + '%'";
        query = query + ' ORDER BY LTRIM(RTRIM(AssignmentProfileIndicator))';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT TOP 10 LTRIM(RTRIM(AssignmentProfileIndicator)) AS [AssignmentProfileIndicator]
                FROM AssignmentProfileFAM WITH(NOLOCK) `;
    }
});

app.get('/clientData', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.personnelNumber);
        query = query + 'WHERE PersonnelNbr = @value';
        query = query + ' ORDER BY [ClientData]';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT LTRIM(RTRIM(ISNULL(ClientNm, 'no data'))) + ' : ' +
            CAST(AssignmentProfileIndicator AS varchar(20)) + ' (' + IIF(ISNULL(AssignmentStartDt, '')
            = '', '', CONVERT(varchar,AssignmentStartDt,106)) + '/' + IIF(ISNULL(AssignmentEndDt, '')
            = '', '', CONVERT(varchar,AssignmentEndDt,106)) + ') ' + HostCountry AS [ClientData]
            FROM AssignmentProfileFAM `;
    }
});

app.get('/clientNames', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE ClientNm IS NOT NULL AND ClientNm LIKE @value + '%'";

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT TOP 10 LTRIM(RTRIM(ClientNm)) AS [ClientName]
                FROM Assignment WITH(NOLOCK) `;
    }
});

app.get('/eidsOfEnteredBy', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE EnterpriseIDEnteredBy IS NOT NULL AND EnterpriseIDEnteredBy <> '' AND EnterpriseIDEnteredBy LIKE @value + '%'";
        query = query + ' ORDER BY LTRIM(RTRIM(EnterpriseIDEnteredBy))';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT LTRIM(RTRIM(EnterpriseIDEnteredBy)) AS [EnterpriseIDEnteredBy]
                FROM JournalTransaction WITH(NOLOCK) `;
    }
});

app.get('/eidsOfParkedBy', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE EnterpriseIDParkedBy IS NOT NULL AND EnterpriseIDParkedBy <> '' AND EnterpriseIDParkedBy LIKE @value + '%'";
        query = query + ' ORDER BY LTRIM(RTRIM(EnterpriseIDParkedBy))';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT LTRIM(RTRIM(EnterpriseIDParkedBy)) AS [EnterpriseIDEnteredBy]
                FROM JournalTransaction WITH(NOLOCK) `;
    }
});

app.get('/hostCountries', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE HHTE.HostCountry IS NOT NULL AND HHTE.HostCountry LIKE @value + '%'";
        query = query + ' ORDER BY HHTE.HostCountry';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT HHTE.HostCountry 
                FROM UserToCompany UC WITH(NOLOCK)
                JOIN CompanyToCountry CC WITH(NOLOCK) ON CC.CompanyCd = UC.CompanyCd
                JOIN HomeHostTaxEqualization HHTE ON HHTE.CompanyNm = CC.CompanyDesc `;
    }
});

app.get('/projectNames', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE ProjectNm <> '' AND ProjectNm IS NOT NULL AND ProjectNm LIKE @value + '%'";
        query = query + ' ORDER BY ProjectNm';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT TOP 10 ProjectNm 
                FROM Assignment WITH(NOLOCK) `;
    }
});

app.get('/projectOrganizations', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE ProjectOrganization IS NOT NULL AND ProjectOrganization <> '' AND ProjectOrganization LIKE @value + '%'";
        query = query + ' ORDER BY ProjectOrganization';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT TOP 10 ProjectOrganization AS [ProjectOrganization]
                FROM AssignmentProfileFAM WITH(NOLOCK) `;
    }
});

app.get('/references', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.value);
        query = query + "WHERE ReferenceNbr IS NOT NULL AND ReferenceNbr <> '' AND ReferenceNbr LIKE @value + '%'";
        query = query + ' ORDER BY ReferenceNbr';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT TOP 10 ReferenceNbr 
                FROM JournalTransaction WITH(NOLOCK) `;
    }
});

app.get('/transactionTypeData', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.input('value', sql.VarChar, req.query.accountNumber);
        query = query + "WHERE AccountId = '0000' + @value";
        query = query + ' ORDER BY [TransactionTypeData]';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT RTRIM(JournalTransactionTypeDesc) + ' : ' + CAST(JournalTransactionTypeId as varchar) AS [TransactionTypeData]
                    FROM AccountToTransactionType `;
    }
});

// END LOOK UP

// START LIST 

app.get('/accounts', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT CAST(CAST(CodeTxt AS INT) AS VARCHAR) + ' - ' + LTRIM(RTRIM(DecodeTxt)) AS [Number],
                LTRIM(RTRIM(DecodeTxt)) AS [Name]
                FROM CodeDetail WITH(NOLOCK)
                WHERE CategoryNbr = '16'
                ORDER BY CAST(CodeTxt AS INT)`;
    }
});

app.get('/companyCodes', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        //request.input("UserEnterpriseId", sql.VarChar, req.query.UserEnterpriseId);
        //query = query + `WHERE UC.UserEnterpriseId = @UserEnterpriseId`;

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT LTRIM(RTRIM(CC.CompanyCd)) + ' - ' + LTRIM(RTRIM(CC.CompanyDesc)) AS [CompanyCode]
                FROM UserToCompany UC WITH(NOLOCK)
                JOIN CompanyToCountry CC WITH(NOLOCK)
                ON UC.CompanyCd = CC.CompanyCd `;
    }
});

app.get('/companyNames', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT LTRIM(RTRIM(DecodeTxt))
                FROM CodeDetail WITH(NOLOCK)
                WHERE CategoryNbr = '17'
                ORDER BY DecodeTxt`;
    }
});

app.get('/countries', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        // request.input("UserEnterpriseId", sql.VarChar, req.query.UserEnterpriseId);
        // query = query + `WHERE UC.UserEnterpriseId = @UserEnterpriseId`;
        query = query + 'ORDER BY LTRIM(RTRIM(CC.CountryNm))';

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT LTRIM(RTRIM(CC.CountryNm)) AS [CountryName]
                FROM UserToCompany UC WITH(NOLOCK)
                JOIN CompanyToCountry CC WITH(NOLOCK)
                ON UC.CompanyCd = CC.CompanyCd `;
    }
});

app.get('/functionalAreas', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT FunctionalArea
                FROM JournalTransaction WITH(NOLOCK)
                WHERE FunctionalArea IS NOT NULL AND FunctionalArea <> ''
                ORDER BY FunctionalArea`;
    }
});

app.get('/geographicUnits', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return 'SELECT GeographicUnitDescr FROM GeographicUnit';
    }
});

app.get('/homeCompensatories', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT LTRIM(RTRIM(HomeCompensatory))  AS [HomeCompensatory]
                FROM AssignmentProfileFAM WITH(NOLOCK)
                ORDER BY LTRIM(RTRIM(HomeCompensatory))`;
    }
});

app.get('/hostCountryTaxes', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT HostCountryTax
                FROM AssignmentProfileFAM WITH(NOLOCK)
                WHERE HostCountryTax <> ''
                ORDER BY HostCountryTax`;
    }
});

app.put('/journalTransactionDetails', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            updateList(req.query.updateParam);
        }
    });

    function updateList(records) {
        updateItem(0, records);
    }

    function updateItem(index, records) {
        // Checks whether passed paramater only contains 1 row due to 'express' limitation. 
        if (typeof records === 'string') {
            let updateParam = JSON.parse(records);
            getQuery(updateParam);
            res.json();
        } else if (typeof records === 'object') {
            if (index === records.length) {
                res.json();
            } else {
                let updateParam = JSON.parse(records[index]);
                getQuery(updateParam);
                updateItem(index + 1, records);
            }
        }
    }

    function getQuery(updateParam) {
        var request = new sql.Request();
        var query = `UPDATE JournalTransactionDetail 
                SET `;
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
                res.status(500).send(error);
            }
        });
    }
});

app.get('/mappingStatus', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT LTRIM(RTRIM(DecodeTxt)) AS [MappingStatus]
                FROM CodeDetail WITH(NOLOCK)
                WHERE CategoryNbr = '9'
                ORDER BY DecodeTxt`;
    }
});

app.get('/sendingCompanyCodes', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT DISTINCT LTRIM(RTRIM(CC.CompanyCd)) + ' - ' + LTRIM(RTRIM(CC.CompanyDesc))
                AS [SendingCompanyCode]
                FROM  CompanyToCountry CC WITH(NOLOCK)
                ORDER BY LTRIM(RTRIM(CC.CompanyCd)) + ' - ' + LTRIM(RTRIM(CC.CompanyDesc))`;
    }
});

app.get('/taxYears', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT LTRIM(RTRIM(DecodeTxt)) AS [TaxYear]
                FROM CodeDetail WITH(NOLOCK)
                WHERE CategoryNbr = '15'
                ORDER BY DecodeTxt`;
    }
});

app.get('/transactionTypes', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();

                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = getQuery();

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }

    function getQuery() {
        return `SELECT LTRIM(RTRIM(DecodeTxt)) + ' - ' + LTRIM(RTRIM(CodeTxt))
                FROM CodeDetail WITH(NOLOCK)
                WHERE CategoryNbr = '7'
                ORDER BY DecodeTxt`;
    }
});

// END LIST 

// START SEARCH
app.get('/searchDataMapping', function (req, res) {
    sql.connect(connString, function (err) {
        if (!err) {
            getList(function (err, data) {
                sql.close();
                if (!err) {
                    res.json(data);
                }
            });
        }
    });

    function getList(callback) {
        var request = new sql.Request();
        var query = search.select;

        var param = req.query;
        var params = null;

        if (typeof param.searchParam !== 'undefined') {
            params = JSON.parse(param.searchParam);

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

        query = query + search.orderBy;

        request.query(query, function (error, data) {
            callback(error, data);
        });
    }
});

// END SEARCH 

app.listen(3000);
