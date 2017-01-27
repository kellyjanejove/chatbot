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
                        populateAssignmentProfileFam(function (err) {
                            callback(err);
                        });
                    }
                });
            }
        });
    } catch (err) {
        callback(err);
    }

    function populateAssignmentProfileFam(callback) {
        console.log('Populating AssignmentProfileFam table...');
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
        return `UPDATE AssignmentProfileFAM
                SET	 [PersonnelNbr] = tAPFAM.[PersonnelNbr]
                    ,[FirstNm] = tAPFAM.[FirstNm]
                    ,[MiddleNm] = tAPFAM.[MiddleNm]
                    ,[LastNm] = tAPFAM.[LastNm]
                    ,[CompanyNm] = tAPFAM.[CompanyNm]
                    ,[EnterpriseID] = tAPFAM.[EnterpriseID]
                    ,[HomeCountry] = tAPFAM.[HomeCountry]
                    ,[EmployeeStatus] = tAPFAM.[EmployeeStatus]
                    ,[Classification] = tAPFAM.[Classification]	
                    ,[PolicyType] = tAPFAM.[PolicyType]
                    ,[StatusChangedDt] = tAPFAM.[StatusChangedDt]
                    ,[AssignmentProfileStatus] = tAPFAM.[AssignmentProfileStatus]
                    ,[AssignmentClosedDt] = tAPFAM.[AssignmentClosedDt]
                    ,[HostCountry] = tAPFAM.[HostCountry]
                    ,[ClientNm] = LTRIM(RTRIM(tAPFAM.[ClientNm]))
                    ,[ProjectNm] = tAPFAM.[ProjectNm]
                    ,[ProjectOrganization] = tAPFAM.[ProjectOrganization]
                    ,[ProjectAccentureLeadership] = tAPFAM.[ProjectAccentureLeadership]
                    ,[ProjectManager] = tAPFAM.[ProjectManager]
                    ,[ProjectContact] = tAPFAM.[ProjectContact]
                    ,[ProjectContactNbr] = tAPFAM.[ProjectContactNbr]
                    ,[HostStatus] = tAPFAM.[HostStatus]
                    ,[HomeStatus] = tAPFAM.[HomeStatus]
                    ,[HomeCompensatory] = tAPFAM.[HomeCompensatory]
                    ,[ProjectWbsElement] = tAPFAM.[ProjectWbsElement]
                    ,[AssignmentStartDt] = tAPFAM.[AssignmentStartDt]
                    ,[StartDtStatus] = tAPFAM.[StartDtStatus]
                    ,[AssignmentEndDt] = tAPFAM.[AssignmentEndDt]
                    ,[EndDtStatus] = tAPFAM.[EndDtStatus]
                    ,[HostCountryTax] = tAPFAM.[HostCountryTax]
                    ,[HostTaxableStartDt] = tAPFAM.[HostTaxableStartDt]
                    ,[HostTaxableEndDt] = tAPFAM.[HostTaxableEndDt]
                    ,[HostCompensatory] = tAPFAM.[HostCompensatory]
                    ,[ProjectCostCenterNbr] = tAPFAM.[ProjectCostCenterNbr]
                    ,[UpdateUserId] = SUSER_SNAME()
                    ,[UpdateDttm] = GETUTCDATE()
                FROM tblAssignmentProfileFAM tAPFAM
                JOIN AssignmentProfileFAM APFAM ON APFAM.AssignmentProfileIndicator = tAPFAM.AssignmentProfileIndicator	
                --END  : Update existing records

                --BEGIN: Insert New Records
                INSERT INTO [dbo].[AssignmentProfileFAM] (
                    [PersonnelNbr]
                    ,[FirstNm]
                    ,[MiddleNm]
                    ,[LastNm]
                    ,[CompanyNm]
                    ,[EnterpriseID]
                    ,[HomeCountry]
                    ,[EmployeeStatus]
                    ,[Classification]
                    ,[AssignmentProfileIndicator]
                    ,[PolicyType]
                    ,[StatusChangedDt]
                    ,[AssignmentProfileStatus]
                    ,[AssignmentClosedDt]
                    ,[HostCountry]
                    ,[ClientNm]
                    ,[ProjectNm]
                    ,[ProjectOrganization]
                    ,[ProjectAccentureLeadership]
                    ,[ProjectManager]
                    ,[ProjectContact]
                    ,[ProjectContactNbr]
                    ,[HostStatus]
                    ,[HomeStatus]
                    ,[HomeCompensatory]
                    ,[ProjectWbsElement]
                    ,[AssignmentStartDt]
                    ,[StartDtStatus]
                    ,[AssignmentEndDt]
                    ,[EndDtStatus]
                    ,[HostCountryTax]
                    ,[HostTaxableStartDt]
                    ,[HostTaxableEndDt]
                    ,[HostCompensatory]
                    ,[ProjectCostCenterNbr]
                    ,[CreateUserId]
                    ,[CreateDttm]	
                    )
                SELECT
                    tAPFAM.[PersonnelNbr]
                    ,tAPFAM.[FirstNm]
                    ,tAPFAM.[MiddleNm]
                    ,tAPFAM.[LastNm]
                    ,tAPFAM.[CompanyNm]
                    ,tAPFAM.[EnterpriseID]
                    ,tAPFAM.[HomeCountry]
                    ,tAPFAM.[EmployeeStatus]
                    ,tAPFAM.[Classification]
                    ,tAPFAM.[AssignmentProfileIndicator]
                    ,tAPFAM.[PolicyType]
                    ,tAPFAM.[StatusChangedDt]
                    ,tAPFAM.[AssignmentProfileStatus]
                    ,tAPFAM.[AssignmentClosedDt]
                    ,tAPFAM.[HostCountry]
                    ,LTRIM(RTRIM(tAPFAM.[ClientNm]))
                    ,tAPFAM.[ProjectNm]
                    ,tAPFAM.[ProjectOrganization]
                    ,tAPFAM.[ProjectAccentureLeadership]
                    ,tAPFAM.[ProjectManager]
                    ,tAPFAM.[ProjectContact]
                    ,tAPFAM.[ProjectContactNbr]
                    ,tAPFAM.[HostStatus]
                    ,tAPFAM.[HomeStatus]
                    ,tAPFAM.[HomeCompensatory]
                    ,tAPFAM.[ProjectWbsElement]
                    ,tAPFAM.[AssignmentStartDt]
                    ,tAPFAM.[StartDtStatus]
                    ,tAPFAM.[AssignmentEndDt]
                    ,tAPFAM.[EndDtStatus]
                    ,tAPFAM.[HostCountryTax]
                    ,tAPFAM.[HostTaxableStartDt]
                    ,tAPFAM.[HostTaxableEndDt]
                    ,tAPFAM.[HostCompensatory]
                    ,tAPFAM.[ProjectCostCenterNbr]
                    ,SUSER_SNAME()
                    ,GETUTCDATE()
                FROM tblAssignmentProfileFAM tAPFAM
                LEFT JOIN AssignmentProfileFAM APFAM ON APFAM.AssignmentProfileIndicator = tAPFAM.AssignmentProfileIndicator
                WHERE APFAM.AssignmentProfileIndicator IS NULL`;
    }
};
