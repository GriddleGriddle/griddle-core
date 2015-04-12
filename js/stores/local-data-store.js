var AppDispatcher = require('../dispatcher/app-dispatcher');
var assign = require('object-assign'); 
var DataHelper = require('../helpers/data-helper'); 
var StoreBoilerplate = require('./store-boilerplate'); 
var Constants = require('../constants/constants');
var ScrollStore = require('./scroll-store');
var LocalActions = require('../actions/local-action-creators');
var _ = require('lodash');

var _state = {
  hasFilter: false,
  hasSort: false,
  //this is the original data set -- don't mutate it (and yes we should switch to immutable)
  data: [],
  //this is the filtered / sorted data (not paged!)
  visibleData: [],
  // this is the filtered, sorted, and paged data
  currentDataPage: [],

  pageProperties: { currentPage: 0, maxPage: 0, pageSize: 5, initialDisplayIndex: 0, lastDisplayIndex: 0, infiniteScroll: true },

  sortProperties: { sortColumns: [], sortAscending: true, defaultSortAscending: true },

  // Scroll properties from the ScrollStore, cloned for comparison's sake.
  scrollProperties: _.clone(ScrollStore.getScrollProperties())
};

//these are helpers that have access to the state
var helpers = {
  setCurrentDataPage: function(){
    // If we're infinite scrolling, set the initial index to 0.
    if (_state.pageProperties.infiniteScroll) {
      var adjustedHeight = this.getAdjustedRowHeight();
      var visibleRecordCount = Math.ceil(_state.scrollProperties.tableHeight / adjustedHeight);

      // Inspired by : http://jsfiddle.net/vjeux/KbWJ2/9/
      _state.pageProperties.initialDisplayIndex = Math.max(0, Math.floor(_state.scrollProperties.yScrollPosition / adjustedHeight) - visibleRecordCount * 0.25);
      _state.pageProperties.lastDisplayIndex = Math.min(_state.pageProperties.initialDisplayIndex + visibleRecordCount * 1.25, this.getAllVisibleData().length - 1) + 1;
    } else {
      _state.pageProperties.initialDisplayIndex = _state.pageProperties.currentPage * _state.pageProperties.pageSize;
      _state.pageProperties.lastDisplayIndex = initialIndex + _state.pageProperties.pageSize;
    }

    _state.currentDataPage = this.getRangeOfVisibleResults(_state.pageProperties.initialDisplayIndex, _state.pageProperties.lastDisplayIndex);
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
  },
  shouldUpdateDrawnRows: function(oldScrollProperties){
    return Math.abs(oldScrollProperties.yScrollPosition - _state.scrollProperties.yScrollPosition) >= this.getAdjustedRowHeight();
  },
  shouldLoadNewPage: function(){
   // Determine the diff by subtracting the amount scrolled by the total height, taking into consideratoin
   // the spacer's height.
   var scrollHeightDiff = _state.scrollProperties.yScrollMax - (_state.scrollProperties.yScrollPosition + _state.scrollProperties.tableHeight) - _state.scrollProperties.infiniteScrollLoadTreshold;

   // Make sure that we load results a little before reaching the bottom.
   var compareHeight = scrollHeightDiff * 0.6;

    // Send back whether or not we're under the threshold. 
    return compareHeight <= _state.scrollProperties.infiniteScrollLoadTreshold;
  },
  getAdjustedRowHeight: function(){
    return _state.scrollProperties.rowHeight; //+ this.props.paddingHeight * 2; // account for padding.
  },
};

var DataStore = assign({}, StoreBoilerplate, {
  getState: function(){
    return _state;
  },

  //gets the original, full data-set
  getAllData: function(){
    return _state.data;
  },

  //gets the filtered, sorted data-set
  getVisibleData: function(){
    return helpers.getAllVisibleData();
  },

  getCurrentDataPage: function(){
    return _state.currentDataPage;
  },

  getPageCount: function(){
    return _state.pageProperties.maxPage; 
  },

  getPageProperties: function(){
    return _state.pageProperties;
  }
});

// Register data listener when the scroll properties change.
ScrollStore.addChangeListener(function() {
  var oldScrollProperties = _state.scrollProperties;
  _state.scrollProperties = _.clone(ScrollStore.getScrollProperties());

  // If the scroll position changes and the drawn rows need to update, do so.
  if (helpers.shouldUpdateDrawnRows(oldScrollProperties)) {
      helpers.setCurrentDataPage();
      DataStore.emitChange();

      // After emitting the change in data, check to see if we need to load a new page.
      if (_state.pageProperties.infiniteScroll && 
          _state.pageProperties.currentPage != _state.pageProperties.maxPage &&
          helpers.shouldLoadNewPage()) {

        // This seems a little lousy, but it's necessary to fire off another action
        // and it didn't quite make sense for the data store to listen to scroll actions directly.
        _.debounce(LocalActions.loadNext, 1);
      }
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