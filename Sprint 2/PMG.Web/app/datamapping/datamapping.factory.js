(function() {
  'use strict';

  angular
    .module('app.datamapping')
    .factory('DataMappingFactory', DataMappingFactory);

  DataMappingFactory.$inject = ['$filter', 'Constants'];

  function DataMappingFactory($filter, Constants) {
    var exports = {
      getDefaultDataMappingList: getDefaultDataMappingList,
      convertDataMappingList: convertDataMappingList,
      convertDataMappingResultList: convertDataMappingResultList,

      convertBackDataMapping: convertBackDataMapping,
      convertBackDataMappingSearchCriteria: convertBackDataMappingSearchCriteria
    };

    return exports;

    /************************************** CONSTRUCTORS ***************************************/
    function DataMapping(item) {
      var datamapping = this;

      if (angular.isDefined(item) && angular.isObject(item) && item !== null) {
        datamapping.Name = item.Name;
        datamapping.Code = item.Code;
        datamapping.Operator = item.Operator;
        datamapping.OperatorList = item.OperatorList;
        datamapping.Type = item.Type;
        datamapping.Values = item.Values;
      } else {
        datamapping.Name = '';
        datamapping.Code = '';
        datamapping.Operator = '';
        datamapping.OperatorList = [];
        datamapping.Type = '';
        datamapping.Values = '';
      }

      datamapping.isSelected = false;
      datamapping.isPopoverOpen = false;
      datamapping.previousValues = [];
      datamapping.selectedValues = [];
      datamapping.ValueList = [];
      datamapping.ValueCountType = '';
      datamapping.searchName = '';
      datamapping.dateList = [];
    }

    function DataMappingResult(item) {
      var datamappingResult = this;

      if (angular.isDefined(item) && angular.isObject(item) && item !== null) {
        datamappingResult.Row = item['Row'];
        datamappingResult.Ind = (item['Mapping Status'] === '1');
        datamappingResult.ParentId = item['Parent ID'];
        datamappingResult.CoCode = item['Co Code'];
        datamappingResult.CountryName = item['Country Name'];
        datamappingResult.PersNumber = item['Pers Num'];
        datamappingResult.Name = item['Name'];
        datamappingResult.AcctNum = item['Acct Num'];
        datamappingResult.AcctName = item['Acct Name'];
        datamappingResult.PostingDate = $filter('date')(new Date(item['Posting Date']), Constants.DATE_FORMAT);
        datamappingResult.LineItemDescription = item['Line Item Description'];
        datamappingResult.LocalAmount = item['Local Amount'];
        datamappingResult.AcctngDocNum = item['Acctng Doc Num'];
        datamappingResult.TransactionType = item['Transaction Type'];
        datamappingResult.TaxYear = item['Tax Year'];
        datamappingResult.ClientName = item['Client Name'];
        datamappingResult.SendCo = item['Send Co'];
        datamappingResult.Comments = item['Comments'];
        datamappingResult.IntercoDocNumber = item['Interco Doc Number'];
        datamappingResult.HomeCoCode = item['Home Co Code'];
        datamappingResult.HomeCountry = item['Home Country'];
        datamappingResult.Level = item['Level'];
        datamappingResult.CostCenterNum = item['Cost Center Num'];
        datamappingResult.CostCenterDescription = item['Cost Center Description'];
        datamappingResult.WbsNum = item['WBS Num'];
        datamappingResult.WbsName = item['WBS Name'];
        datamappingResult.ProfitCenterNum = item['Profit Center Num'];
        datamappingResult.DocType = item['Doc Type'];
        datamappingResult.ParkedById = item['Parked By ID'];
        datamappingResult.PostedById = item['Posted By ID'];
        datamappingResult.UpdatedBy = item['Updated By'];
        datamappingResult.LastUpdated = item['Last Updated'];
        datamappingResult.AssignmentProfileId = item['Assignment Profile ID'];
        datamappingResult.StartDate = $filter('date')(item['Start Date'], Constants.DATE_FORMAT);
        datamappingResult.EndDate = $filter('date')(item['End Date'], Constants.DATE_FORMAT);
        datamappingResult.TaxableStatus = item['Taxable Status'];
        datamappingResult.CompensatoryInHome = item['Compensatory in Home'];
        datamappingResult.ProjectName = item['Project Name'];
        datamappingResult.ProjectOrganization = item['Project Organization'];
        datamappingResult.HostCountryName = item['Host Country Name'];
        datamappingResult.Reference = item['Reference'];
        datamappingResult.EnterpriseIdOfParkedBy = item['Enterprise ID of Parked By'];
        datamappingResult.EnterpriseIdOfPostedBy = item['Enterprise ID of Posted By'];
        datamappingResult.FunctionalArea = item['Functional Area'];
        datamappingResult.YearMonth = item['Year/Month'];
        datamappingResult.JeIdAndHeader = item['JE ID & Header'];
        datamappingResult.JournalTransactionDetailId = item['Row'];
      }
      datamappingResult.ValueList = [];
      datamappingResult.searchName = '';
      datamappingResult.selectedValue = '';
      datamappingResult.isNamePopoverOpen = false;
      datamappingResult.isTaxYearPopoverOpen = false;
      datamappingResult.isTransactionTypePopoverOpen = false;
      datamappingResult.isClientNamePopoverOpen = false;
      datamappingResult.isCommentsPopoverOpen = false;
      datamappingResult.dataMappingList = [];
    }
    

    /************************************** GET DEFAULT METHODS ***************************************/

    function getDefaultDataMappingList(dataMappingListFromJson) {
      var dataMappingList = [];

      angular.forEach(dataMappingListFromJson, function(data) {
        var dataMapping = new DataMapping();

        dataMapping.Name = data.Text;
        dataMapping.Code = data.Code;
        dataMapping.Type = data.Type;
        dataMapping.OperatorList = data.Operator.split('|');
        dataMapping.Default = (data.Default === 'True');
        dataMapping.isSelected = dataMapping.Default;

        dataMappingList.push(dataMapping);
      });

      var dataMapping = new DataMapping();
      dataMapping.Name = 'Additional Fields';
      dataMapping.isSelected = true;
      dataMappingList.push(dataMapping);

      return dataMappingList;
    }
    /************************************** CONVERT METHODS ***************************************/

    function convertDataMappingList(items) {
      var convertedList = [];

      angular.forEach(items, function(item) {
        convertedList.push(convertDataMapping(item));
      });

      return sortCollection(convertedList, ['name']);
    }

    function convertDataMapping(item) {
      return new DataMapping(item);
    }

    function convertDataMappingResultList(items) {
      var convertedList = [];

      angular.forEach(items, function(item) {
        convertedList.push(convertDataMappingResult(item));
      });

      return convertedList;
    }

    function convertDataMappingResult(item) {
      return new DataMappingResult(item);
    }

    /************************************** CONVERT BACK METHODS ***************************************/

    function convertBackDataMapping(item) {
      var convertedBack = {};

      convertedBack.Name = item.Name;
      convertedBack.Values = item.Values;

      return convertedBack;
    }

    function convertBackDataMappingSearchCriteria(items) {
      var param = {};
      // Send the query parameters only if field is shown on screen.
      var displayedFields = $filter('filter')(items, {isSelected:true});

      angular.forEach(displayedFields, function(item) {
        // Check if specific field has value.
        if (item.Values.length > 0 || item.dateList.length > 0 || item.Operator.indexOf('NULL') > -1) {
          var parsedValue = item.Values;
          var parsedValues = item.selectedValues;

          param[item.Name] = {};
          param[item.Name].Operator = item.Operator;
          param[item.Name].Values = '';
          
          // Get selected values for IN/NOT IN, BETWEEN/NOT BETWEEN.
          if ((item.Operator.indexOf('IN') > -1) || (item.Operator.indexOf('BETWEEN') > -1)) {
            // Parse specific fields ready for sql query.
            if (item.Name === 'Company Code' || item.Name === 'Sending Company Code') {
              parsedValues = convertBackCompanyCodeValues(item.selectedValues);
            } else if (item.Name === 'Assignee Name') {
              parsedValues = convertBackAssigneeNameValues(item.selectedValues);
            } else if (item.Name === 'Company Name') {
              parsedValues = convertBackCompanyNameValues(item.selectedValues);
            } else if (item.Name === 'Mapping Status') {
              parsedValues = convertBackMappingStatusValues(item.selectedValues);
            } else if (item.Name === 'Account Number') {
              parsedValues = convertBackAccountNumberValues(item.selectedValues);
            } else if (item.Name === 'Transaction Type') {
              parsedValues = convertBackTransactionTypeValues(item.selectedValues);
            } else if (item.Type === 'Text') {
              parsedValues = item.Values.split('; ');
            }
          }
          // Format the parameter based on operator and values.
          switch (item.Operator) {
            case 'LIKE':
            case 'NOT LIKE':
              if (item.Name === 'Account Number') {
                var value = item.Values;
                if (angular.isDefined(item.selectedValues[0])) {
                    value = item.selectedValues[0];
                }
                parsedValue = parseAccountNumberLike(value);
              }
              param[item.Name].Values = parsedValue;
              break;
            case '=':
            case '>':
            case '<':
            case '>=':
            case '<=':
            case '<>':
              // Parse specific fields ready for sql query.
              if (item.Name === 'Company Code' || item.Name === 'Sending Company Code') {
                parsedValue = parseCompanyCode(item.selectedValues[0]);
              } else if (item.Name === 'Assignee Name') {
                parsedValue = parseAssigneeName(item.selectedValues[0]);
              } else if (item.Name === 'Company Name') {
                parsedValue = parseCompanyName(item.selectedValues[0]);
              } else if (item.Name === 'Mapping Status') {
                parsedValue = parseMappingStatus(item.selectedValues[0]);
              } else if (item.Type === 'Date') {
                parsedValue = convertBackDate(item.dateList[0].value);
              } else if (item.Name === 'Account Number') {
                parsedValue = parseAccountNumber(item.selectedValues[0]);
              } else if (item.Name === 'Transaction Type') {
                parsedValue = parseTransactionType(item.selectedValues[0]);
              }
              param[item.Name].Values = parsedValue;
              break;
            case 'IS NULL':
            case 'IS NOT NULL':
              break;
            case 'BETWEEN':
            case 'NOT BETWEEN':
              if (item.Type === 'Date') {
                parsedValues = [];
                angular.forEach(item.dateList, function(date) {
                  parsedValues.push(convertBackDate(date.value));
                });
              }              
              parsedValues = $filter('orderBy')(parsedValues);
              param[item.Name].Values = parsedValues;
              break;
            case 'IN':
            case 'NOT IN':
              if (item.Type === 'Date') {
                parsedValues = [];
                angular.forEach(item.dateList, function(date) {
                  parsedValues.push(convertBackDate(date.value));
                });
              }
              param[item.Name].Values = parsedValues;
              break;
            default:
              break;
          }
        }
      });

      return param;
    }

    function convertBackCompanyCodeValues(initialValues) {
      var parsedValues = [];
      angular.forEach(initialValues, function(item) {
        parsedValues.push(parseCompanyCode(item));
      });

      return parsedValues;
    }

    function convertBackAssigneeNameValues(initialValues) {
      var parsedValues = [];
      angular.forEach(initialValues, function(item) {
        parsedValues.push(parseAssigneeName(item));
      });

      return parsedValues;
    }

    function convertBackCompanyNameValues(initialValues) {
      var parsedValues = [];
      angular.forEach(initialValues, function(item) {
        parsedValues.push(parseCompanyName(item));
      });

      return parsedValues;
    }

    function convertBackMappingStatusValues(initialValues) {
      var parsedValues = [];
      angular.forEach(initialValues, function(item) {
        parsedValues.push(parseMappingStatus(item));
      });

      return parsedValues;
    }

    function convertBackAccountNumberValues(initialValues) {
      var parsedValues = [];
      angular.forEach(initialValues, function(item) {
        parsedValues.push(parseAccountNumber(item));
      });

      return parsedValues;
    }

    function convertBackTransactionTypeValues(initialValues) {
      var parsedValues = [];
      angular.forEach(initialValues, function(item) {
        parsedValues.push(parseTransactionType(item));
      });

      return parsedValues;
    }

    function parseCompanyCode(initialValue) {
      return initialValue.substring(0, initialValue.indexOf('-') - 1);
    }

    function parseAssigneeName(initialValue) {
      return initialValue.substring(initialValue.indexOf('-') + 2, initialValue.length);
    }

    function parseCompanyName(initialValue) {
      return (initialValue === 'Avanade' ? 'Y': 'N');
    }

    function parseMappingStatus(initialValue) {
      return (initialValue === 'Mapped' ? '1': '0');
    }

    function parseAccountNumber(initialValue) {
      var minLength = 10;
      var padCharacter = '0';

      initialValue = initialValue.substring(0, initialValue.indexOf('-')).trim();

      while (initialValue.length < minLength) {
        initialValue = padCharacter + initialValue;
      }
      return initialValue;
    }

    function parseAccountNumberLike(initialValue) {
      return '0000' + initialValue;
    }

    function parseTransactionType(initialValue) {
      return initialValue.substring(initialValue.lastIndexOf('-') + 2, initialValue.length);
    }

    /************************************** OTHER METHODS ***************************************/

    function sortCollection(collection, attributeNames) {
      return $filter('orderBy')(collection, attributeNames);
    }

    function convertDate(date) {
      return $filter('date')(date, Constants.DATE_FORMAT);
    }

    function convertBackDate(date) {
      return $filter('date')(date, Constants.DATE_FORMAT_BACKEND);
    }
  }
})();