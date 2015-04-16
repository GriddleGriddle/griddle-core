var AppDispatcher = require('../dispatcher/app-dispatcher');
var assign = require('object-assign'); 
var DataHelper = require('../helpers/data-helper'); 
var StoreBoilerplate = require('./store-boilerplate'); 
var Constants = require('../constants/constants');
var ScrollStore = require('./scroll-store');

var defaultGridState = {
  hasFilter: false,
  hasSort: false,
  //this is the original data set -- don't mutate it (and yes we should switch to immutable)
  data: [],
  //this is the filtered / sorted data (not paged!)
  visibleData: [],
  // this is the filtered, sorted, and paged data
  currentDataPage: [],

  pageProperties: { currentPage: 0, maxPage: 0, pageSize: 5, initialDisplayIndex: 0, lastDisplayIndex: 0, infiniteScroll: false },

  sortProperties: { sortColumns: [], sortAscending: true, defaultSortAscending: true },

  // scroll properties from the ScrollStore
  scrollProperties: ScrollStore.getScrollProperties()
};

var _state = {};

//these are helpers that have access to the state
var helpers = {
  setCurrentDataPage: function(gridId){
    var initialIndex = _state[gridId].pageProperties.currentPage * _state[gridId].pageProperties.pageSize;

    _state[gridId].pageProperties.lastDisplayIndex = initialIndex + _state[gridId].pageProperties.pageSize;

    // If we're infinite scrolling, set the initial index to 0.
    if (_state[gridId].pageProperties.infiniteScroll) {
      _state[gridId].pageProperties.initialDisplayIndex = 0;
    } else {
      _state[gridId].pageProperties.initialDisplayIndex = initialIndex;
    }

    // Update the initial display index / last index based on what's visible.
    // _state.scrollProperties.;

    _state[gridId].currentDataPage = this.getRangeOfVisibleResults(gridId, _state[gridId].pageProperties.initialDisplayIndex, _state[gridId].pageProperties.lastDisplayIndex);
//    _state[gridId].currentDataPage = this.getRangeOfVisibleResults(gridId, initialIndex, initialIndex + _state[gridId].pageProperties.pageSize);
  },

  setMaxPage: function(gridId){
     _state[gridId].pageProperties.maxPage = DataHelper.getMaxPageSize(_state[gridId].data.length, _state[gridId].pageProperties.pageSize);
     this.setCurrentDataPage(gridId);
  },

  //this gets the full sorted and filtered dataset
  getAllVisibleData: function(gridId){
    return helpers.showVisibleData(gridId) ? _state[gridId].visibleData : _state[gridId].data;
  },

  getRangeOfVisibleResults: function(gridId, start, end){
    return _.at(this.getAllVisibleData(gridId), _.range((start), end));
  },

  //todo: change the name on this
  //this determines whether the data array or visible data array should be used
  showVisibleData: function(gridId){
    if(_state[gridId] && _state[gridId].hasFilter === true){
      return true;
    }
  },

  //tries to set the current page
  setCurrentPage: function(gridId, pageNumber){
    if(pageNumber > 0 && pageNumber <= _state[gridId].pageProperties.maxPage){
      _state[gridId].pageProperties.currentPage = pageNumber;
    }
  },

  filterData: function(gridId, filter){
    _state[gridId].pageProperties.currentPage = 0;
    _state[gridId].hasFilter = true; 
    _state[gridId].visibleData = DataHelper.sort(
      _state[gridId].sortProperties.sortColumns,
      DataHelper.filterAllData(filter, _state[gridId].data),
      _state[gridId].sortProperties.sortAscending
    );

    this.setCurrentDataPage(gridId);  
  },

  sort: function(){
    _state[gridId].visibleData = DataHelper.sort(
      _state[gridId].sortProperties.sortColumns,
      DataStore.getVisibleData(), 
      _state[gridId].sortProperties.sortAscending
    );
  }
};

