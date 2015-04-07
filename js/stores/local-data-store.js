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

  currentDataPage: [],

  pageProperties: { currentPage: 0, maxPage: 0, pageSize: 5},

  sortProperties: { sortColumns: [], sortAscending: true, defaultSortAscending: true }
};

//these are helpers that have access to the state
var helpers = {
  setCurrentDataPage: function(){
    var initialIndex = _state.pageProperties.currentPage * _state.pageProperties.pageSize;
    _state.currentDataPage = this.getRangeOfVisibleResults(initialIndex, initialIndex + _state.pageProperties.pageSize);
  },

  setMaxPage: function(){
     _state.pageProperties.maxPage = DataHelper.getMaxPageSize(_state.data.length, _state.pageProperties.pageSize);
     this.setCurrentDataPage();
  },

  //this gets the full sorted and filtered dataset
  getAllVisibleData: function(){
    return helpers.showVisibleData() ? _state.visibleData : _state.data;
  },

  getRangeOfVisibleResults: function(start, end){
    return _.at(this.getAllVisibleData(), _.range((start), end));
  },

  //todo: change the name on this
  //this determines whether the data array or visible data array should be used
  showVisibleData: function(){
    if(_state.hasFilter === true){
      return true;
    }
  },

  //tries to set the current page
  setCurrentPage: function(pageNumber){
    if(pageNumber > 0 && pageNumber <= _state.pageProperties.maxPage){
      _state.pageProperties.currentPage = pageNumber;
    }
  },

  filterData: function(filter){
    _state.pageProperties.currentPage = 0;
    _state.hasFilter = true; 
    _state.visibleData = DataHelper.sort(
      _state.sortProperties.sortColumns,
      DataHelper.filterAllData(filter, _state.data),
      _state.sortProperties.sortAscending
    );
    this.setCurrentDataPage();  
  },

  sort: function(){
    _state.visibleData = DataHelper.sort(
      _state.sortProperties.sortColumns,
      DataStore.getVisibleData(), 
      _state.sortProperties.sortAscending
    );
  }
};

var DataStore = assign({}, StoreBoilerplate, {
  getState: function(){
    return _state;
  },

  //gets the original, full data-set
  getAllData: function(){
    return _state.data;
  },

  getPageCount: function(){
    return _state.pageProperties.maxPage; 
  },

  getPageProperties: function(){
    return _state.pageProperties;  
  }
});

AppDispatcher.register(function(action){
  switch(action.actionType){
    case Constants.GRIDDLE_LOADED_DATA:
      _state.data = action.data;
      helpers.setMaxPage(); 
      helpers.setCurrentDataPage();
      DataStore.emitChange(); 
      break;
    case Constants.GRIDDLE_FILTERED:
      helpers.filterData(action.filter);
      DataStore.emitChange(); 
      break;
    case Constants.GRIDDLE_FILTER_REMOVED:
      _state.hasFilter = false;
      helpers.setCurrentDataPage();
      DataStore.emitChange();
      break;
    case Constants.GRIDDLE_SET_PAGE_SIZE:
    debugger;
      _state.pageProperties.pageSize = action.pageSize;    
      helpers.setMaxPage();
      helpers.setCurrentDataPage();
      DataStore.emitChange(); 
      break;
    case Constants.GRIDDLE_GET_PAGE:
      if (action.pageNumber >= 0 && action.pageNumber <= _state.pageProperties.maxPage){
        _state.pageProperties.currentPage = action.pageNumber; 
        helpers.setCurrentDataPage();
        DataStore.emitChange(); 
      }
      break;
    case Constants.GRIDDLE_NEXT_PAGE:
      if(_state.pageProperties.currentPage < _state.pageProperties.maxPage-1){
        _state.pageProperties.currentPage++;
        helpers.setCurrentDataPage(); 
        DataStore.emitChange();
      }
      break;
    case Constants.GRIDDLE_PREVIOUS_PAGE:
      if(_state.pageProperties.currentPage > 0){
        _state.pageProperties.currentPage--;
        helpers.setCurrentDataPage();
        DataStore.emitChange();
      }
      break;
    case Constants.GRIDDLE_SORT:
      _state.sortProperties.sortColumns = action.sortColumns;
      _state.sortProperties.sortAscending = action.sortAscending||_state.sortProperties.defaultSortAscending;
      helpers.sort();
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