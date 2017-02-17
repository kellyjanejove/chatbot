'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function (event, context, callback) {
    utils.getDbConfig()
        .then(function (data) {
            var connString = JSON.parse(data.Body);

            connString.requestTimeout = 450000;
            sql.connect(connString)
                .then(populateCountry)
                .catch(function (err) {
                    utils.handleError(err, callback);
                });
        }).catch(function (err) {
            utils.handleError(err, callback);
        });

    function populateCountry() {
        console.log('Populating country...');
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
        return `
                            IF OBJECT_ID('tempdb..#tempCountry') IS NOT NULL 
                            DROP TABLE #tempCountry;

                            IF OBJECT_ID('tempdb..#tempCountry_Blacklist') IS NOT NULL 
                            DROP TABLE #tempCountry_Blacklist;

                            CREATE TABLE #tempCountry  (
                                [SAPId] INT IDENTITY NOT NULL,
                                [LocationId] [int] NULL,
                                [CountryKeyId] [char](3) NOT NULL,
                                [CountryNm] [varchar](30) NOT NULL,
                                [GeographicUnitCd] [char](4) NULL
                            );	

                            CREATE TABLE #tempCountry_Blacklist  (
                                [SAPId] INT IDENTITY NOT NULL,
                                [LocationId]  [int] NULL, 
                                [CountryKeyId] [char](3) NOT NULL,
                                [CountryNm] [varchar](30) NOT NULL,
                                [GeographicUnitCd] [char](4) NULL
                            );

                            -- CREATE TEMP TABLE for COUNTRY BASELINE
                            IF OBJECT_ID('tempdb..#tempCountryBaseline') IS NOT NULL
                                DROP TABLE #tempCountryBaseline;

                            CREATE TABLE #tempCountryBaseline (
                                [LocationId] [int] NULL
                                ,[ParentLocationId] [int] NULL
                            );

                            -- POPULATE TEMP TABLE WITH COUNTRY NODES
                            INSERT INTO #tempCountryBaseline
                            SELECT LN.LocationId
                                ,LHR.ParentLocationId
                            FROM dbo.tblLocationHierarchyNode LN WITH (NOLOCK)
                            -- GET ALL LOCATION NODES THAT ARE COUNTRY
                            INNER JOIN tblLocationHierarchyAttribute LHA WITH (NOLOCK)
                                ON LHA.LocationId = LN.LocationId AND LHA.LocationAttributeValue = 'Country'
                            -- GET COUNTRIES' PARENT RELATIONSHIP(s)
                            LEFT JOIN dbo.tblLocationHierarchyRelationship LHR WITH (NOLOCK)
                                ON LHR.LocationId = LN.LocationId
                            
                            -- RECURSION. TEMP COUNTRY AGAINTS RELATIONSHIP TABLE
                            -- GOAL IS TO GET TOP LEVEL PARENT OF COUNTRY
                            -- THEN PULL ONLY GEOGRAPHIC UNIT PARENT LEVEL
                            ;WITH Parent
                            AS (
                                SELECT LocationId
                                    ,ParentLocationId
                                    ,0 AS [Level]
                                FROM #tempCountryBaseline WITH (NOLOCK)
                            
                                UNION ALL
                            
                                SELECT p.LocationId
                                    ,LHR.ParentLocationId
                                    ,[Level] + 1 AS [Level]
                                FROM tblLocationHierarchyRelationship LHR WITH (NOLOCK)
                                INNER JOIN Parent P ON P.ParentLocationId = LHR.LocationId
                                WHERE LHR.LocationHierarchyTypeCd = 'ACN'
                                )

                            --Query to be inserted in the #tempCountry temp table.

                            INSERT INTO #tempCountry
                            SELECT LN.LocationId
                                ,LEFT(LA.LocationAttributeValue, 3) AS [CountryKeyId]
                                ,LEFT(LN.LocationNm, 30) AS [CountryNm]
                                ,LEFT(LAN.LocationAttributeValue, 4) AS [GeographicUnit]
                            FROM Parent P
                            -- GET COUNTRY NAME FROM LOCATION NODE
                            INNER JOIN tblLocationHierarchyNode LN WITH (NOLOCK)
                                ON LN.LocationId = P.LocationId
                            -- GET ONLY GEOGRAPHIC UNIT AS TOP LEVEL PARENT
                            INNER JOIN tblLocationHierarchyAttribute LHAP WITH (NOLOCK)
                                ON LHAP.LocationId = P.ParentLocationId
                                    AND LHAP.LocationAttributeCd = 'USGTYP'
                                    AND LHAP.LocationAttributeValue = 'Geographic Unit'
                            -- GET ALL COUNTRIES CountryKey MRDRCD
                            INNER JOIN tblLocationHierarchyAttribute LA WITH (NOLOCK)
                                ON LA.LocationId = LN.LocationId AND LA.LocationAttributeCd = 'MRDRCD'
                            -- GET GEOGRAPHIC UNIT CD
                            INNER JOIN tblLocationHierarchyAttribute LAN WITH (NOLOCK)
                                ON LAN.LocationId = P.ParentLocationId AND LAN.LocationAttributeCd = 'MRDRCD'
                            ORDER BY LocationId ASC

                            --Query to be inserted in the #tempCountry_Blacklist temp table.

                            INSERT INTO  #tempCountry_Blacklist
                                SELECT  LocationId
                                    , [CountryKeyId]
                                    , [CountryNm]
                                    , [GeographicUnitCd]
                                FROM #tempCountry WITH (NOLOCK)
                                WHERE CountryKeyId NOT IN (
                                    'AE',
                                    'AN',
                                    'AS',
                                    'CC',
                                    'CI',
                                    'EH',
                                    'GF',
                                    'KN',
                                    'MP',
                                    'NU',
                                    'PG',
                                    'PN',
                                    'RU',
                                    'TK',
                                    'TT',
                                    'WS'
                                    )

                            ---- for updating and inserting records

                            MERGE [dbo].[sCountry] AS TARGET
                            USING #tempCountry_Blacklist AS [SOURCE]
                            ON [TARGET].[CountryKeyId] = [SOURCE].[CountryKeyId] Collate DATABASE_DEFAULT
                            WHEN MATCHED 
                            	 AND TARGET.CountryKeyId IS NOT NULL 
                            	 AND SOURCE.CountryKeyId IS NOT NULL 
                            THEN UPDATE SET [TARGET].[LocationId]		= [SOURCE].[LocationId],
                            			--	[TARGET].[CountryKeyId]		= [SOURCE].[CountryKeyId],
                            				[TARGET].[CountryNm]		= [SOURCE].[CountryNm],
                            				[TARGET].[GeographicUnitCd]	= [SOURCE].[GeographicUnitCd]

                            WHEN NOT MATCHED BY TARGET 
                            	 AND SOURCE.CountryKeyID IS NOT NULL
                            THEN INSERT ([SAPId],[LocationId], [CountryKeyId], [CountryNm], [GeographicUnitCd])
                            	 VALUES(
                                           [SOURCE].[SAPId],
                            			   [SOURCE].[LocationId],
                            			   [SOURCE].[CountryKeyId],
                            			   [SOURCE].[CountryNm],
                            			   [SOURCE].[GeographicUnitCd]);
                            
                        SET NOCOUNT OFF;`;
    }
};
