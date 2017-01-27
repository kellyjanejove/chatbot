(function() {
  'use strict';

  var constants = {
    'CONFIRM' : 'confirm',
    'CANCEL' : 'cancel',
    'OPEN_MODAL' : 'open-modal',
    'CLOSE_MODAL' : 'close-modal',
    'DATE_FORMAT' : 'dd-MMM-yyyy',
    'DATE_FORMAT_BACKEND' : 'yyyy-MM-dd',
    'DATE_YEAR_FORMAT' : 'yy',
    'ERROR_MSG_REQUIRED' : 'Field value is missing',
    'ERROR_MSG_TWO_DATES' : 'Requires two dates',
    'OPEN_DIALOGBOX_MODAL' : 'open-dialogbox-modal',
    'CLOSE_DIALOGBOX_MODAL' : 'close-dialogbox-modal',
    // 'OPEN_SAVECONFIRMATION_MODAL' : 'open-saveconfirmation-modal',
    // 'CLOSE_SAVECONFIRMATION_MODAL' : 'close-saveconfirmation-modal',
    'OPEN_SEARCH_DETAIL_MODAL' : 'open-search-detail-modal',
    'CLOSE_SEARCH_DETAIL_MODAL' : 'close-search-detail-modal',
    'MSG_NO_SEARCH_CRITERIA' : 'You did not specify any search criteria. Search Results may take a while. Do you still wish to proceed?',
    'ORDER_ASC' : 'ASC',
    'ORDER_DESC' : 'DESC',
    'MSG_UNSAVED_CHANGES' : 'Do you want to save changes?'
   

  };

  angular
    .module('app.core')
    .constant('Constants', constants);
})();