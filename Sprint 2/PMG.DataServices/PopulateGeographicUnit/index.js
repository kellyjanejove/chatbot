'use strict';

const sql = require('mssql');
const utils = require('../utils/lambda-utils');

exports.handler = function (event, context, callback) {
    utils.getDbConfig()
        .then(function (data) {
            var connString = JSON.parse(data.Body);

            connString.requestTimeout = 450000;
            sql.connect(connString)
                .then(populateGeographicUnit)
                .catch(function (err) {
                    utils.handleError(err, callback);
                });
        }).catch(function (err) {
            utils.handleError(err, callback);
        });

    function populateGeographicUnit() {
        console.log('Populating geographic units...');
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
        return `IF OBJECT_ID('tempdb..#tempGeographicUnit') IS NOT NULL 
                DROP TABLE #tempGeographicUnit;

                CREATE TABLE #tempGeographicUnit(
                    [GeographicUnitCd] [char](4) NOT NULL,
                    [GeographicUnitDescr] [varchar] (20) NULL,
                    [GeographicRegionCd][char] (2) NULL,
                    [GeographicRegionDescr] [varchar] (20) NULL
                );	

                INSERT INTO #tempGeographicUnit
                SELECT 
                    LEFT(LA.LocationAttributeValue,3) as [GeographicUnitCd]
                    ,LEFT(LN.LocationNm,30) as [GeographicUnitDesc]
                    ,MAX(LEFT(LAN.LocationAttributeValue,4)) as [GeographicRegionCd]
                    ,LEFT(LON.LocationNm,20) as [GeographicRegionDesc]
                FROM dbo.tblLocationHierarchyNode LN WITH (NOLOCK)
                -- GET ALL LOCATION NODES THAT ARE COUNTRY
                INNER JOIN tblLocationHierarchyAttribute LHA WITH (NOLOCK)
                    ON  LHA.LocationId = LN.LocationId
                    AND LHA.LocationAttributeValue = 'Geographic Unit'      
                -- GET ALL COUNTRIES CountryKey MRDRCD
                INNER JOIN tblLocationHierarchyAttribute LA WITH (NOLOCK)     
                    ON  LHA.LocationId = LA.LocationId       
                            AND LA.LocationAttributeCd = 'MRDRCD'
                -- GET COUNTRIES' PARENT RELATIONSHIP(s)
                LEFT JOIN dbo.tblLocationHierarchyRelationship LHR WITH (NOLOCK)
                    ON  LHR.LocationId = LN.LocationId
                -- GET COUNTRIES' PARENT RELATIONSHIP(s) AS GEOGRAPHIC UNIT
                LEFT JOIN tblLocationHierarchyAttribute LHAP WITH (NOLOCK)
                    ON  LHAP.LocationId = LHR.ParentLocationId
                            AND LHAP.LocationAttributeCd = 'USGTYP'
                            AND LHAP.LocationAttributeValue = 'Geographic Unit'
                LEFT JOIN tblLocationHierarchyAttribute LAN WITH (NOLOCK)     
                            ON  LAN.LocationId = LHR.ParentLocationId
                                    AND LAN.LocationAttributeCd = 'MRDRCD'
                LEFT JOIN tblLocationHierarchyNode LON
                            ON  LAN.LocationId = LON.LocationId
                WHERE 
                            LHR.LocationHierarchyTypeCd = 'ACN'
                            --OR LHR.LocationHierarchyTypeCd IS NULL       
                GROUP BY
                            LN.LocationId
                            ,LA.LocationAttributeValue
                            ,LN.LocationNm
                            ,LON.LocationNm
                ORDER BY 1 ASC

                --- for Updating/ Inserting Records

                MERGE [dbo].[GeographicUnit] AS TARGET
                USING #tempGeographicUnit AS SOURCE
                ON [TARGET].[GeographicUnitCd] = [SOURCE].[GeographicUnitCd] Collate DATABASE_DEFAULT
                WHEN MATCHED 
                    AND TARGET.GeographicUnitCd IS NOT NULL 
                    AND SOURCE.GeographicUnitCd IS NOT NULL 
                THEN UPDATE SET ---[TARGET].[GeographicUnitCd]		= [SOURCE].[GeographicUnitCd],
                                [TARGET].[GeographicUnitDescr]		= [SOURCE].[GeographicUnitDescr],
                                [TARGET].[GeographicRegionCd]		= [SOURCE].[GeographicRegionCd],
                                [TARGET].[GeographicRegionDescr]	= [SOURCE].[GeographicRegionDescr]

                WHEN NOT MATCHED BY TARGET 
                    AND SOURCE.GeographicUnitCd IS NOT NULL
                THEN INSERT ([GeographicUnitCd], [GeographicUnitDescr], [GeographicRegionCd], [GeographicRegionDescr])
                    VALUES(
                            [SOURCE].[GeographicUnitCd],
                            [SOURCE].[GeographicUnitDescr],
                            [SOURCE].[GeographicRegionCd],
                            [SOURCE].[GeographicRegionDescr]
                        );

                        SET NOCOUNT OFF;`;
    }
};
