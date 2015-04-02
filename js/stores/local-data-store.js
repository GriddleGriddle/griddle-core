var AppDispatcher = require('../dispatcher/app-dispatcher');
var assign = require('object-assign'); 
var DataHelper = require('../helpers/data-helper'); 
var StoreBoilerplate = require('./store-boilerplate'); 
var Constants = require('../constants/constants');

var _state = {
  hasFilter: false,
  hasSort: false,
  //this is the original data set -- don't mutate it (and yes we should switch to immutable)
  data: [],
  //this is the filtered / sorted data (not paged!)
  visibleData: [],

  pageProperties: { current: 0, max: 0, pageSize: 5},

  sortProperties: { sortColumns: [], sortAscending: true, defaultSortAscending: true }
};

var DataStore = assign({}, StoreBoilerplate, {
  //gets the original, full data-set
  getAllData: function(){
    return _state.data;
  },

  //tries to set the current page
  setCurrentPage: function(pageNumber){
    if(pageNumber > 0 && pageNumber <= _state.pageProperties.maxPage){
      _state.pageProperties.currentPage = pageNumber;
    }
  },

  //this determines whether the data array or visible data array should be used
  showVisibleData: function(){
    if(_state.hasFilter === true){
      return true;
    }
  },

  //this gets the full sorted and filtered dataset
  getAllVisibleData: function(){
    return this.showVisibleData() ? _state.visibleData : _state.data;
  },

  getRangeOfVisibleResults: function(start, end){
    return _.at(this.getAllVisibleData(), _.range((start), end));
  },

  getCurrentPage: function(){
    var initialIndex = _state.pageProperties.current * _state.pageProperties.pageSize;
    return this.getRangeOfVisibleResults(initialIndex, 
      initialIndex + _state.pageProperties.pageSize);
 } 
});

AppDispatcher.register(function(action){
  switch(action.actionType){
    case Constants.GRIDDLE_LOADED_DATA:
      _state.data = action.data;
      var calc = _state.data.length / _state.pageProperties.pageSize
      _state.pageProperties.max = calc > Math.floor(calc) ? Math.floor(calc) + 1 : Math.floor(calc);
      DataStore.emitChange(); 
      break;
    case Constants.GRIDDLE_FILTERED:
      _state.pageProperties.current = 0;
      _state.hasFilter = true; 
      _state.visibleData = DataHelper.sort(
        _state.sortProperties.sortColumns,
        DataHelper.filterAllData(action.filter, _state.data),
        _state.sortProperties.sortAscending);
      DataStore.emitChange(); 
      break;
    case Constants.GRIDDLE_FILTER_REMOVED:
      _state.hasFilter = false;
      DataStore.emitChange();
      break;
    case Constants.GRIDDLE_SET_PAGE_SIZE:
      _state.pageProperties.pageSize = action.pageSize;    
      DataStore.emitChange(); 
      break;
    case Constants.GRIDDLE_NEXT_PAGE:
      if(_state.pageProperties.current < _state.pageProperties.max){
        _state.pageProperties.current++;
        DataStore.emitChange();
      }
      break;
    case Constants.GRIDDLE_PREVIOUS_PAGE:
      if(_state.pageProperties.current > 0){
        _state.pageProperties.current--;
        DataStore.emitChange();
      }
      break;
    case Constants.GRIDDLE_SORT:
      _state.sortProperties.sortColumns = action.sortColumns;
      _state.sortAscending = action.sortAscending||_state.sortProperties.defaultSortAscending;

      _state.visibleData = DataHelper.sort(
        _state.sortProperties.sortColumns,
        DataStore.getVisibleData(), 
        _state.sortAscending
      );
      DataStore.emitChange();
      break;
    case Constants.GRIDDLE_ADD_SORT_COLUMN:
      _state.sortProperties.sortColumns.push(action.sortColumn);
      _state.visibleData = DataHelper.sort(
        _state.sortProperties.sortColumns,
        DataStore.getVisibleData(), 
        _state.sortAscending
      );
      break; 
    case Constants.GRIDDLE_SORT_ORDER_CHANGE:
      _state.sortAscending = !_state.sortAscending; 
      _state.visibleData = DataHelper.reverseSort(DataStore.getVisibleData()); 
      DataStore.emitChange(); 
      break;
    default:
  }

});


module.exports = DataStore; 