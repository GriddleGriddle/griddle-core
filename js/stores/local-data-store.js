var AppDispatcher = require('../dispatcher/app-dispatcher');
var assign = require('object-assign'); 
var DataHelper = require('../helpers/data-helper'); 
var StoreBoilerplate = require('./store-boilerplate'); 
var Constants = require('../constants/constants');
var ScrollStore = require('./scroll-store');
var LocalActions = require('../actions/local-action-creators');
var _ = require('lodash');

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

  // An array of the current visible columns.
  currentVisibleColumns: [],

  visibleColumnProperties: { initialDisplayIndex: 0, lastDisplayIndex : 0 },

  sortProperties: { sortColumns: [], sortAscending: true, defaultSortAscending: true }

  /* Properties added after initialization :

     scrollProperties
  */
};

var _state = {};

//these are helpers that have access to the state
var helpers = {
  setCurrentDataPage: function(gridId){
    // If we're infinite scrolling, set the initial index to 0.
    if (_state[gridId].pageProperties.infiniteScroll) {
      var adjustedHeight = this.getAdjustedRowHeight(gridId);
      var visibleRecordCount = Math.ceil(_state[gridId].scrollProperties.tableHeight / adjustedHeight);

      // Inspired by : http://jsfiddle.net/vjeux/KbWJ2/9/
      _state[gridId].pageProperties.initialDisplayIndex = Math.max(0, Math.floor(_state[gridId].scrollProperties.yScrollPosition / adjustedHeight) - visibleRecordCount * 0.25);
      _state[gridId].pageProperties.lastDisplayIndex = Math.min(_state[gridId].pageProperties.initialDisplayIndex + visibleRecordCount * 1.25, this.getAllVisibleData(gridId).length - 1) + 1;
    } else {
      _state[gridId].pageProperties.initialDisplayIndex = _state[gridId].pageProperties.currentPage * _state[gridId].pageProperties.pageSize;
      _state[gridId].pageProperties.lastDisplayIndex = _state[gridId].pageProperties.initialDisplayIndex + _state[gridId].pageProperties.pageSize;
    }

    _state[gridId].currentDataPage = this.getRangeOfVisibleResults(gridId, _state[gridId].pageProperties.initialDisplayIndex, _state[gridId].pageProperties.lastDisplayIndex);
  },

  setVisibleColumns: function(gridId){
    if (_state[gridId].data.length > 0) {
      var availableColumns = Object.keys(_state[gridId].data[0]);
      _state[gridId].currentVisibleColumns = _.at(availableColumns, _.range(_state[gridId].visibleColumnProperties.initialDisplayIndex, _state[gridId].visibleColumnProperties.lastDisplayIndex));
    } else {
      _state[gridId].currentVisibleColumns = [];
    }
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
    return _.at(this.getAllVisibleData(gridId), _.range(start, end));
  },

  //todo: change the name on this
  //this determines whether the data array or visible data array should be used
  showVisibleData: function(gridId){
    if(_state[gridId] && _state[gridId].hasFilter === true){
      return true;
    }
  },

  getGrid: function(gridId){
    return _state[gridId];
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
  },

  shouldUpdateDrawnRows: function(oldScrollProperties, gridId){
    return oldScrollProperties === undefined ||
           Math.abs(oldScrollProperties.yScrollPosition - _state[gridId].scrollProperties.yScrollPosition) >= this.getAdjustedRowHeight(gridId);
  },

  shouldUpdateDrawnColumns: function(oldVisibleColumnProperties, gridId){
    return oldVisibleColumnProperties === undefined ||
           _state[gridId].visibleColumnProperties.initialDisplayIndex != oldVisibleColumnProperties.initialDisplayIndex ||
           _state[gridId].visibleColumnProperties.lastDisplayIndex != oldVisibleColumnProperties.lastDisplayIndex;
  },

  updateVisibleColumnProperties: function(gridId){
    if (_state[gridId].data && _state[gridId].data.length > 0){
      // Load the width of the columns.
      var columnWidth = helpers.getAdjustedColumnWidth(gridId);
      var availableColumns = Object.keys(_state[gridId].data[0]);

      // Update the indexes.
      _state[gridId].visibleColumnProperties.initialDisplayIndex = Math.floor(_state[gridId].scrollProperties.xScrollPosition / columnWidth) - 1;
      _state[gridId].visibleColumnProperties.lastDisplayIndex = Math.ceil((_state[gridId].visibleColumnProperties.initialDisplayIndex + _state[gridId].scrollProperties.tableWidth) / columnWidth) + 1;

      // Make sure that the first index is at least 0.
      if (_state[gridId].visibleColumnProperties.initialDisplayIndex < 0){
        _state[gridId].visibleColumnProperties.initialDisplayIndex = 0;
      }
      // If there aren't enough available columns, set to the max length of properties. 
      if (availableColumns.length < _state[gridId].visibleColumnProperties.lastDisplayIndex){
        _state[gridId].visibleColumnProperties.lastDisplayIndex = availableColumns.length;
      }
    } else {
      // Set indexes to '0' if there's no data.
      _state[gridId].visibleColumnProperties.initialDisplayIndex = _state[gridId].visibleColumnProperties.lastDisplayIndex = 0;
    }
  },

  shouldLoadNewPage: function(gridId){
   // Determine the diff by subtracting the amount scrolled by the total height, taking into consideratoin
   // the spacer's height.
   var scrollHeightDiff = _state[gridId].scrollProperties.yScrollMax - (_state[gridId].scrollProperties.yScrollPosition + _state[gridId].scrollProperties.tableHeight) - _state[gridId].scrollProperties.infiniteScrollLoadTreshold;

   // Make sure that we load results a little before reaching the bottom.
   var compareHeight = scrollHeightDiff * 0.6;

    // Send back whether or not we're under the threshold. 
    return compareHeight <= _state[gridId].scrollProperties.infiniteScrollLoadTreshold;
  },

  getAdjustedRowHeight: function(gridId){
    return _state[gridId].scrollProperties.rowHeight; //+ this.props.paddingHeight * 2; // account for padding.
  },

  getAdjustedColumnWidth: function(gridId){
    return _state[gridId].scrollProperties.columnWidth; //+ this.props.paddingHeight * 2; // account for padding.
  },

  columnsHaveUpdated: function(gridId){
     // Compute the new visible column properties.
    var oldColumnProperties = _.clone(_state[gridId].visibleColumnProperties);
    helpers.updateVisibleColumnProperties(gridId);

    if (helpers.shouldUpdateDrawnColumns(oldColumnProperties, gridId)){
      helpers.setVisibleColumns(gridId);
      return true;
    } else {
      return false;
    }
  },

  rowsHaveUpdated: function(gridId, oldScrollProperties){
    // If the scroll position changes and the drawn rows need to update, do so.
    if (helpers.shouldUpdateDrawnRows(oldScrollProperties, gridId)){
      // Update the current displayed rows
      helpers.setCurrentDataPage(gridId);
      return true;
    } else {
      return false;
    }
  },

  scrollStoreListener: function(gridId){
    // Load the new scrollProperties
    var oldScrollProperties = _state[gridId].scrollProperties;
    _state[gridId].scrollProperties = _.clone(ScrollStore.getScrollProperties(gridId));
    if (helpers.rowsHaveUpdated(gridId, oldScrollProperties) || helpers.columnsHaveUpdated(gridId)) {
      DataStore.emitChange();

      // After emitting the change in data, check to see if we need to load a new page.
      if (_state[gridId].pageProperties.infiniteScroll && 
          _state[gridId].pageProperties.currentPage != _state[gridId].pageProperties.maxPage &&
          helpers.shouldLoadNewPage(gridId)) {

        // This seems a little lousy, but it's necessary to fire off another action
        // and it didn't quite make sense for the data store to listen to scroll actions directly.
        _.debounce(function(){
          LocalActions.loadNext(gridId);
        }, 1);
      }
    }
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
    return helpers.getAllVisibleData(gridId);
  },

  getCurrentDataPage: function(gridId){
    return _state[gridId].currentDataPage;
  },

  getPageCount: function(gridId){
    return _state[gridId].pageProperties.maxPage; 
  },

  getPageProperties: function(gridId){
    return _state[gridId].pageProperties;
  },

  dispatchToken: AppDispatcher.register(function(action){
    switch(action.actionType){
      case Constants.GRIDDLE_INITIALIZED: 
        //assign new state object
        var state = assign({}, defaultGridState);
        _state[action.gridId] = state;

        // Wait for a scroll store to finish initializing
        AppDispatcher.waitFor([ScrollStore.dispatchToken]);

        // Set the initial scroll properties.
        _state[action.gridId].scrollProperties = _.clone(ScrollStore.getScrollProperties(action.gridId));

        // Register data listener when the scroll properties change.
        _state[action.gridId].scrollStoreListener = function(){
          helpers.scrollStoreListener(action.gridId);
        }
        ScrollStore.addChangeListener(_state[action.gridId].scrollStoreListener);

        DataStore.emitChange();
        break;
      case Constants.GRIDDLE_REMOVED:
        // Remove the listener
        ScrollStore.removeChangeListener(_state[action.gridId].scrollStoreListener);

        //remove the item from the hash
        delete _state[action.gridId];

        DataStore.emitChange();
        break;
      case Constants.GRIDDLE_LOADED_DATA:
        _state[action.gridId].data = action.data;
        helpers.setMaxPage(action.gridId); 
        helpers.setCurrentDataPage(action.gridId);
        helpers.updateVisibleColumnProperties(action.gridId);
        helpers.setVisibleColumns(action.gridId);
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
  })
});

module.exports = DataStore; 