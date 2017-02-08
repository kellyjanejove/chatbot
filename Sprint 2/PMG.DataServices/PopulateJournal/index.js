'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function(event, context, callback) {
    utils.getDbConfig()
        .then(function(data) {
            var connString = JSON.parse(data.Body);

            connString.requestTimeout = 450000;
            sql.connect(connString)
                .then(populateJournal)
                .catch(function(err) {
                    utils.handleError(err, callback);
                });
        }).catch(function(err) {
            utils.handleError(err, callback);
        });

    function populateJournal(callback) {
        console.log('Populating Journal table...');
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
        return `INSERT INTO		JournalTransaction
				(
					CompanyCd,
					CompanyDesc,
					DocumentNbr,
					SAPFiscalYearNm,
					CountryNm,
					GeographicUnitCd,
					GeographicUnitDesc,
					CurrencyCd,
					CostCenterId,
					CostCenterDesc,
					WBSNbr,
					WBSDesc,
					AccountId,
					AccountDesc,
					ProfitCenterId,
					PostingDt,
					LineItemNbr,
					LineItemDesc,
					SendingCompanyCd,
					SendingDocumentNbr,
					SendingCompanyCodeDocumentNbr,
					DocumentEntryDt,
					DocumentTypeCd,
					ParkedById,
					PostedById,
					ReferenceNbr,
					FunctionalArea,
					EnterpriseIDParkedBy,
					EnterpriseIDEnteredBy
					)

                SELECT tJH.CompanyCd,
					cc.CompanyDesc,
					tJH.DocumentNbr,
					tJH.SAPFiscalYearNm,
					LTRIM(RTRIM(cc.CountryNm)),
					cc.GeographicUnitCd, 
					LTRIM(RTRIM(sg.GeographicUnitDescr)),
					tJH.CurrencyKeyCd,
					CASE WHEN LEN(tJD.CostCenterId) = 0 THEN NULL ELSE tJD.CostCenterId END,
					LTRIM(RTRIM(sc.CostCenterShortNm)),
					CASE WHEN LEN(tJD.WBSElementNbr) = 0 THEN NULL ELSE tJD.WBSElementNbr END,
					CASE WHEN LEN(sw.WBSDescr) = 0 THEN NULL ELSE LTRIM(RTRIM(sw.WBSDescr)) END,
					tJD.AccountId,
					LTRIM(RTRIM(sa.AccountDescr)),
					CASE WHEN LEN(tJD.ProfitCenterId) = 0 THEN NULL ELSE tJD.ProfitCenterId END,
					tJH.PostingDt,
					tJD.LineItemNbr,
					LTRIM(RTRIM(tJD.LineItemDesc)),
					CASE WHEN LEN(tJD.SendingCompanyCd) = 0 THEN NULL ELSE tJD.SendingCompanyCd END,
					CASE WHEN LEN(tJD.SendingCompanyCd) = 0 OR tJD.SendingCompanyCd IS NULL THEN NULL ELSE tJH.SendingDocumentNbr END,
					NULL,
					tJH.DocumentEntryDt,
					tJH.DocumentTypeCd,
					CASE WHEN LEN(tJH.ParkedById) = 0 THEN NULL ELSE LTRIM(RTRIM(tJH.ParkedById)) END,
					LTRIM(RTRIM(tJH.PostedById)),
					tJH.ReferenceNbr,
					sw.FunctionalArea,
					parkedbyid.[EnterpriseID],
                    enteredbyid.[EnterpriseID]
                FROM	tblJournalHeader tJH
		        JOIN tblJournalDetail tJD ON tJH.CompanyCd = tJD.CompanyCd AND
									tJH.DocumentNbr = tJD.DocumentNbr AND
									tJH.SAPFiscalYearNm = tJD.SAPFiscalYearNm
                LEFT JOIN CompanyToCountry cc ON tJH.CompanyCd = cc.CompanyCd
                LEFT JOIN GeographicUnit sg ON	cc.GeographicUnitCd = sg.GeographicUnitCd
                LEFT JOIN sCostCenter sc ON	tJD.CostCenterId = sc.CostCenterNbr
                LEFT JOIN sAccount sa ON tJD.AccountId = sa.AccountNbr AND tJD.CompanyCd = sa.CompanyCd 
                LEFT JOIN sWBS sw ON tJD.WBSElementNbr = sw.WBSExternalNbr
                LEFT JOIN JournalTransaction J ON tJH.CompanyCd = J.CompanyCd AND
										  tJH.DocumentNbr = J.DocumentNbr AND
										  tJH.SAPFiscalYearNm = J.SAPFiscalYearNm AND
										  tJD.LineItemNbr = J.LineItemNbr
                LEFT JOIN [People] parkedbyid ON tJH.[ParkedById] = parkedbyid.[SAPUserNm]
                LEFT JOIN [People] enteredbyid ON tJH.[PostedById] = enteredbyid.[SAPUserNm]

                WHERE	J.CompanyCd IS NULL AND
                        J.DocumentNbr IS NULL AND
                        J.SAPFiscalYearNm IS NULL AND
                        J.LineItemNbr IS NULL AND 
                        tJD.AccountId <> '0000143010'`;
    }
};