var DataStore = assign({}, StoreBoilerplate, {
  getState: function(gridId){
    return _state[gridId];
  },

  //gets the original, full data-set
  getAllData: function(gridId){
    return _state[gridId].data;
  },

  //gets the filtered, sorted data-set
  getVisibleData: function(gridId){
    return _state[gridId].visibleData;
  },

  getPageCount: function(gridId){
    return _state[gridId].pageProperties.maxPage; 
  },

  getPageProperties: function(gridId){
    return _state[gridId].pageProperties;  
  }
});

// Register data listener when the scroll properties change.
ScrollStore.addChangeListener(function() {
  _state.scrollProperties = ScrollStore.getScrollProperties();
  helpers.setCurrentDataPage();
  DataStore.emitChange();
});

var registeredCallback = function(action){
  switch(action.actionType){
    case Constants.GRIDDLE_INITIALIZED: 
      //assign new state object
      var state = assign({}, defaultGridState);
      _state[action.gridId] = state; 
      DataStore.emitChange();
      break;
    case Constants.GRIDDLE_REMOVED:
      //remove the item from the hash
      delete _state[action.gridId];
      DataStore.emitChange();
      break;
    case Constants.GRIDDLE_LOADED_DATA:
      _state[action.gridId].data = action.data;
      helpers.setMaxPage(action.gridId); 
      helpers.setCurrentDataPage(action.gridId);
      DataStore.emitChange(); 
      break;
    case Constants.GRIDDLE_FILTERED:
      helpers.filterData(action.gridId, action.filter);
      DataStore.emitChange(); 
      break;
    case Constants.GRIDDLE_FILTER_REMOVED:
      _state[action.gridId].hasFilter = false;
      helpers.setCurrentDataPage(action.gridId);
      DataStore.emitChange();
      break;
    case Constants.GRIDDLE_SET_PAGE_SIZE:
      _state[action.gridId].pageProperties.pageSize = action.pageSize;    
      helpers.setMaxPage(action.gridId);
      helpers.setCurrentDataPage(action.gridId);
      DataStore.emitChange(); 
      break;
    case Constants.GRIDDLE_GET_PAGE:
      if (action.pageNumber >= 0 && action.pageNumber <= _state[action.gridId].pageProperties.maxPage){
        _state[action.gridId].pageProperties.currentPage = action.pageNumber; 
        helpers.setCurrentDataPage(action.gridId);
        DataStore.emitChange(); 
      }
      break;
    case Constants.GRIDDLE_NEXT_PAGE:
      if(_state[action.gridId].pageProperties.currentPage < _state[action.gridId].pageProperties.maxPage-1){
        _state[action.gridId].pageProperties.currentPage++;
        helpers.setCurrentDataPage(action.gridId); 
        DataStore.emitChange();
      }
      break;
    case Constants.GRIDDLE_PREVIOUS_PAGE:
      if(_state[action.gridId].pageProperties.currentPage > 0){
        _state[action.gridId].pageProperties.currentPage--;
        helpers.setCurrentDataPage(action.gridId);
        DataStore.emitChange();
      }
      break;
    case Constants.GRIDDLE_SORT:
      _state[action.gridId].sortProperties.sortColumns = action.sortColumns;
      _state[action.gridId].sortProperties.sortAscending = action.sortAscending||_state[action.gridId].sortProperties.defaultSortAscending;
      helpers.sort(action.gridId);
      DataStore.emitChange();
      break;
    case Constants.GRIDDLE_ADD_SORT_COLUMN:
      _state[action.gridId].sortProperties.sortColumns.push(action.sortColumn);
      _state[action.gridId].visibleData = DataHelper.sort(
        _state[action.gridId].sortProperties.sortColumns,
        DataStore.getVisibleData(action.gridId), 
        _state[action.gridId].sortAscending
      );
      break; 
    case Constants.GRIDDLE_SORT_ORDER_CHANGE:
      _state[action.gridId].sortAscending = !_state[action.gridId].sortAscending; 
      _state[action.gridId].visibleData = DataHelper.reverseSort(DataStore.getVisibleData(action.gridId)); 
      DataStore.emitChange(); 
      break;
    default:
  }

}; 

AppDispatcher.register(registeredCallback);


module.exports = DataStore; 