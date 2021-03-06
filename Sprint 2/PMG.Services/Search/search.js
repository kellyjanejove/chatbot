﻿'use strict';

var query = {};

query.select = `SELECT [Row] = jd.JournalTransactionDetailId,
                                        [Journal Transaction ID] = jd.JournalTransactionId,
                                        [Parent ID] = ISNULL(jd.JDParentId,0),
                                        [Co Code] = jt.CompanyCd,
                                        [Country Name] = jt.CountryNm,
                                        [Pers Num] = jd.AssigneePersonnelNbr,
                                        [Name] = LTRIM(RTRIM(ag.LastNm)) + ', ' + LTRIM(RTRIM(ag.FirstNm)) + ' ' + isnull(LTRIM(RTRIM(ag.middlenm)), ' '),
                                        [Acct Num] = CAST(jt.AccountId as int),
                                        [Acct Name] = jt.AccountDesc,
                                        [Posting Date] = convert(char,jt.PostingDt,106),
                                        [Line Item Description] = jt.LineItemDesc,
                                        [Local Amount] = jd.LocalCurrencyAmt,
                                        [Acctng Doc Num] = jt.DocumentNbr,
                                        [Transaction Type] = jd.JournalTransactionTypeDesc,
                                        [Tax Year] = jd.TaxYearNbr,
                                        [Client Name] = jd.ClientNm,
                                        [Send Co] = jt.SendingCompanyCd,
                                        [Comments] = jd.CommentsTxt,
                                        [Interco Doc Number] = jt.SendingCompanyCodeDocumentNbr,
                                        [Home Co Code] = ag.HomeCompanyCd,
                                        [Home Country] = ag.HomeCountryNm,
                                        [Level] = ag.LevelDesc,
                                        [Mapping Status] = jd.MappingStatusInd,
                                        [Cost Center Num] = jt.CostCenterId,
                                        [Cost Center Description] = jt.CostCenterDesc,
                                        [WBS Num] = jt.WBSNbr,
                                        [WBS Name] = jt.WBSDesc,
                                        [Profit Center Num] = jt.ProfitCenterId,
                                        [Doc Type] = jt.DocumentTypeCd,
                                        [Parked By ID] = jt.ParkedById,
                                        [Posted By ID] = jt.PostedById,
                                        [Updated By] = jd.UpdateUserId,
                                        [Last Updated] = ISNULL(REPLACE(CONVERT(varchar(11),jd.UpdateDttm,106),' ','-'),''),
                                        [Assignment Profile ID] = ap.TravelPlanIndicator,
                                        [Start Date] = ISNULL(REPLACE(CONVERT(varchar(11),ap.AssignmentStartDt,106),' ','-'),''),
                                        [End Date] = ISNULL(REPLACE(CONVERT(varchar(11),ap.AssignmentEndDt,106),' ','-'),''),
                                        [Taxable Status] = ap.HostCountryTax,
                                        [Compensatory in Home] = ap.HomeCompensatory,
                                        [Project Name] = ap.ProjectNm,
                                        [Project Organization] = ap.ProjectOrganization,
                                        [Host Country Name] = ap.HostCountry,
                                        [Reference] = jt.ReferenceNbr,
                                        [Enterprise ID of Parked By] = jt.EnterpriseIDParkedBy,
                                        [Enterprise ID of Posted By] = jt.EnterpriseIDEnteredBy,
                                        [Functional Area] = jt.FunctionalArea,
                                        [Year/Month] = CAST(IIF(MONTH(jt.PostingDt) >= 9,YEAR(DATEADD(YEAR, 1, jt.PostingDt)),YEAR(jt.PostingDt)) AS varchar(100)) +'/' + CAST(IIF(MONTH(jt.PostingDt) >= 9,MONTH(jt.PostingDt) - 8,MONTH(jt.PostingDt)+ 4) AS varchar(100)),
                                        [Revaluation Transaction Ind] = jd.RevaluationTransactionInd,
                                        [Operating Group Cd] = jd.OperatingGroupCd,
                                        [Operating Group Nm] = jd.OperatingGroupNm,
                                        [US Dollar Amt] = jd.USDollarAmt,
                                        [SiblingIsParent] = IIF(EXISTS(SELECT TOP 1 1 FROM JournalTransactionDetail p WITH(NOLOCK) JOIN JournalTransactionDetail c WITH(NOLOCK) ON p.JournalTransactionDetailId = c.JDParentId AND ISNULL(c.IsDeletedInd,'N') <> 'Y'
                                                                                                WHERE p.JDParentId = jd.JDParentId AND ISNULL(p.IsDeletedInd,'N') <> 'Y'),'Y','N')
                                FROM JournalTransactionDetail jd WITH(NOLOCK)
                                JOIN JournalTransaction jt WITH(NOLOCK) ON jd.JournalTransactionId = jt.JournalTransactionId
                                LEFT JOIN Assignee AG WITH(NOLOCK) ON  ag.AssigneePersonnelNbr  = jd.AssigneePersonnelNbr
                                LEFT JOIN (SELECT CompanyCd ,[IsAvanadeInd] = ISNULL(IsAvanadeInd,'N') ,CompanyDesc = LTRIM(RTRIM(CompanyDesc)) FROM CompanyToCountry WITH(NOLOCK)) cc ON cc.CompanyCd = jt.CompanyCd
                                LEFT JOIN TravelPlan ap WITH(NOLOCK) ON ap.TravelPlanIndicator = jd.TravelPlanIndicator
                                WHERE EXISTS (SELECT * FROM UserToCompany uc WITH(NOLOCK) WHERE uc.CompanyCd = jt.CompanyCd)
                                AND ISNULL(jd.SplitInd,'N') <> 'Y' AND ISNULL(jd.IsDeletedInd,'N') <> 'Y'`;

query.orderBy = 'ORDER BY jd.JournalTransactionDetailId DESC ';

query.fetchBy = ` OFFSET @offset ROWS
					FETCH NEXT @pageSize ROWS ONLY`;

module.exports = query;
