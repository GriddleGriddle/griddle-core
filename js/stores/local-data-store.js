var AppDispatcher = require('../dispatcher/app-dispatcher');

var DataHelper = require('../helpers/data-helper'); 
var assign = require('object-assign'); 
var EventEmitter = require('eventemitter3').EventEmitter;
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

var DataStore = assign({}, EventEmitter.prototype, {
  //boilerplate
  emitChange: function(){
    this.emit('change'); 
  },

  //boilerplate
  addChangeListener: function(callback){
    this.on('change', callback);
  },

  //boilerplate
  removeChangeListener: function(callback){
    this.removeListener('change', callback);
  }, 

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
  getVisibleData: function(){
    return this.showVisibleData() ? _state.visibleData : _state.data;
  }
});

AppDispatcher.register(function(action){
  switch(action.actionType){
    case "GRIDDLE_LOADED_DATA":
      _state.data = action.data;
      DataStore.emitChange(); 
      break;
    case "GRIDDLE_FILTERED":
      _state.pageProperties.current = 0;
      _state.hasFilter = true; 
      _state.visibleData = DataHelper.sort(
        _state.sortProperties.sortColumns,
        DataHelper.filterAllData(action.filter, _state.data),
        _state.sortProperties.sortAscending);
      DataStore.emitChange(); 
      break;
    case "GRIDDLE_FILTER_REMOVED":
      _state.hasFilter = false;
      DataStore.emitChange();
      break;
    case "GRIDDLE_SET_PAGE_SIZE":
      _state.pageProperties.pageSize = action.pageSize;    
      DataStore.emitChange(); 
      break;
    case "GRIDDLE_NEXT_PAGE":
      DataStore.setCurrentPage(action.page++);
      DataStore.emitChange();
      break;
    case "GRIDDLE_PREVIOUS_PAGE":
      DataStore.setCurrentPage(action.page--);
      DataStore.emitChange();
      break;
    case "GRIDDLE_SORT":
      _state.sortProperties.sortColumns = action.sortColumns;
      _state.sortAscending = action.sortAscending||_state.sortProperties.defaultSortAscending;

      _state.visibleData = DataHelper.sort(
        _state.sortProperties.sortColumns,
        DataStore.getVisibleData(), 
        _state.sortAscending
      );
      DataStore.emitChange();
      break;
    case "GRIDDLE_ADD_SORT_COLUMN":
      _state.sortProperties.sortColumns.push(action.sortColumn);
      _state.visibleData = DataHelper.sort(
        _state.sortProperties.sortColumns,
        DataStore.getVisibleData(), 
        _state.sortAscending
      );
      break; 
    case "GRIDDLE_SORT_ORDER_CHANGE":
      _state.sortAscending = !_state.sortAscending; 
      _state.visibleData = DataHelper.reverseSort(DataStore.getVisibleData()); 
      DataStore.emitChange(); 
      break;
    default:
  }

});


module.exports = DataStore; 